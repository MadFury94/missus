import { getCategorySeo } from "@/lib/category-seo";
import { categoryPath, CATEGORY_ALIASES } from "@/lib/seo-urls";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/woocommerce";
import CategoryPageClient from "./CategoryPageClient";
import { generatePageMetadata } from "@/lib/seo-config";
import StructuredData from "@/components/seo/StructuredData";
import { getCollectionPageSchema, getBreadcrumbSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/config";
import { cleanCategoryName, decodeHtmlEntities } from "@/lib/api-helpers";

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
    try {
        const categories = await getCategories();

        // Add common category fallbacks in case API is down
        const fallbackCategories = [
            "dresses", "tops", "bottoms", "matching-sets",
            "athleisure-loungewear", "gift-shop", "whats-new",
            "curve", "beauty", "formal", "vacation", "night-out"
        ];

        const categoryParams = categories.filter(category => !CATEGORY_ALIASES[category.slug]).map((category) => ({
            slug: category.slug,
        }));

        // Add fallback categories if not already included
        fallbackCategories.forEach(slug => {
            if (!categoryParams.some(param => param.slug === slug)) {
                categoryParams.push({ slug });
            }
        });

        return categoryParams;
    } catch (error) {
        console.error("Failed to fetch categories for static generation:", error);

        // Return fallback categories in case of API failure
        return [
            { slug: "dresses" },
            { slug: "tops" },
            { slug: "bottoms" },
            { slug: "matching-sets" },
            { slug: "athleisure-loungewear" },
            { slug: "gift-shop" },
            { slug: "whats-new" },
            { slug: "curve" },
            { slug: "beauty" },
            { slug: "formal" },
            { slug: "vacation" },
            { slug: "night-out" }
        ];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const categories = await getCategories();
    const category = categories.find(c => c.slug === slug);
    const copy = getCategorySeo(slug, category ? cleanCategoryName(category.name, slug) : undefined);
    return generatePageMetadata({ title: copy.title, description: copy.description, path: categoryPath(slug), ogImage: category?.image?.src });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    try {
        const [categories, productsData] = await Promise.all([
            getCategories(),
            getProducts({ category: slug, perPage: 60 }).catch(() => [])
        ]);

        const category = categories.find(c => c.slug === slug);

        // Fallback category data for SEO purposes
        const fallbackCategories: Record<string, any> = {
            "dresses": { name: "Dresses", slug: "dresses" },
            "tops": { name: "Tops", slug: "tops" },
            "bottoms": { name: "Bottoms", slug: "bottoms" },
            "matching-sets": { name: "Matching Sets", slug: "matching-sets" },
            "athleisure-loungewear": { name: "Athleisure & Loungewear", slug: "athleisure-loungewear" },
            "gift-shop": { name: "Gift Shop", slug: "gift-shop" },
            "whats-new": { name: "What's New", slug: "whats-new" },
            "curve": { name: "Curve+", slug: "curve" },
            "beauty": { name: "Beauty", slug: "beauty" },
            "formal": { name: "Formal", slug: "formal" },
            "vacation": { name: "Vacation", slug: "vacation" },
            "night-out": { name: "Night Out", slug: "night-out" }
        };

        const categoryData = category || fallbackCategories[slug];

        if (!categoryData) {
            notFound();
        }

        const label = category ? cleanCategoryName(category.name, slug) : categoryData.name;

        // Breadcrumb data
        const breadcrumbs = [
            { name: "Home", url: SITE_URL },
            { name: "Shop", url: `${SITE_URL}/shop` },
            { name: label, url: `${SITE_URL}/category/${slug}` }
        ];

        // If we have a real category, use it; otherwise create minimal schema with fallback data
        const categoryForSchema = category || {
            id: 0,
            name: categoryData.name,
            slug: slug,
            description: `Shop ${categoryData.name} at Missus`,
            parent: 0, image: null, permalink: `${SITE_URL}${categoryPath(slug)}`,
            count: productsData.length
        };

        return (
            <>
                <StructuredData schema={[
                    getCollectionPageSchema(categoryForSchema, productsData),
                    getBreadcrumbSchema(breadcrumbs)
                ]} />
                <CategoryPageClient
                    slug={slug}
                    label={label}
                    initialProducts={productsData}
                    category={categoryForSchema}
                />
            </>
        );
    } catch (error) {
        console.error(`Error loading category ${slug}:`, error);
        notFound();
    }
}