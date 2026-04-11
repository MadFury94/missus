import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

// Helper to create WooCommerce auth headers
function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
    };
}

// GET - List all products
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const perPage = searchParams.get("per_page") || "100";
        const search = searchParams.get("search") || "";

        let url = `${WC_API_URL}/products?page=${page}&per_page=${perPage}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: getWCAuth(),
        });

        if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.statusText}`);
        }

        const products = await response.json();
        return NextResponse.json(products);
    } catch (error: any) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${WC_API_URL}/products`, {
            method: "POST",
            headers: getWCAuth(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create product");
        }

        const product = await response.json();
        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
