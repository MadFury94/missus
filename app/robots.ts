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
                ],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
    };
}
