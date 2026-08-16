import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { wcFetch } from "@/lib/wp-fetch";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" };
}

export async function GET(request: NextRequest) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const perPage = searchParams.get("per_page") || "100";
        const search = searchParams.get("search") || "";

        let url = `${WC_API_URL}/products?page=${page}&per_page=${perPage}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await wcFetch(url, { headers: getWCAuth() });
        if (!response || !response.ok) {
            return NextResponse.json([], { status: response?.status ?? 504 });
        }

        const products = await response.json();
        return NextResponse.json(products);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch products:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const response = await wcFetch(`${WC_API_URL}/products`, {
            method: "POST",
            headers: getWCAuth(),
            body: JSON.stringify(body),
        });

        if (!response || !response.ok) {
            const err = response ? await response.json() : { message: "Timeout" };
            throw new Error(err.message || "Failed to create product");
        }

        return NextResponse.json(await response.json());
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
