import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const consumerKey = process.env.WC_CONSUMER_KEY;
        const consumerSecret = process.env.WC_CONSUMER_SECRET;
        const apiUrl = process.env.WC_API_URL;

        if (!consumerKey || !consumerSecret || !apiUrl) {
            return NextResponse.json({
                error: "WooCommerce credentials not configured",
                details: {
                    hasConsumerKey: !!consumerKey,
                    hasConsumerSecret: !!consumerSecret,
                    hasApiUrl: !!apiUrl,
                    apiUrl: apiUrl
                }
            }, { status: 500 });
        }

        console.log(`[debug] Fetching all coupons from: ${apiUrl}/coupons`);

        // Get all coupons from WooCommerce
        const couponResponse = await fetch(`${apiUrl}/coupons?per_page=100&status=publish`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        console.log(`[debug] WooCommerce API Response Status: ${couponResponse.status}`);

        if (!couponResponse.ok) {
            const errorText = await couponResponse.text();
            return NextResponse.json({
                error: `WooCommerce API error: ${couponResponse.status}`,
                status: couponResponse.status,
                response: errorText,
                url: `${apiUrl}/coupons?per_page=100&status=publish`
            }, { status: 500 });
        }

        const coupons = await couponResponse.json();

        console.log(`[debug] Found ${coupons.length} coupons`);

        // Return simplified coupon data
        const couponList = coupons.map((coupon: any) => ({
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
            // Show if it's currently valid
            is_expired: coupon.date_expires ? new Date(coupon.date_expires) < new Date() : false,
            is_usage_limit_reached: coupon.usage_limit ? coupon.usage_count >= coupon.usage_limit : false
        }));

        return NextResponse.json({
            success: true,
            total_coupons: coupons.length,
            coupons: couponList,
            api_url: `${apiUrl}/coupons`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[debug] Coupons fetch error:", error);
        return NextResponse.json({
            error: "Failed to fetch coupons",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}