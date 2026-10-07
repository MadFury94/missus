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
            "two-piece-sets", "casual-shorts", "linen-shirts", "crop-shirts",
            "t-shirts", "linen-pants", "casual-pants", "denim-pants-jeans",
            "denim-shorts", "whats-new", "discount-sale"
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
            { slug: "two-piece-sets" },
            { slug: "casual-shorts" },
            { slug: "linen-shirts" },
            { slug: "crop-shirts" },
            { slug: "t-shirts" },
            { slug: "linen-pants" },
            { slug: "casual-pants" },
            { slug: "denim-pants-jeans" },
            { slug: "denim-shorts" },
            { slug: "whats-new" },
            { slug: "discount-sale" }
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
            "casual-shorts": { name: "Casual Shorts", description: "Shop relaxed casual shorts at WearLux for everyday comfort, warm-weather dressing and effortless modern menswear across Nigeria." },
            "linen-shirts": { name: "Linen Shirts", description: "Discover breathable linen shirts at WearLux, designed for polished Lagos days, resort escapes and easy contemporary style." },
            "crop-shirts": { name: "Crop Shirts", description: "Shop modern crop shirts at WearLux for a confident, contemporary menswear wardrobe with expressive proportions and premium fabrics." },
            "t-shirts": { name: "T-Shirts", description: "Find premium everyday T-shirts at WearLux, cut for comfort and easy styling with trousers, denim and two-piece looks." },
            "linen-pants": { name: "Linen Pants", description: "Shop lightweight linen pants at WearLux for breathable tailoring, relaxed resort dressing and refined everyday outfits." },
            "casual-pants": { name: "Casual Pants", description: "Discover versatile casual pants at WearLux, combining relaxed comfort with the clean lines of modern Nigerian menswear." },
            "denim-pants-jeans": { name: "Denim Pants & Jeans", description: "Shop denim pants and jeans at WearLux, from everyday straight fits to modern statement denim designed for lasting wear." },
            "denim-shorts": { name: "Denim Shorts", description: "Find durable, easy-to-style denim shorts at WearLux for casual weekends, holidays and warm-weather Lagos dressing." },
            "two-piece-sets": {
                name: "Two-Piece Sets",
                description: "Shop coordinated two-piece sets at WearLux for easy, polished menswear with matching shirts and pants made for modern Nigerian style."
            },
            "whats-new": {
                name: "What's New",
                description: "Discover the latest arrivals at WearLux. Shop new drops, trending pieces, and fresh styles added weekly to our collection."
            },
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
            "casual-shorts": { name: "Casual Shorts", slug: "casual-shorts" },
            "linen-shirts": { name: "Linen Shirts", slug: "linen-shirts" },
            "crop-shirts": { name: "Crop Shirts", slug: "crop-shirts" },
            "t-shirts": { name: "T-Shirts", slug: "t-shirts" },
            "linen-pants": { name: "Linen Pants", slug: "linen-pants" },
            "casual-pants": { name: "Casual Pants", slug: "casual-pants" },
            "denim-pants-jeans": { name: "Denim Pants & Jeans", slug: "denim-pants-jeans" },
            "denim-shorts": { name: "Denim Shorts", slug: "denim-shorts" },
            "two-piece-sets": { name: "Two-Piece Sets", slug: "two-piece-sets" },
            "whats-new": { name: "What's New", slug: "whats-new" },
            "discount-sale": { name: "Sale", slug: "discount-sale" }
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
