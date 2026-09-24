import { API_ENDPOINTS, WP_HEADERS, WP_FETCH_TIMEOUT } from "./config";
import { IS_DEMO_STORE } from "./store-config";
import { demoStoreRead } from "./demo-store";

// ── Fetch helper ──────────────────────────────────────────────────────────

async function storeFetch<T>(path: string, revalidate = 60): Promise<T | null> {
    if (IS_DEMO_STORE) return demoStoreRead<T>(path);
    try {
        const res = await fetch(`${API_ENDPOINTS.woocommerce.store}${path}`, {
            next: { revalidate },
            headers: WP_HEADERS,
            signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
        });
        if (!res.ok) {
            console.warn(`Store API error: ${res.status} ${path}`);
            return null;
        }
        return res.json() as Promise<T>;
    } catch (err) {
        console.warn("Store API fetch failed:", err);
        return null;
    }
}

export interface StoreProduct {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    type: string;
    short_description: string;
    description: string;
    on_sale: boolean;
    prices: {
        price: string;           // in minor units (kobo) — divide by 100
        regular_price: string;
        sale_price: string;
        currency_symbol: string;
        currency_minor_unit: number;
    };
    price_html: string;
    average_rating: string;
    review_count: number;
    images: { id: number; src: string; thumbnail: string; alt: string }[];
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    attributes: { id: number; name: string; taxonomy: string; has_variations: boolean; terms: { id: number; name: string; slug: string }[] }[];
    variations: { id: number; attributes: { name: string; value: string }[] }[];
    is_in_stock?: boolean;
    stock_status: string;
    stock_quantity: number | null;
    backorders_allowed?: boolean;
    is_on_backorder?: boolean;
    sku: string;
}

export interface StoreCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent: number;
    count: number;
    image: { src: string; thumbnail: string; alt: string } | null;
    permalink: string;
}

// ── Price helpers ─────────────────────────────────────────────────────────

/** Convert kobo string to naira number */
export function toNaira(kobo: string): number {
    return parseInt(kobo || "0", 10) / 100;
}

export function formatPrice(kobo: string | number): string {
    const naira = typeof kobo === "number" ? kobo : toNaira(String(kobo));
    return `₦${naira.toLocaleString("en-NG")}`;
}

export function getDiscount(regular: string, sale: string): number {
    const r = toNaira(regular);
    const s = toNaira(sale);
    if (!r || !s || s >= r) return 0;
    return Math.round(((r - s) / r) * 100);
}

