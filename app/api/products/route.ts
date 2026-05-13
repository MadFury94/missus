import { NextRequest, NextResponse } from "next/server";

const STORE_API = "https://missusoutfits.com/wp-json/wc/store/v1";

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

    // Support excluding specific product IDs (comma-separated)
    const exclude = searchParams.get("exclude");
    if (exclude) params.set("exclude", exclude);

    try {
        const res = await fetch(`${STORE_API}/products?${params}`, {
            next: { revalidate: 60 },
        });
        const products = await res.json();
        return NextResponse.json({ products, total: products.length });
    } catch {
        return NextResponse.json({ products: [], total: 0 }, { status: 500 });
    }
}
