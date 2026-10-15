import type { StoreProduct } from "./woocommerce";
import { decodeHtmlEntities } from "./api-helpers";

export function productType(product: StoreProduct) {
    const types: Record<string, string> = { dresses: "Dress", "matching-sets": "Matching Set", tops: "Top", bottoms: "Bottoms", "athleisure-loungewear": "Loungewear", "gift-shop": "Gift" };
    const category = product.categories?.find(c => types[c.slug]);
    if (category) return types[category.slug];
    // Some catalog items only belong to broad merchandising collections.
    const name = decodeHtmlEntities(product.name);
    const namedTypes: Array<[RegExp, string]> = [
        [/\bgift\s*card\b/i, "Gift Card"], [/\bgift\s*box\b/i, "Gift Box"],
        [/\bdress\b/i, "Dress"], [/\b(?:co-ord|matching|two-piece)\b|\bset\b/i, "Matching Set"],
        [/\bjumpsuit\b/i, "Jumpsuit"], [/\bskirt\b/i, "Skirt"], [/\bshorts\b/i, "Shorts"],
        [/\b(?:trousers|pants|jeans)\b/i, "Trousers"], [/\b(?:top|blouse|shirt)\b/i, "Top"],
    ];
    return namedTypes.find(([pattern]) => pattern.test(name))?.[1] || "Women's Fashion";
}

export function productDescription(product: StoreProduct) {
    const name = decodeHtmlEntities(product.name);
    const details = decodeHtmlEntities((product.short_description || product.description || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
    return `${name}: ${details || `Shop this ${productType(product).toLowerCase()} at Missus Outfits. Explore affordable women's fashion in Nigeria.`}`;
}

export function productImageAlt(product: StoreProduct, index = 0) {
    const supplied = product.images?.[index]?.alt?.trim();
    if (supplied && !/^missus(?: outfits)?$/i.test(supplied)) return decodeHtmlEntities(supplied);
    const colour = product.attributes?.find(a => /^(colou?r)$/i.test(a.name))?.terms?.map(t => t.name).join(", ");
    return `${decodeHtmlEntities(product.name)}, ${colour ? `${colour} ` : ""}${productType(product).toLowerCase()} by Missus${index ? ", alternate view" : ""}`;
}
