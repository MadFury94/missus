import { NextRequest, NextResponse } from "next/server";
import { storeFetch } from "@/lib/wp-fetch";
import type { StoreProduct } from "@/lib/woocommerce";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;

    const params = new URLSearchParams();
    params.set("per_page", searchParams.get("per_page") ?? "60");
    params.set("page", searchParams.get("page") ?? "1");

    const category = searchParams.get("category");
    if (category) params.set("category", category);

    const orderby = searchParams.get("orderby");
    const order = searchParams.get("order");
    if (orderby) params.set("orderby", orderby);
    if (order) params.set("order", order);

    if (searchParams.get("on_sale") === "true") params.set("on_sale", "true");

    const exclude = searchParams.get("exclude");
    if (exclude) params.set("exclude", exclude);

    const include = searchParams.get("include");
    if (include) params.set("include", include);

    const slug = searchParams.get("slug");
    if (slug) params.set("slug", slug);

    const products = await storeFetch<StoreProduct[]>(`/products?${params}`, 60);

    if (products === null) {
        // Timed out or unreachable — return empty rather than 500
        return NextResponse.json({ products: [], total: 0 });
    }

    return NextResponse.json({ products, total: products.length });
}
