import { NextRequest, NextResponse } from "next/server";
import { wcStoreFetch } from "@/lib/api-helpers";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const data = await wcStoreFetch<Record<string, unknown>[]>(
        `/products?slug=${encodeURIComponent(slug)}&_fields=id,name,slug,attributes,variations`
    );

    const product = data?.[0];
    if (!product) return NextResponse.json(null, { status: 404 });

    return NextResponse.json({
        id: product.id,
        name: product.name,
        slug: product.slug,
        attributes: (product.attributes as { name: string; terms: { name: string }[] }[] ?? []).map((a) => ({
            name: a.name,
            options: (a.terms ?? []).map((t) => t.name),
        })),
    });
}
