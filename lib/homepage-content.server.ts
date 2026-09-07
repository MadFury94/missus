import "server-only";
import { cache } from "react";
import { HOMEPAGE_DEFAULTS, type HomepageContent } from "./homepage-content";

const WP_API = (process.env.WP_API_URL || "https://missusoutfits.com/wp-json").replace(/\/$/, "");

function wpHeaders(write = false): Record<string, string> {
    const credentials = process.env.WP_APP_PASSWORD;
    if (credentials && credentials.indexOf(":") > 0) {
        return { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(credentials.trim()).toString("base64")}` };
    }
    if (write) throw new Error("Configure WP_APP_PASSWORD as username:application-password to save homepage content.");
    return { "Content-Type": "application/json" };
}

async function wpRequest(url: string, init: RequestInit = {}) {
    const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`WordPress homepage request failed (${response.status}). Check WordPress permissions and ACF REST API settings.`);
    return response.json();
}

async function getHomepagePost() {
    for (const slug of ["homepage-settings", "homepage_settings"]) {
        const url = `${WP_API}/wp/v2/${slug}`;
        const response = await fetch(`${url}?per_page=1&_fields=id,acf`, {
            headers: wpHeaders(), cache: "no-store", signal: AbortSignal.timeout(12000),
        });
        if (response.status === 404) continue;
        if (!response.ok) throw new Error(`Could not load WordPress homepage settings (${response.status}).`);
        const posts = await response.json();
        if (!Array.isArray(posts)) throw new Error("WordPress returned invalid homepage settings.");
        if (!posts.length) continue;
        const post = posts[0];
        if (!post.id) throw new Error("WordPress homepage settings are missing a post ID.");
        if (!post.acf || typeof post.acf !== "object" || !Object.keys(post.acf).length) {
            throw new Error("Homepage ACF fields are unavailable. Enable Show in REST API for the homepage field group in WordPress.");
        }
        return { url: `${url}/${post.id}`, acf: post.acf as Record<string, unknown> };
    }
    throw new Error("No published homepage settings found in WordPress.");
}

function jsonField<T>(value: unknown, fallback: T): T {
    if (value === undefined || value === null || value === "") return fallback;
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) throw new Error("A homepage ACF list contains invalid JSON.");
    return parsed as T;
}

function decodeContent(acf: Record<string, unknown>): HomepageContent {
    const text = (key: string, fallback: string) => typeof acf[key] === "string" ? acf[key] as string : fallback;
    return {
        announcement: text("hp_announcement", HOMEPAGE_DEFAULTS.announcement),
        marquee: jsonField(acf.hp_marquee, HOMEPAGE_DEFAULTS.marquee),
        hero: jsonField(acf.hp_hero, HOMEPAGE_DEFAULTS.hero),
        styleRadar: jsonField(acf.hp_style_radar, HOMEPAGE_DEFAULTS.styleRadar),
        newsletter: {
            heading: text("hp_nl_heading", HOMEPAGE_DEFAULTS.newsletter.heading),
            sub: text("hp_nl_sub", HOMEPAGE_DEFAULTS.newsletter.sub),
        },
    };
}

// Surface read errors in the editor so defaults cannot silently overwrite saved content.
export async function readHomepageContent(): Promise<HomepageContent> {
    return decodeContent((await getHomepagePost()).acf);
}

export async function saveHomepageContent(content: HomepageContent): Promise<void> {
    const headers = wpHeaders(true);
    const post = await getHomepagePost();
    const acf = {
        hp_announcement: content.announcement,
        hp_marquee: JSON.stringify(content.marquee),
        hp_hero: JSON.stringify(content.hero),
        hp_style_radar: JSON.stringify(content.styleRadar),
        hp_nl_heading: content.newsletter.heading,
        hp_nl_sub: content.newsletter.sub,
    };
    await wpRequest(post.url, { method: "POST", headers, body: JSON.stringify({ acf }) });
    const saved = await wpRequest(`${post.url}?_fields=acf`, { headers });
    if (!saved.acf || Object.entries(acf).some(([key, value]) => saved.acf[key] !== value)) {
        throw new Error("WordPress did not retain all homepage changes. Check the homepage ACF fields and enable Show in REST API.");
    }
}

// Memoize within a render so the layout and page share one read, without stale storage.
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
    try {
        return await readHomepageContent();
    } catch (error) {
        console.error("[homepage] Could not read WordPress content:", error);
        return HOMEPAGE_DEFAULTS;
    }
});
