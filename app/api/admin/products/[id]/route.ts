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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const res = await wcFetch(`${WC_API_URL}/products/${id}`, { headers: getWCAuth() });
    if (!res || !res.ok) return NextResponse.json({ error: "Product not found" }, { status: res?.status ?? 504 });
    return NextResponse.json(await res.json());
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const res = await wcFetch(`${WC_API_URL}/products/${id}`, {
        method: "PUT",
        headers: getWCAuth(),
        body: JSON.stringify(body),
    });
    if (!res || !res.ok) {
        const err = res ? await res.json() : { message: "Timeout" };
        return NextResponse.json({ error: err.message || "Failed to update" }, { status: res?.status ?? 504 });
    }
    return NextResponse.json(await res.json());
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const res = await wcFetch(`${WC_API_URL}/products/${id}?force=true`, {
        method: "DELETE",
        headers: getWCAuth(),
    });
    if (!res || !res.ok) return NextResponse.json({ error: "Failed to delete" }, { status: res?.status ?? 504 });
    return NextResponse.json({ success: true });
}
