import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/image-proxy?url=<encoded-image-url>
 *
 * Proxies images from missusoutfits.com (WooCommerce media) through Next.js.
 * This avoids CORS issues, lets us set correct cache headers, and allows
 * next/image to optimise images it couldn't reach directly in some environments.
 *
 * Allowed origins are strictly whitelisted so this can't be used as an open proxy.
 */

const ALLOWED_ORIGINS = [
    "missusoutfits.com",
    "www.missusoutfits.com",
];

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const rawUrl = searchParams.get("url");

    if (!rawUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return new NextResponse("Invalid url", { status: 400 });
    }

    // Whitelist check
    if (!ALLOWED_ORIGINS.includes(parsed.hostname)) {
        return new NextResponse("Origin not allowed", { status: 403 });
    }

    // Only allow https
    if (parsed.protocol !== "https:") {
        return new NextResponse("Only HTTPS origins allowed", { status: 403 });
    }

    try {
        const upstream = await fetch(rawUrl, {
            headers: {
                // Forward a reasonable UA so WP doesn't block us
                "User-Agent": "Mozilla/5.0 (compatible; MissusImageProxy/1.0)",
            },
            // 10 s timeout via AbortSignal
            signal: AbortSignal.timeout(10_000),
        });

        if (!upstream.ok) {
            return new NextResponse("Upstream fetch failed", { status: upstream.status });
        }

        const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

        // Only proxy image content types
        if (!contentType.startsWith("image/")) {
            return new NextResponse("Not an image", { status: 415 });
        }

        const body = await upstream.arrayBuffer();

        return new NextResponse(body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                // Cache aggressively — product images rarely change
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                "X-Proxied-By": "missus-image-proxy",
            },
        });
    } catch (err) {
        console.error("[image-proxy] fetch error:", err);
        return new NextResponse("Failed to fetch image", { status: 502 });
    }
}
