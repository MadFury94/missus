/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses module-level Maps — persists across requests within the same
 * serverless function instance (sufficient for login/register brute-force protection).
 *
 * For higher traffic, swap the Maps for Redis (Upstash works well with Vercel).
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
    /** Max requests allowed in the window */
    limit: number;
    /** Window duration in seconds */
    windowSecs: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check and increment the rate limit counter for a given key.
 * Returns { allowed, remaining, resetAt }.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const windowMs = opts.windowSecs * 1000;

    let entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        // Start a fresh window
        entry = { count: 1, resetAt: now + windowMs };
        store.set(key, entry);
        return { allowed: true, remaining: opts.limit - 1, resetAt: entry.resetAt };
    }

    entry.count += 1;
    const allowed = entry.count <= opts.limit;
    return {
        allowed,
        remaining: Math.max(0, opts.limit - entry.count),
        resetAt: entry.resetAt,
    };
}

/**
 * Get the client IP from a Next.js request.
 * Falls back to "unknown" if no IP can be determined.
 */
export function getClientIp(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}
