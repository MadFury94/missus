import { NextRequest, NextResponse } from "next/server";
import { storeFetch } from "@/lib/wp-fetch";
import type { StoreProduct } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ products: [] });
    }

    const products = await storeFetch<StoreProduct[]>(
        `/products?search=${encodeURIComponent(query)}&per_page=60`,
        60
    );

    return NextResponse.json({ products: products ?? [] });
}
