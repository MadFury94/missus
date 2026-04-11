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

// GET - List all categories
export async function GET() {
    try {
        const response = await fetch(`${WC_API_URL}/products/categories?per_page=100`, {
            headers: getWCAuth(),
        });

        const categories = await response.json();
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
