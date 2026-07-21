import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getProducts, getCategories } from "@/lib/woocommerce";

export const revalidate = 3600; // regenerate once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = SITE_URL.replace(/\/$/, "");

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${base}/new-in`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${base}/sale`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
        { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${base}/shipping`, changeFrequency: "monthly", priority: 0.4 },
        { url: `${base}/returns`, changeFrequency: "monthly", priority: 0.4 },
        { url: `${base}/size-guide`, changeFrequency: "monthly", priority: 0.4 },
        { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ];

    // Category routes
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await getCategories();
        categoryRoutes = categories.map((c) => ({
            url: `${base}/category/${c.slug}`,
            changeFrequency: "daily" as const,
            priority: 0.7,
        }));
    } catch {
        // Silently skip if WooCommerce is unreachable during build
    }

    // Product routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const products = await getProducts({ perPage: 100 });
        productRoutes = products.map((p) => ({
            url: `${base}/product/${p.slug}`,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));
    } catch {
        // Silently skip if WooCommerce is unreachable during build
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
