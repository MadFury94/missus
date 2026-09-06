// Server-only — fetches homepage content from WordPress ACF via REST API.
// Fallback chain: WordPress ACF → saved JSON file → hardcoded HOMEPAGE_DEFAULTS
import "server-only";
import { HOMEPAGE_DEFAULTS, type HomepageContent } from "./homepage-content";

const WP_API = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

function wcAuth() {
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
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require("path") as typeof import("path");
        const file = path.join(process.cwd(), "data", "homepage-content.json");
        if (!fs.existsSync(file)) return null;
        return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
        return null;
    }
}

export async function getHomepageContent(): Promise<HomepageContent> {
    // ── Layer 1: WordPress ACF ────────────────────────────────────────────
    try {
        const res = await fetch(
            `${WP_API}/wp/v2/homepage-settings?per_page=1&_fields=acf`,
            {
                headers: { ...wcAuth(), "Content-Type": "application/json" },
                next: { revalidate: 30 },
            }
        );

        if (res.ok) {
            const posts = await res.json();
            if (Array.isArray(posts) && posts.length > 0) {
                const acf = posts[0]?.acf ?? {};
                // Always use WP data, merging with defaults for any empty fields
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
    } catch {
        // WP unreachable — fall through
    }

    // ── Layer 2: saved JSON file (localhost dev fallback) ─────────────────
    try {
        const saved = readSavedJson();
        if (saved && Object.keys(saved).length > 0) {
            return { ...HOMEPAGE_DEFAULTS, ...saved };
        }
    } catch {
        // filesystem unavailable — fall through
    }

    // ── Layer 3: hardcoded defaults ───────────────────────────────────────
    return HOMEPAGE_DEFAULTS;
}
