import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

const WP_API = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const MAX_PAYLOAD_BYTES = 512 * 1024;

// On Vercel (and serverless in general) only /tmp is writable.
// In dev, write next to the project so it persists across restarts.
const DATA_DIR = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? "/tmp"
    : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "homepage-content.json");

/** Write to local JSON file — primary storage in production, fallback in dev */
function writeJsonFile(data: unknown) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
        console.error("[homepage] writeJsonFile failed:", err);
        throw err; // re-throw so the POST handler can respond with a real error
    }
}

function readJsonFile(): Record<string, unknown> | null {
    try {
        if (!fs.existsSync(DATA_FILE)) return null;
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed;
        }
    } catch { /* ignore */ }
    return null;
}

function wcAuth(): Record<string, string> {
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

function wpAuth(): Record<string, string> {
    if (WP_APP_PASSWORD) {
        const colonIdx = WP_APP_PASSWORD.indexOf(":");
        if (colonIdx !== -1) {
            const username = WP_APP_PASSWORD.slice(0, colonIdx);
            const password = WP_APP_PASSWORD.slice(colonIdx + 1).trim(); // keep internal spaces
            const auth = Buffer.from(`${username}:${password}`).toString("base64");
            return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
        }
    }
    return wcAuth();
}

async function getPostId(): Promise<number | null> {
    const endpoints = [
        `${WP_API}/wp/v2/homepage-settings?per_page=1&_fields=id`,
        `${WP_API}/wp/v2/homepage_settings?per_page=1&_fields=id`,
    ];
    for (const url of endpoints) {
        try {
            const res = await fetch(url, { headers: wcAuth(), cache: "no-store" });
            if (res.ok) {
                const posts = await res.json();
                if (posts?.[0]?.id) return posts[0].id;
            }
        } catch { /* try next */ }
    }
    return null;
}

export async function GET() {
    // Always try the local JSON file first — it's the authoritative source
    // (written on every successful save, whether via WP or direct)
    const saved = readJsonFile();
    if (saved) return NextResponse.json(saved);

    // Fallback: try WordPress ACF
    try {
        const res = await fetch(`${WP_API}/wp/v2/homepage-settings?per_page=1&_fields=acf`, {
            headers: wcAuth(),
            cache: "no-store",
        });
        if (!res.ok) return NextResponse.json({});
        const posts = await res.json();
        if (!Array.isArray(posts) || posts.length === 0) return NextResponse.json({});

        const acf = posts[0]?.acf ?? {};
        const safeJson = (v: string, fallback: unknown) => { try { return JSON.parse(v); } catch { return fallback; } };

        // Only return WP data if at least one field is non-empty
        const hasData = Object.values(acf).some((v) => v && v !== "");
        if (!hasData) return NextResponse.json({});

        return NextResponse.json({
            announcement: acf.hp_announcement || "",
            marquee: safeJson(acf.hp_marquee, []),
            hero: safeJson(acf.hp_hero, []),
            styleRadar: safeJson(acf.hp_style_radar, []),
            newsletter: { heading: acf.hp_nl_heading || "", sub: acf.hp_nl_sub || "" },
        });
    } catch {
        return NextResponse.json({});
    }
}

export async function POST(req: NextRequest) {
    const authError = await requireAdminAuth(req);
    if (authError) return authError;

    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_BYTES) {
        return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }

    try {
        const body = await req.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
        }

        // Always write to JSON file — this is our primary storage
        // The homepage reads this file first on every request
        writeJsonFile(body);
        revalidatePath("/");

        // Also attempt to sync to WordPress in the background (best-effort)
        // Failure here does NOT fail the save — JSON file is the source of truth
        const acfPayload = {
            acf: {
                hp_announcement: body.announcement ?? "",
                hp_marquee: JSON.stringify(body.marquee ?? []),
                hp_hero: JSON.stringify(body.hero ?? []),
                hp_style_radar: JSON.stringify(body.styleRadar ?? []),
                hp_nl_heading: body.newsletter?.heading ?? "",
                hp_nl_sub: body.newsletter?.sub ?? "",
            },
        };

        (async () => {
            try {
                const postId = await getPostId();
                if (!postId) return;
                await fetch(`${WP_API}/wp/v2/homepage-settings/${postId}`, {
                    method: "POST",
                    headers: wpAuth(),
                    body: JSON.stringify(acfPayload),
                    signal: AbortSignal.timeout(8000),
                });
            } catch { /* WP sync is optional — JSON file is already written */ }
        })();

        return NextResponse.json({ ok: true, source: "json_file" });
    } catch (err) {
        console.error("[homepage POST] error:", err);
        const msg = err instanceof Error ? err.message : "Failed to save.";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
