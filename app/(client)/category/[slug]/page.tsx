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
            "shirts", "kaftans", "trousers", "two-piece-sets",
            "casual-wear", "accessories", "whats-new",
            "native-wear", "footwear", "formal", "resort", "streetwear"
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
            { slug: "shirts" },
            { slug: "kaftans" },
            { slug: "trousers" },
            { slug: "two-piece-sets" },
            { slug: "casual-wear" },
            { slug: "accessories" },
            { slug: "whats-new" },
            { slug: "native-wear" },
            { slug: "footwear" },
            { slug: "formal" },
            { slug: "resort" },
            { slug: "streetwear" }
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
            "shirts": {
                name: "Shirts",
                description: "Shop premium shirts at WearLux. From casual day shirts to elegant evening wear, discover our curated collection of contemporary men's fashion with fast delivery across Nigeria."
            },
            "kaftans": {
                name: "Kaftans",
                description: "Discover trendy kaftans and shirts at WearLux. Shop crop kaftans, button-downs, and statement pieces that elevate your wardrobe with premium quality and style."
            },
            "trousers": {
                name: "Trousers",
                description: "Shop premium trousers at WearLux. From tailored trousers to trendy trousers and shorts, find the perfect pieces to complete your look."
            },
            "two-piece-sets": {
                name: "Two-Piece Sets",
                description: "Effortless coordination with our matching sets collection. Shop co-ord sets, two-piece outfits, and perfectly matched ensembles for a polished look."
            },
            "casual-wear": {
                name: "Casual Wear",
                description: "Comfort meets style in our athleisure and loungewear collection. Perfect for workouts, casual days, and everything in between."
            },
            "accessories": {
                name: "Accessories",
                description: "Find the perfect gift at WearLux. Shop curated gift sets, accessories, and special pieces that make memorable presents."
            },
            "whats-new": {
                name: "What's New",
                description: "Discover the latest arrivals at WearLux. Shop new drops, trending pieces, and fresh styles added weekly to our collection."
            },
            "native-wear": {
                name: "Native Wear",
                description: "Celebrate your curves with our Native Wear collection. Premium plus-size fashion designed for comfort, style, and confidence."
            },
            "footwear": {
                name: "Footwear",
                description: "Complete your look with our beauty collection. Discover skincare, makeup, and beauty accessories curated for the modern man."
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
            cleanDescription = `Shop ${label} collection at WearLux. Discover premium men's fashion, contemporary styles, and trendsetting pieces with fast shipping across Nigeria.`;
        }

        return generatePageMetadata({
            title: `${label} Collection | Premium Men's Fashion - WearLux`,
            description: cleanDescription,
            keywords: [
                label.toLowerCase(),
                `${label.toLowerCase()} fashion`,
                `men's ${label.toLowerCase()}`,
                "men's clothing Nigeria",
                "premium fashion",
                "Nigerian fashion",
                "contemporary style",
                "designer wear",
                "online shopping Nigeria",
                "fast delivery Lagos",
                "WearLux fashion"
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
            title: `${capitalizedSlug} Collection | WearLux Fashion`,
            description: `Shop ${capitalizedSlug.toLowerCase()} at WearLux. Discover premium men's fashion with fast delivery across Nigeria.`,
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
            "shirts": { name: "Shirts", slug: "shirts" },
            "kaftans": { name: "Kaftans", slug: "kaftans" },
            "trousers": { name: "Trousers", slug: "trousers" },
            "two-piece-sets": { name: "Two-Piece Sets", slug: "two-piece-sets" },
            "casual-wear": { name: "Casual Wear", slug: "casual-wear" },
            "accessories": { name: "Accessories", slug: "accessories" },
            "whats-new": { name: "What's New", slug: "whats-new" },
            "native-wear": { name: "Native Wear", slug: "native-wear" },
            "footwear": { name: "Footwear", slug: "footwear" },
            "formal": { name: "Formal", slug: "formal" },
            "resort": { name: "Resort", slug: "resort" },
            "streetwear": { name: "Streetwear", slug: "streetwear" }
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
            description: `Shop ${categoryData.name} at WearLux`,
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