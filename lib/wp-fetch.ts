/**
 * Wrapper around fetch for all server-side calls to missusoutfits.com.
 *
 * - Applies a hard timeout so dev environments (where the WP host may be
 *   unreachable) fail fast instead of hanging for 10+ seconds.
 * - Returns null on any network/timeout error so callers can return an
 *   empty result rather than a 500.
 */

import { API_ENDPOINTS, WP_HEADERS, WP_FETCH_TIMEOUT } from "./config";
import { IS_DEMO_STORE } from "./store-config";
import { demoStoreRead } from "./demo-store";

const STORE_API = API_ENDPOINTS.woocommerce.store;
const WP_ORIGIN = WP_HEADERS.Origin;

// 4 s in dev, 12 s in production
const TIMEOUT_MS = WP_FETCH_TIMEOUT;

export { STORE_API, WP_ORIGIN };

export async function wpFetch(
    url: string,
    options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<Response | null> {
    if (IS_DEMO_STORE) throw new Error("External WordPress requests are disabled in demo mode.");
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
    if (IS_DEMO_STORE) return demoStoreRead<T>(path);
    const res = await wpFetch(`${STORE_API}${path}`, {
        next: { revalidate },
        headers: WP_HEADERS,
    });
    if (!res || !res.ok) return null;
    try {
        // A response can arrive before its body fails or the connection closes.
        return await res.json() as T;
    } catch (err) {
        console.warn("[wp-fetch] response body failed:", path, err instanceof Error ? err.message : err);
        return null;
    }
}

/** WooCommerce REST API v3 fetch with timeout — for authenticated admin/account routes. */
export async function wcFetch(
    url: string,
    options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<Response | null> {
    return wpFetch(url, options);
}
