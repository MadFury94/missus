import { NextResponse } from "next/server";
import { getCategories } from "@/lib/woocommerce";

export async function GET() {
    const categories = await getCategories();
    // Return only what the frontend needs: slug, name, image
    const slim = categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        image: c.image?.src ?? null,
    }));
    return NextResponse.json(slim, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
}
