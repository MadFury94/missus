import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/account", "/checkout", "/cart"] },
            { userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"], disallow: "/" },
        ],
        // Query URLs can be crawled so engines can read their clean canonicals.
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
