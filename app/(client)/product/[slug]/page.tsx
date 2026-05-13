import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getRelatedProducts } from "@/lib/woocommerce";
import ProductPageClient from "./ProductPageClient";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return { title: "Product Not Found" };
    return {
        title: product.name,
        description: product.short_description.replace(/<[^>]+>/g, "").slice(0, 160),
        openGraph: { images: [{ url: product.images[0]?.src ?? "" }] },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) notFound();

    const related = await getRelatedProducts(product.id, 5);

    return <ProductPageClient params={{ slug }} product={product} related={related} />;
}
