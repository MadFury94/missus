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
const DATA_FILE = path.join(process.cwd(), "data", "homepage-content.json");

/** Dev fallback — write to local JSON when WP is unreachable */
function writeJsonFallback(data: unknown) {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch { /* ignore */ }
}

function wcAuth() {
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

function wpAuth() {
    if (WP_APP_PASSWORD) {
        const [username, ...rest] = WP_APP_PASSWORD.split(":");
        const password = rest.join(":").replace(/\s/g, "");
        const auth = Buffer.from(`${username}:${password}`).toString("base64");
        return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
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
    // In dev, WP is unreachable — read from the local JSON file fallback
    if (process.env.NODE_ENV === "development") {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
                if (saved && Object.keys(saved).length > 0) {
                    return NextResponse.json(saved);
                }
            }
        } catch { /* fall through to WP */ }
    }

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

        // Dev: WP is unreachable — write to JSON file and revalidate
        if (process.env.NODE_ENV === "development") {
            writeJsonFallback(body);
            revalidatePath("/");
            return NextResponse.json({ ok: true, source: "json_fallback" });
        }

        // Production: write to WordPress
        const postId = await getPostId();
        if (!postId) {
            return NextResponse.json({ error: "Homepage settings post not found in WordPress." }, { status: 404 });
        }

        const res = await fetch(`${WP_API}/wp/v2/homepage-settings/${postId}`, {
            method: "POST",
            headers: wpAuth(),
            body: JSON.stringify(acfPayload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("[homepage save] WP error:", res.status, err);
            return NextResponse.json({ error: err.message || "WordPress update failed.", wp_status: res.status }, { status: res.status });
        }

        revalidatePath("/");
        return NextResponse.json({ ok: true, source: "wordpress" });
    } catch {
        return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }
}
