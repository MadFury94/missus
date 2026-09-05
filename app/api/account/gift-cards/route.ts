import { NextRequest, NextResponse } from "next/server";

const WP_API_URL = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";

/**
 * GET /api/account/gift-cards
 * Fetches gift cards for the logged-in user from YITH Premium REST API.
 * Requires Authorization: Bearer <jwt_token> header.
 */
export async function GET(request: NextRequest) {
    const auth = request.headers.get("authorization");
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // YITH Premium exposes gift cards via their REST endpoint
        const res = await fetch(`${WP_API_URL}/yith/v1/gift-cards`, {
            headers: {
                Authorization: auth,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            // Fallback: try the missus bridge endpoint (free version fallback)
            const fallback = await fetch(`${WP_API_URL}/missus/v1/gift-cards/mine`, {
                headers: { Authorization: auth, "Content-Type": "application/json" },
                cache: "no-store",
            });
            if (!fallback.ok) {
                return NextResponse.json({ gift_cards: [] });
            }
            const data = await fallback.json();
            return NextResponse.json({ gift_cards: Array.isArray(data) ? data : [] });
        }

        const data = await res.json();
        return NextResponse.json({ gift_cards: Array.isArray(data) ? data : (data.gift_cards ?? []) });
    } catch {
        return NextResponse.json({ gift_cards: [] });
    }
}
