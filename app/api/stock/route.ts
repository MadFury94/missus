import { NextRequest, NextResponse } from "next/server";
import { getProductStock } from "@/lib/product-stock";

export async function GET(req: NextRequest) {
    const id = Number(req.nextUrl.searchParams.get("productId"));
    if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    try {
        return NextResponse.json(await getProductStock(id));
    } catch {
        return NextResponse.json({ error: "Availability could not be checked. Please retry." }, { status: 503 });
    }
}
