import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getRelatedProducts } from "@/lib/woocommerce";
import ProductPageClient from "./ProductPageClient";
import { generatePageMetadata } from "@/lib/seo-config";
import StructuredData from "@/components/seo/StructuredData";
import { getProductSchema, getBreadcrumbSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/config";
import { decodeHtmlEntities } from "@/lib/api-helpers";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return { title: "Product Not Found" };

    const cleanDescription = decodeHtmlEntities(product.short_description?.replace(/<[^>]+>/g, "") ||
        product.description?.replace(/<[^>]+>/g, "") ||
        `Shop ${decodeHtmlEntities(product.name)} at Missus. Premium women's fashion with fast shipping across Nigeria.`);

    const cleanProductName = decodeHtmlEntities(product.name);

    return generatePageMetadata({
        title: `${cleanProductName} | Premium Women's Fashion`,
        description: cleanDescription,
        keywords: [
            cleanProductName.toLowerCase(),
            product.categories?.[0]?.name.toLowerCase() || "fashion",
            "women's fashion",
            "premium clothing",
            "designer wear",
            "Nigerian fashion",
            "online shopping"
        ],
        path: `/product/${slug}`,
        ogImage: product.images?.[0]?.src
    });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) notFound();

    const related = await getRelatedProducts(product.id, 5);
    const cleanProductName = decodeHtmlEntities(product.name);

    // Breadcrumb data
    const breadcrumbs = [
        { name: "Home", url: SITE_URL },
        { name: "Shop", url: `${SITE_URL}/shop` },
        ...(product.categories?.[0] ? [{
            name: product.categories[0].name,
            url: `${SITE_URL}/category/${product.categories[0].slug}`
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
