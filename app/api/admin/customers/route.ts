import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const perPage = searchParams.get("per_page") || "50";
        const search = searchParams.get("search") || "";

        let url = `${WC_API_URL}/customers?page=${page}&per_page=${perPage}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: getWCAuth(),
        });

        if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.statusText}`);
        }

        const customers = await response.json();
        return NextResponse.json(customers);
    } catch (error: any) {
        console.error("Failed to fetch customers:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
