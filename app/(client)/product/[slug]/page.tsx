import { productType, productDescription } from "@/lib/product-seo";
import { categoryPath } from "@/lib/seo-urls";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRelatedProducts } from "@/lib/woocommerce";
import { getCachedProduct } from "@/lib/catalog-cache.server";
import ProductPageClient from "./ProductPageClient";
import { generatePageMetadata } from "@/lib/seo-config";
import StructuredData from "@/components/seo/StructuredData";
import { getProductSchema, getBreadcrumbSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/config";
import { decodeHtmlEntities } from "@/lib/api-helpers";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getCachedProduct(slug);
    if (!product) return { title: "Product Not Found", robots: { index: false } };

    const cleanDescription = productDescription(product);

    const cleanProductName = decodeHtmlEntities(product.name);

    return generatePageMetadata({
        title: `${cleanProductName} | ${productType(product)} | Missus Outfits`,
        description: cleanDescription,
        path: `/product/${slug}`,
        ogImage: product.images?.[0]?.src
    });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getCachedProduct(slug);
    if (!product) notFound();

    const related = await getRelatedProducts(product.id, 5);
    const cleanProductName = decodeHtmlEntities(product.name);

    // Breadcrumb data
    const breadcrumbs = [
        { name: "Home", url: SITE_URL },
        { name: "Shop", url: `${SITE_URL}/shop` },
        ...(product.categories?.[0] ? [{
            name: product.categories[0].name,
            url: `${SITE_URL}${categoryPath(product.categories[0].slug)}`
        }] : []),
        { name: cleanProductName, url: `${SITE_URL}/product/${slug}` }
    ];

    return (
        <>
            <StructuredData schema={[
                getProductSchema(product),
                getBreadcrumbSchema(breadcrumbs)
            ]} />
            <ProductPageClient params={{ slug }} product={product} related={related} />
        </>
    );
}
