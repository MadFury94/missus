import "server-only";
import { canonicalLink } from "./seo-urls";
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import { connection } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { HOMEPAGE_DEFAULTS, type HomepageContent } from "./homepage-content";
import { API_ENDPOINTS, WP_HEADERS } from "./config";
import { getCategories } from "./woocommerce";

function wpHeaders(write = false): Record<string, string> {
    // Published homepage fields are public. Do not make storefront reads depend
    // on application-password authentication or authenticated-request filters.
    if (!write) return { Accept: "application/json" };
    const credentials = process.env.WP_APP_PASSWORD;
    if (credentials && credentials.indexOf(":") > 0) {
        return { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(credentials.trim()).toString("base64")}` };
    }
    throw new Error("Configure WP_APP_PASSWORD as username:application-password to save homepage content.");
}

async function wpRequest(url: string, init: RequestInit = {}) {
    const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`WordPress homepage request failed (${response.status}). Check WordPress permissions and ACF REST API settings.`);
    return response.json();
}

async function getHomepagePost() {
    for (const slug of ["homepage-settings", "homepage_settings"]) {
        const url = `${API_ENDPOINTS.wordpress.core}/wp/v2/${slug}`;
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

function jsonObjectField<T extends object>(value: unknown, fallback: T): T {
    if (value === undefined || value === null || value === "") return fallback;
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("A homepage ACF object contains invalid JSON.");
    }
    return parsed as T;
}

function decodeContent(acf: Record<string, unknown>): HomepageContent {
    const text = (key: string, fallback: string) => typeof acf[key] === "string" ? acf[key] as string : fallback;
    const categories = jsonObjectField(acf.hp_categories, HOMEPAGE_DEFAULTS.categories);
    const promoBand = jsonObjectField(acf.hp_promo_band, HOMEPAGE_DEFAULTS.promoBand);
    return {
        announcement: text("hp_announcement", HOMEPAGE_DEFAULTS.announcement),
        marquee: jsonField(acf.hp_marquee, HOMEPAGE_DEFAULTS.marquee),
        hero: jsonField(acf.hp_hero, HOMEPAGE_DEFAULTS.hero),
        styleRadar: jsonField(acf.hp_style_radar, HOMEPAGE_DEFAULTS.styleRadar),
        categories: {
            ...HOMEPAGE_DEFAULTS.categories,
            ...categories,
            giftBox: {
                ...HOMEPAGE_DEFAULTS.categories.giftBox,
                ...(categories as Partial<HomepageContent["categories"]>).giftBox,
            },
        },
        promoBand: {
            ...HOMEPAGE_DEFAULTS.promoBand,
            ...promoBand,
        },
        newsletter: {
            heading: text("hp_nl_heading", HOMEPAGE_DEFAULTS.newsletter.heading),
            sub: text("hp_nl_sub", HOMEPAGE_DEFAULTS.newsletter.sub),
        },
    };
}

// Surface read errors in the editor so defaults cannot silently overwrite saved content.
export async function readHomepageContent(): Promise<HomepageContent> {
    const content = decodeContent((await getHomepagePost()).acf);
    content.hero = content.hero.map(slide => ({ ...slide, cta: { ...slide.cta, href: canonicalLink(slide.cta.href) }, ...(slide.cta2 ? { cta2: { ...slide.cta2, href: canonicalLink(slide.cta2.href) } } : {}) }));
    content.styleRadar = content.styleRadar.map(card => ({ ...card, href: canonicalLink(card.href) }));

    // Homepage cards historically stored their own ACF image URLs, while the
    // search overlay reads the live WooCommerce category image. Prefer the
    // live category image when one exists so a WordPress category-image edit
    // updates both surfaces without requiring a second homepage edit.
    try {
        const categories = await getCategories();
        const bySlug = new Map(categories.map((category) => [category.slug, category.image?.src]));
        const imageFor = (href: string, fallback: string) => {
            const slug = href.match(/\/category\/([^/?#]+)/)?.[1];
            return (slug && bySlug.get(slug)) || fallback;
        };
        return {
            ...content,
            categories: {
                ...content.categories,
                feature: { ...content.categories.feature, img: imageFor(content.categories.feature.href, content.categories.feature.img), href: canonicalLink(content.categories.feature.href) },
                grid: content.categories.grid.map((category) => ({
                    ...category,
                    img: imageFor(category.href, category.img), href: canonicalLink(category.href),
                })),
                // giftBox is not a WooCommerce category — preserve it exactly as saved in the CMS
                giftBox: content.categories.giftBox,
            },
        };
    } catch {
        // Keep the saved homepage images as a resilient fallback if WooCommerce
        // is temporarily unavailable.
        return content;
    }
}

export async function saveHomepageContent(content: HomepageContent): Promise<void> {
    const headers = wpHeaders(true);
    const post = await getHomepagePost();
    const acf = {
        hp_announcement: content.announcement,
        hp_marquee: JSON.stringify(content.marquee),
        hp_hero: JSON.stringify(content.hero),
        hp_style_radar: JSON.stringify(content.styleRadar),
        hp_categories: JSON.stringify(content.categories),
        hp_promo_band: JSON.stringify(content.promoBand),
        hp_nl_heading: content.newsletter.heading,
        hp_nl_sub: content.newsletter.sub,
    };
    await wpRequest(post.url, { method: "POST", headers, body: JSON.stringify({ acf }) });
    const saved = await wpRequest(`${post.url}?_fields=acf`, { headers });
    if (!saved.acf || Object.entries(acf).some(([key, value]) => saved.acf[key] !== value)) {
        throw new Error("WordPress did not retain all homepage changes. Check the homepage ACF fields and enable Show in REST API.");
    }
    revalidateTag("homepage-content");
}

const readCachedHomepage = unstable_cache(readHomepageContent,
    ["missus-homepage-v2", API_ENDPOINTS.wordpress.core],
    { revalidate: 60, tags: ["homepage-content"] });

// Preserve request-time rendering while sharing persistent last-successful CMS
// data. Defaults apply only when no successful homepage read has been cached.
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
    await connection();
    try {
        return await readCachedHomepage();
    } catch (error) {
        // Re-throw Next.js navigation signals (redirect, notFound) — never swallow those.
        unstable_rethrow(error);
        // Everything else: log and fall back to defaults so the homepage always renders.
        console.error("[homepage] Could not read WordPress content, using defaults:", error);
        return HOMEPAGE_DEFAULTS;
    }
});
