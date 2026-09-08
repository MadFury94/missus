import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
    const base = SITE_URL.replace(/\/$/, "");

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/",
                    "/api/",
                    "/account/",
                    "/checkout/",
                    "/cart",
                    "/*?*", // Disallow URLs with query parameters
                    "/search/*", // Allow search pages but not with parameters
                ],
                crawlDelay: 1,
            },
            // Special rules for search engines
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/api/",
                    "/account/",
                    "/checkout/",
                    "/cart"
                ],
            },
            // Block aggressive crawlers
            {
                userAgent: [
                    "AhrefsBot",
                    "SemrushBot",
                    "MJ12bot",
                    "DotBot"
                ],
                disallow: "/",
            }
        ],
        sitemap: `${base}/sitemap.xml`,
        host: base,
    };
}
