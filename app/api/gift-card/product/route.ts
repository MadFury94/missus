import { NextResponse } from "next/server";
import { storeFetch } from "@/lib/wp-fetch";
import type { StoreProduct } from "@/lib/woocommerce";

export async function GET() {
    const products = await storeFetch<StoreProduct[]>("/products?search=gift%20card&per_page=20", 60);
    const product = products?.find((item) => /gift\s*(card|voucher|certificate)/i.test(item.name));
    if (!product) return NextResponse.json({ error: "The WordPress gift card product could not be found." }, { status: 404 });
    return NextResponse.json({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.src ?? "",
        stock_status: product.stock_status,
        is_in_stock: product.is_in_stock,
    }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
