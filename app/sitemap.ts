import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { categoryPath } from "@/lib/seo-urls";
import { modificationDate } from "@/lib/sitemap-data";
import { getCatalogSnapshot } from "@/lib/catalog-cache.server";

// Sitemap data is read from the cached catalog at request time. Avoid running
// the CMS call during `next build`, where Vercel may not expose runtime envs.
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // One cached snapshot prevents a failed page/category fetch publishing a partial sitemap.
    const { categories, products } = await getCatalogSnapshot();
    const routes: MetadataRoute.Sitemap = [
        ...["", "/shop", "/new-in", "/sale", "/gift-cards", "/about", "/contact", "/faq", "/shipping", "/returns", "/size-guide", "/privacy", "/terms"].map(path => ({ url: `${SITE_URL}${path}` })),
        ...categories.filter(c => c.count > 0).map(c => ({ url: `${SITE_URL}${categoryPath(c.slug)}` })),
        ...products.map(p => ({ url: `${SITE_URL}/product/${p.slug}`, ...(modificationDate(p.date_modified_gmt) ? { lastModified: modificationDate(p.date_modified_gmt) } : {}) })),
    ];
    return [...new Map(routes.map(route => [route.url, route])).values()];
}
