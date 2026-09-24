import { API_ENDPOINTS } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

const WP_API_URL = API_ENDPOINTS.wordpress.core;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const auth = request.headers.get("authorization") ?? "";
    const body = await request.json();

    const res = await fetch(`${WP_API_URL}/missus/v1/gift-cards/${id}`, {
        method: "PATCH",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    return NextResponse.json(await res.json(), { status: res.status });
}
