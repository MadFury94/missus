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

    const res = await wcFetch(`${WC_API_URL}/products/categories?per_page=100`, { headers: getWCAuth() });
    if (!res || !res.ok) return NextResponse.json([], { status: res?.status ?? 504 });
    return NextResponse.json(await res.json());
}
