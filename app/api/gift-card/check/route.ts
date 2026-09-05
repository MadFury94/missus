import { NextRequest, NextResponse } from "next/server";

const WP_API_URL = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();
        if (!code?.trim()) {
            return NextResponse.json({ error: "Gift card code is required." }, { status: 400 });
        }

        const res = await fetch(`${WP_API_URL}/missus/v1/gift-cards/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code.trim().toUpperCase() }),
            cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data.message || "Gift card not found." },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to check gift card balance." }, { status: 500 });
    }
}
