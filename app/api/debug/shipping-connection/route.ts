import { NextResponse } from "next/server";

export async function GET() {
    try {
        const baseUrl = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";
        const storeUrl = `${baseUrl.replace(/\/$/, "")}/wc/store/v1`;

        console.log("[shipping-debug] Testing connection to:", storeUrl);

        // Test basic connection to WooCommerce Store API
        const response = await fetch(`${storeUrl}/cart`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000)
        });

        console.log("[shipping-debug] Response status:", response.status);
        console.log("[shipping-debug] Response headers:", Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log("[shipping-debug] Response data:", data);

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            url: storeUrl,
            data: data,
            env: {
                WP_API_URL: process.env.WP_API_URL,
                hasWooAuth: !!process.env.WC_CONSUMER_KEY
            }
        });
    } catch (error) {
        console.error("[shipping-debug] Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            env: {
                WP_API_URL: process.env.WP_API_URL,
                hasWooAuth: !!process.env.WC_CONSUMER_KEY
            }
        });
    }
}