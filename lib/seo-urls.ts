export const CANONICAL_ORIGIN = "https://www.missusoutfits.com";
export const CATEGORY_ALIASES: Record<string, string> = {
    "shop-all": "/shop", "whats-new": "/new-in", "discount-sale": "/sale",
};
export function categoryPath(slug: string): string {
    return CATEGORY_ALIASES[slug] || `/category/${slug}`;
}
/** Normalize storefront links, including links supplied by WordPress. */
export function canonicalLink(href: string): string {
    const url = new URL(href, CANONICAL_ORIGIN);
    if (!["missusoutfits.com", "www.missusoutfits.com"].includes(url.hostname)) return href;
    const slug = url.pathname.match(/^\/category\/([^/]+)\/?$/)?.[1];
    if (slug) url.pathname = categoryPath(slug);
    return `${url.pathname}${url.search}${url.hash}`;
}
