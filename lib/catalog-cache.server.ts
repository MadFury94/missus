import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { API_ENDPOINTS } from "./config";
import { getProduct } from "./woocommerce";
import { getSitemapProducts, getSitemapCategories } from "./sitemap-data";

// This project uses the existing Data Cache model, not Cache Components.
// Cache only successful, validated results. A failed refresh must throw so Next
// keeps the previous value and retries in the background on a later request.
export const getCatalogSnapshot = unstable_cache(async () => {
    const [products, categories] = await Promise.all([getSitemapProducts(), getSitemapCategories()]);
    if (!products.length) throw new Error("Refusing to replace the sitemap with an empty catalog.");
    return { products, categories };
}, ["missus-catalog-snapshot-v1", API_ENDPOINTS.woocommerce.rest, API_ENDPOINTS.woocommerce.store], { revalidate: 3600 });

const readCachedProduct = unstable_cache(async (slug: string) => {
    return getProduct(slug, { strict: true, uncached: true });
}, ["missus-product-v1", API_ENDPOINTS.woocommerce.store, API_ENDPOINTS.woocommerce.rest], { revalidate: 60 });

// Metadata and page rendering share the same version within a request.
export const getCachedProduct = cache(readCachedProduct);

export async function warmProductCache() {
    const { products } = await getCatalogSnapshot();
    // Seed known products before deployment. A failed seed fails the build rather
    // than publishing a deployment whose known product cache has never been filled.
    for (let offset = 0; offset < products.length; offset += 5) {
        await Promise.all(products.slice(offset, offset + 5).map(async ({ slug }) => {
            if (!await readCachedProduct(slug)) throw new Error(`Published product ${slug} was absent from the Store API.`);
        }));
    }
    return products.map(({ slug }) => ({ slug }));
}
