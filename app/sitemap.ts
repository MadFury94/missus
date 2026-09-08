import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getProducts, getCategories } from "@/lib/woocommerce";

export const revalidate = 3600; // regenerate once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = SITE_URL.replace(/\/$/, "");

    // Static routes with enhanced priorities and frequencies
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${base}/new-in`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${base}/sale`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
        { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.7 },
        { url: `${base}/shipping`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${base}/returns`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${base}/size-guide`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${base}/careers`, changeFrequency: "weekly", priority: 0.5 },
        { url: `${base}/track`, changeFrequency: "monthly", priority: 0.4 },
        { url: `${base}/gift-card-balance`, changeFrequency: "monthly", priority: 0.4 },
        { url: `${base}/newsletter`, changeFrequency: "monthly", priority: 0.4 },
        { url: `${base}/search`, changeFrequency: "daily", priority: 0.5 },
    ];

    // Category routes with enhanced metadata
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await getCategories();
        categoryRoutes = categories.map((c) => ({
            url: `${base}/category/${c.slug}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8, // Higher priority for categories
        }));
    } catch {
        // Silently skip if WooCommerce is unreachable during build
    }

    // Product routes with enhanced metadata
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        // Fetch up to 200 products in batches accepted by the Store API.
        const products = await getProducts({ perPage: 100 });
        if (products.length === 100) {
            products.push(...await getProducts({ perPage: 100, page: 2 }));
        }
        productRoutes = products.map((p) => ({
            url: `${base}/product/${p.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9, // Higher priority for products
        }));
    } catch {
        // Silently skip if WooCommerce is unreachable during build
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
