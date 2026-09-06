// Server-only — fetches homepage content.
// Priority: local JSON file → WordPress ACF → hardcoded defaults
import "server-only";
import { HOMEPAGE_DEFAULTS, type HomepageContent } from "./homepage-content";

const WP_API = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

// Match the data file path logic from the API route
const DATA_DIR = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? "/tmp"
    : require("path").join(process.cwd(), "data");
const DATA_FILE = require("path").join(DATA_DIR, "homepage-content.json");

function wcAuth(): Record<string, string> {
    if (!WC_KEY || !WC_SECRET) return {};
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}` };
}

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
}

function readSavedJson(): Partial<HomepageContent> | null {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require("fs") as typeof import("fs");
        if (!fs.existsSync(DATA_FILE)) return null;
        const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
}

export async function getHomepageContent(): Promise<HomepageContent> {
    // ── Layer 1: local JSON file (written by admin on every save) ─────────
    try {
        const saved = readSavedJson();
        if (saved) {
            return { ...HOMEPAGE_DEFAULTS, ...saved };
        }
    } catch { /* fall through */ }

    // ── Layer 2: WordPress ACF ────────────────────────────────────────────
    try {
        const res = await fetch(
            `${WP_API}/wp/v2/homepage-settings?per_page=1&_fields=acf`,
            {
                headers: { ...wcAuth(), "Content-Type": "application/json" },
                cache: "no-store",
            }
        );

        if (res.ok) {
            const posts = await res.json();
            if (Array.isArray(posts) && posts.length > 0) {
                const acf = posts[0]?.acf ?? {};
                const hasData = Object.values(acf).some((v) => v && v !== "");
                if (hasData) {
                    return {
                        announcement: acf.hp_announcement || HOMEPAGE_DEFAULTS.announcement,
                        marquee: safeJson(acf.hp_marquee, HOMEPAGE_DEFAULTS.marquee),
                        hero: safeJson(acf.hp_hero, HOMEPAGE_DEFAULTS.hero),
                        styleRadar: safeJson(acf.hp_style_radar, HOMEPAGE_DEFAULTS.styleRadar),
                        newsletter: {
                            heading: acf.hp_nl_heading || HOMEPAGE_DEFAULTS.newsletter.heading,
                            sub: acf.hp_nl_sub || HOMEPAGE_DEFAULTS.newsletter.sub,
                        },
                    };
                }
            }
        }
    } catch {
        // WP unreachable — fall through
    }

    // ── Layer 3: hardcoded defaults ───────────────────────────────────────
    return HOMEPAGE_DEFAULTS;
}