export function getProductImage(product: StoreProduct, index = 0): string {
    return product.images?.[index]?.src ?? "";
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL", "5XL", "6XL", "ONE SIZE", "FREE SIZE"];

export function getSizes(product: StoreProduct): string[] {
    const attr = product.attributes?.find(
        (a) => a.name.toLowerCase() === "size" || a.name.toLowerCase() === "sizes"
    );
    const raw = attr?.terms?.map((t) => t.name) ?? [];
    return raw.sort((a, b) => {
        const ai = SIZE_ORDER.indexOf(a.toUpperCase());
        const bi = SIZE_ORDER.indexOf(b.toUpperCase());
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
}

export function getColors(product: StoreProduct): string[] {
    const attr = product.attributes?.find(
        (a) => a.name.toLowerCase() === "color" || a.name.toLowerCase() === "colour"
    );
    return attr?.terms?.map((t) => t.name) ?? [];
}

// ── Products ──────────────────────────────────────────────────────────────

export async function getProducts(params: {
    category?: string;   // category slug
    perPage?: number;
    page?: number;
    orderby?: string;
    order?: string;
    onSale?: boolean;
} = {}): Promise<StoreProduct[]> {
    const q = new URLSearchParams();
    q.set("per_page", String(params.perPage ?? 60));
    q.set("page", String(params.page ?? 1));
    if (params.category) q.set("category", params.category);
    if (params.onSale) q.set("on_sale", "true");
    if (params.orderby) q.set("orderby", params.orderby);
    if (params.order) q.set("order", params.order);

    const data = await storeFetch<StoreProduct[]>(`/products?${q}`, 60);
    return data ?? [];
}

export async function getProduct(slug: string): Promise<StoreProduct | null> {
    const data = await storeFetch<StoreProduct[]>(`/products?slug=${slug}`, 60);
    const product = data?.[0] ?? null;
    if (!product) return null;

    // Some WooCommerce products expose an empty `terms` value through the
    // Store API even though their variation attributes are populated in the
    // authenticated REST API. Enrich the product so selectors still show all
    // available options (for example Black, Coffee and White Beige).
    const hasMissingAttributeOptions = product.attributes?.some(
        (attribute) => !Array.isArray(attribute.terms) || attribute.terms.length === 0
    );
    if (!hasMissingAttributeOptions) return product;

    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;
    if (!key || !secret) return product;

    try {
        const auth = Buffer.from(`${key}:${secret}`).toString("base64");
        const response = await fetch(`${API_ENDPOINTS.woocommerce.rest}/products/${product.id}`, {
            headers: { Authorization: `Basic ${auth}` },
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
        });
        if (!response.ok) return product;

        const restProduct = await response.json() as {
            attributes?: { id: number; name: string; slug: string; variation: boolean; options: string[] }[];
        };
        if (!Array.isArray(restProduct.attributes)) return product;

        const attributes = restProduct.attributes.map((attribute) => ({
            id: attribute.id,
            name: attribute.name,
            taxonomy: attribute.slug,
            has_variations: attribute.variation,
            terms: (attribute.options ?? []).map((name, index) => ({
                id: index,
                name,
                slug: name.toLowerCase().trim().replace(/\\s+/g, "-"),
            })),
        }));
        return { ...product, attributes };
    } catch {
        return product;
    }
}

export async function getNewArrivals(limit = 10): Promise<StoreProduct[]> {
    // "WHAT'S NEW" category slug is "whats-new"
    const data = await storeFetch<StoreProduct[]>(
        `/products?category=whats-new&per_page=${limit}&orderby=date&order=desc`,
        30
    );
    return data ?? [];
}

export async function getSaleProducts(limit = 60): Promise<StoreProduct[]> {
    const data = await storeFetch<StoreProduct[]>(
        `/products?category=discount-sale&per_page=${limit}`,
        60
    );
    // fallback: on_sale flag
    if (!data?.length) {
        const fallback = await storeFetch<StoreProduct[]>(`/products?on_sale=true&per_page=${limit}`, 60);
        return fallback ?? [];
    }
    return data;
}

export async function getRelatedProducts(productId: number, limit = 5): Promise<StoreProduct[]> {
    if (IS_DEMO_STORE) return demoStoreRead<StoreProduct[]>(`/products?exclude=${productId}&per_page=${limit}`);
    // Fetch related_ids from WC REST v3 (requires auth, server-side only)
    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;

    if (key && secret) {
        try {
            const auth = Buffer.from(`${key}:${secret}`).toString("base64");
            const res = await fetch(`${API_ENDPOINTS.woocommerce.rest}/products/${productId}?_fields=related_ids`, {
                headers: { Authorization: `Basic ${auth}` },
                next: { revalidate: 120 },
            });
            if (res.ok) {
                const data = await res.json();
                const relatedIds: number[] = data.related_ids ?? [];
                if (relatedIds.length > 0) {
                    // Hydrate via Store API to get prices, images etc.
                    const ids = relatedIds.slice(0, limit).join(",");
                    const products = await storeFetch<StoreProduct[]>(
                        `/products?include=${ids}&per_page=${limit}`,
                        120
                    );
                    if (products && products.length > 0) return products;
                }
            }
        } catch {
            // Fall through to popularity fallback
        }
    }

    // Fallback: recent products (popularity requires a WC Nonce — not available server-side)
    const fallback = await storeFetch<StoreProduct[]>(
        `/products?per_page=${limit + 1}&orderby=date&order=desc`,
        120
    );
    return (fallback ?? []).filter((p) => p.id !== productId).slice(0, limit);
}

// ── Categories ────────────────────────────────────────────────────────────

export async function getCategories(): Promise<StoreCategory[]> {
    const data = await storeFetch<StoreCategory[]>("/products/categories?per_page=50", 60);
    return (data ?? []).filter((c) => c.slug !== "uncategorized" && c.count > 0);
}

// ── Store name ────────────────────────────────────────────────────────────

export async function getStoreName(): Promise<string> {
    if (IS_DEMO_STORE) return "Wearlux";
    try {
        const res = await fetch(API_ENDPOINTS.wordpress.settings, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            return data.title ?? "Missus";
        }
    } catch { /* fallback */ }
    return process.env.NEXT_PUBLIC_SITE_NAME ?? "Missus";
}
