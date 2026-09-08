import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/woocommerce";
import CategoryPageClient from "./CategoryPageClient";
import { generatePageMetadata } from "@/lib/seo-config";
import StructuredData from "@/components/seo/StructuredData";
import { getCollectionPageSchema, getBreadcrumbSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
    try {
        const categories = await getCategories();
        return categories.map((category) => ({
            slug: category.slug,
        }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        const categories = await getCategories();
        const category = categories.find(c => c.slug === slug);

        if (!category) {
            return { title: "Category Not Found" };
        }

        const label = category.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        const cleanDescription = category.description?.replace(/<[^>]+>/g, "") ||
            `Shop ${label} collection at Missus. Discover premium women's fashion, contemporary styles, and trendsetting pieces with fast shipping across Nigeria.`;

        return generatePageMetadata({
            title: `${label} Collection | Premium Women's Fashion`,
            description: cleanDescription,
            keywords: [
                label.toLowerCase(),
                `${label.toLowerCase()} fashion`,
                "women's clothing",
                "premium fashion",
                "Nigerian fashion",
                "contemporary style",
                "designer wear",
                "online shopping Nigeria"
            ],
            path: `/category/${slug}`,
        });
    } catch {
        return { title: "Category Not Found" };
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        const [categories, productsData] = await Promise.all([
            getCategories(),
            getProducts({ category: slug, perPage: 60 })
        ]);

        const category = categories.find(c => c.slug === slug);
        if (!category) notFound();

        const label = category.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

        // Breadcrumb data
        const breadcrumbs = [
            { name: "Home", url: SITE_URL },
            { name: "Shop", url: `${SITE_URL}/shop` },
            { name: label, url: `${SITE_URL}/category/${slug}` }
        ];

        return (
            <>
                <StructuredData schema={[
                    getCollectionPageSchema(category, productsData),
                    getBreadcrumbSchema(breadcrumbs)
                ]} />
                <CategoryPageClient
                    slug={slug}
                    label={label}
                    initialProducts={productsData}
                    category={category}
                />
            </>
        );
    } catch {
        notFound();
    }
}