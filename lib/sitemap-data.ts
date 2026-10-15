import "server-only";
import { API_ENDPOINTS, WP_FETCH_TIMEOUT, WP_HEADERS } from "./config";

interface SitemapProduct {
    slug: string;
    date_modified_gmt?: string;
    catalog_visibility: string;
}

/** REST API supplies modification dates that the public Store API omits. */
export async function getSitemapProducts(): Promise<SitemapProduct[]> {
    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;
    if (!key || !secret) throw new Error("Sitemap requires WooCommerce read credentials for real modification dates.");
    const products: SitemapProduct[] = [];
    let totalPages = 1;
    let fetched = 0;
    let expectedTotal: number | undefined;
    for (let page = 1; page <= totalPages; page++) {
        const query = new URLSearchParams({ status: "publish", per_page: "100", page: String(page), orderby: "id", order: "asc", _fields: "slug,date_modified_gmt,catalog_visibility" });
        const response = await fetch(`${API_ENDPOINTS.woocommerce.rest}/products?${query}`, {
            headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` },
            cache: "no-store", signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
        });
        if (!response.ok) throw new Error(`Sitemap product request failed (${response.status}).`);
        const batch: SitemapProduct[] = await response.json();
        if (!Array.isArray(batch) || batch.some(p => !p.slug || !p.catalog_visibility)) throw new Error("Invalid sitemap product response.");
        const pages = response.headers.get("x-wp-totalpages");
        totalPages = pages ? Number(pages) : (batch.length === 100 ? page + 1 : page);
        if (!Number.isInteger(totalPages) || totalPages < 0) throw new Error("Invalid sitemap pagination.");
        const total = response.headers.get("x-wp-total");
        if (total !== null) {
            if (!Number.isInteger(Number(total)) || Number(total) < 0) throw new Error("Invalid sitemap product count.");
            if (expectedTotal !== undefined && expectedTotal !== Number(total)) throw new Error("Catalog changed during sitemap pagination; retrying later.");
            expectedTotal = Number(total);
        }
        fetched += batch.length;
        products.push(...batch.filter(p => p.catalog_visibility !== "hidden"));
    }
    if (expectedTotal !== undefined && fetched !== expectedTotal) throw new Error("Incomplete sitemap product snapshot.");
    if (new Set(products.map(p => p.slug)).size !== products.length) throw new Error("Duplicate products in sitemap snapshot.");
    return products;
}

export function modificationDate(value?: string): string | undefined {
    if (!value) return undefined;
    const date = new Date(/(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function getSitemapCategories(): Promise<Array<{ slug: string; count: number }>> {
    const categories: Array<{ slug: string; count: number }> = [];
    for (let page = 1; ; page++) {
        const response = await fetch(`${API_ENDPOINTS.woocommerce.store}/products/categories?per_page=100&page=${page}`, {
            headers: WP_HEADERS, cache: "no-store", signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
        });
        if (!response.ok) throw new Error(`Sitemap category request failed (${response.status}).`);
        const batch: Array<{ slug: string; count: number }> = await response.json();
        if (!Array.isArray(batch) || batch.some(c => !c.slug || !Number.isInteger(c.count))) throw new Error("Invalid sitemap category response.");
        categories.push(...batch.filter(c => c.count > 0 && c.slug !== "uncategorized"));
        const pages = response.headers.get("x-wp-totalpages");
        if (pages ? page >= Number(pages) : batch.length < 100) break;
    }
    return categories;
}
