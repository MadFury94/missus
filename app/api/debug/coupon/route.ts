import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
    }

    try {
        const consumerKey = process.env.WC_CONSUMER_KEY;
        const consumerSecret = process.env.WC_CONSUMER_SECRET;
        const apiUrl = process.env.WC_API_URL;

        if (!consumerKey || !consumerSecret || !apiUrl) {
            return NextResponse.json({ error: "WooCommerce credentials not configured" }, { status: 500 });
        }

        console.log(`[debug] Fetching coupon: ${code}`);

        // Get coupon details from WooCommerce
        const couponResponse = await fetch(`${apiUrl}/coupons?code=${encodeURIComponent(code)}`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!couponResponse.ok) {
            return NextResponse.json({
                error: `WooCommerce API error: ${couponResponse.status}`,
                status: couponResponse.status
            }, { status: 500 });
        }

        const coupons = await couponResponse.json();
        const coupon = coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase());

        if (!coupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        // Return full coupon data for debugging
        return NextResponse.json({
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                status: coupon.status,
                discount_type: coupon.discount_type,
                amount: coupon.amount,
                minimum_amount: coupon.minimum_amount,
                maximum_amount: coupon.maximum_amount,
                usage_limit: coupon.usage_limit,
                usage_count: coupon.usage_count,
                date_expires: coupon.date_expires,
                description: coupon.description,
                // Include raw response for debugging
                raw: coupon
            }
        });

    } catch (error) {
        console.error("[debug] Coupon fetch error:", error);
        return NextResponse.json({
            error: "Failed to fetch coupon",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}