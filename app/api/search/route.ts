import { NextRequest, NextResponse } from "next/server";

const STORE_API = "https://missusoutfits.com/wp-json/wc/store/v1";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ products: [] });
    }

    try {
        const res = await fetch(
            `${STORE_API}/products?search=${encodeURIComponent(query)}&per_page=60`,
            {
                next: { revalidate: 60 },
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!res.ok) {
            return NextResponse.json({ products: [] }, { status: res.status });
        }

        const products = await res.json();
        return NextResponse.json({ products });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ products: [] }, { status: 500 });
    }
}
