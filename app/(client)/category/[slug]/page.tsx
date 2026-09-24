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

        const categoryParams = categories.map((category) => ({
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

    try {
        const categories = await getCategories();
        const category = categories.find(c => c.slug === slug);

        // Fallback category data for common categories
        const fallbackCategories: Record<string, { name: string; description: string }> = {
            "dresses": {
                name: "Dresses",
                description: "Shop premium dresses at Missus. From casual day dresses to elegant evening wear, discover our curated collection of contemporary women's fashion with fast delivery across Nigeria."
            },
            "tops": {
                name: "Tops",
                description: "Discover trendy tops and blouses at Missus. Shop crop tops, button-downs, and statement pieces that elevate your wardrobe with premium quality and style."
            },
            "bottoms": {
                name: "Bottoms",
                description: "Shop premium bottoms at Missus. From tailored trousers to trendy skirts and shorts, find the perfect pieces to complete your look."
            },
            "matching-sets": {
                name: "Matching Sets",
                description: "Effortless coordination with our matching sets collection. Shop co-ord sets, two-piece outfits, and perfectly matched ensembles for a polished look."
            },
            "athleisure-loungewear": {
                name: "Athleisure & Loungewear",
                description: "Comfort meets style in our athleisure and loungewear collection. Perfect for workouts, casual days, and everything in between."
            },
            "gift-shop": {
                name: "Gift Shop",
                description: "Find the perfect gift at Missus. Shop curated gift sets, accessories, and special pieces that make memorable presents."
            },
            "whats-new": {
                name: "What's New",
                description: "Discover the latest arrivals at Missus. Shop new drops, trending pieces, and fresh styles added weekly to our collection."
            },
            "curve": {
                name: "Curve+",
                description: "Celebrate your curves with our Curve+ collection. Premium plus-size fashion designed for comfort, style, and confidence."
            },
            "beauty": {
                name: "Beauty",
                description: "Complete your look with our beauty collection. Discover skincare, makeup, and beauty accessories curated for the modern woman."
            }
        };

        const categoryData = category || fallbackCategories[slug];

        if (!categoryData) {
            return {
                title: "Category Not Found",
                robots: { index: false, follow: false }
            };
        }

        const label = category ? cleanCategoryName(category.name, slug) : categoryData.name;
        let cleanDescription = category
            ? decodeHtmlEntities(category.description?.replace(/<[^>]+>/g, "") || "")
            : categoryData.description;

        if (!cleanDescription) {
            cleanDescription = `Shop ${label} collection at Missus. Discover premium women's fashion, contemporary styles, and trendsetting pieces with fast shipping across Nigeria.`;
        }

        return generatePageMetadata({
            title: `${label} Collection | Premium Women's Fashion - Missus`,
            description: cleanDescription,
            keywords: [
                label.toLowerCase(),
                `${label.toLowerCase()} fashion`,
                `women's ${label.toLowerCase()}`,
                "women's clothing Nigeria",
                "premium fashion",
                "Nigerian fashion",
                "contemporary style",
                "designer wear",
                "online shopping Nigeria",
                "fast delivery Lagos",
                "Missus fashion"
            ],
            path: `/category/${slug}`,
        });
    } catch (error) {
        console.error("Failed to generate category metadata:", error);

        // Fallback metadata to prevent 404s
        const capitalizedSlug = slug.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        return generatePageMetadata({
            title: `${capitalizedSlug} Collection | Missus Fashion`,
            description: `Shop ${capitalizedSlug.toLowerCase()} at Missus. Discover premium women's fashion with fast delivery across Nigeria.`,
            path: `/category/${slug}`,
        });
    }
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
            count: productsData.length, parent: 0, image: null, permalink: `/category/${slug}`
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