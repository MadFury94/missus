/**
 * Wrapper around fetch for all server-side calls to missusoutfits.com.
 *
 * - Applies a hard timeout so dev environments (where the WP host may be
 *   unreachable) fail fast instead of hanging for 10+ seconds.
 * - Returns null on any network/timeout error so callers can return an
 *   empty result rather than a 500.
 */

const STORE_API = "https://missusoutfits.com/wp-json/wc/store/v1";
const WP_ORIGIN = "https://missusoutfits.com";

// 4 s in dev, 12 s in production
const TIMEOUT_MS = process.env.NODE_ENV === "development" ? 4000 : 12000;

export { STORE_API, WP_ORIGIN };

export async function wpFetch(
    url: string,
    options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<Response | null> {
    try {
        const res = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        return res;
    } catch (err) {
        console.warn("[wp-fetch] failed:", url, err instanceof Error ? err.message : err);
        return null;
    }
}

/** Convenience: fetch the WC Store API and parse JSON, returns null on failure. */
export async function storeFetch<T>(
    path: string,
    revalidate = 60
): Promise<T | null> {
    const res = await wpFetch(`${STORE_API}${path}`, {
        next: { revalidate },
        headers: {
            "Content-Type": "application/json",
            Referer: WP_ORIGIN,
            Origin: WP_ORIGIN,
        },
    });
    if (!res || !res.ok) return null;
    return res.json() as Promise<T>;
}

/** WooCommerce REST API v3 fetch with timeout — for authenticated admin/account routes. */
export async function wcFetch(
    url: string,
    options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<Response | null> {
    return wpFetch(url, options);
}
