import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const WP_API_URL = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";

// GET — list all gift cards
export async function GET(request: NextRequest) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const auth = request.headers.get("authorization") ?? "";

    const res = await fetch(`${WP_API_URL}/missus/v1/gift-cards`, {
        headers: { Authorization: auth, "Content-Type": "application/json" },
        cache: "no-store",
    });

    if (!res.ok) return NextResponse.json([], { status: res.status });
    return NextResponse.json(await res.json());
}

// POST — create a gift card
export async function POST(request: NextRequest) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const auth = request.headers.get("authorization") ?? "";
    const body = await request.json();

    const res = await fetch(`${WP_API_URL}/missus/v1/gift-cards`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
