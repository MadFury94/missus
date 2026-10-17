import { decodeHtmlEntities } from "./api-helpers";

// Each entry: [displayHeading, seoTitle (for <title> tag), metaDescription, openingParagraph]
// displayHeading = clean label shown in the <h1> on the page
// seoTitle       = keyword-rich version used only in the browser tab / Google result
const COLLECTIONS: Record<string, [string, string, string, string]> = {
    dresses: [
        "Dresses",
        "Women's Dresses Nigeria",
        "Shop women's dresses in Nigeria for casual days, parties and evenings out. Discover affordable styles at Missus Outfits.",
        "Find women's dresses for the plans on your calendar, from relaxed afternoons to evenings out. Explore shapes, colours and lengths that suit your personal style.",
    ],
    "matching-sets": [
        "Matching Sets",
        "Matching Sets Lagos & Nigeria",
        "Shop matching sets in Lagos and across Nigeria. Find affordable co-ord outfits and easy everyday looks at Missus Outfits.",
        "Matching sets make getting dressed feel simple. Wear your pieces together for an easy outfit, or mix each piece with favourites you already own for more ways to style them.",
    ],
    tops: [
        "Tops",
        "Women's Tops Nigeria",
        "Shop affordable women's tops in Nigeria. Refresh your everyday outfits with new styles from Missus Outfits.",
        "Refresh your outfit rotation with women's tops you can make your own. Pair a new favourite with trousers, skirts or shorts, and style it around the plans that matter to you.",
    ],
    bottoms: [
        "Bottoms",
        "Women's Bottoms Nigeria",
        "Shop women's bottoms in Nigeria at Missus Outfits. Find affordable pieces to pair with your favourite tops and matching layers.",
        "Build an outfit from the bottom up with pieces that work with your favourite tops. Explore women's bottoms for everyday dressing, weekend plans and the moments in between.",
    ],
    "athleisure-loungewear": [
        "Athleisure & Loungewear",
        "Athleisure & Loungewear Nigeria",
        "Shop women's athleisure and loungewear in Nigeria. Explore relaxed, affordable outfits at Missus Outfits.",
        "Make room for relaxed dressing with women's athleisure and loungewear. Explore easy outfit ideas for quiet mornings, casual catch-ups and days when comfort is part of your style.",
    ],
    "gift-shop": [
        "Gift Shop",
        "Gifts for Women Nigeria",
        "Explore gifts for women in Nigeria at the Missus Outfits Gift Shop. Find a thoughtful treat for someone special or yourself.",
        "Find inspiration for a thoughtful surprise in the Missus Gift Shop. Explore the current selection for birthdays, celebrations or a small treat that says you have someone in mind.",
    ],
    shop: [
        "Shop All Women's",
        "Affordable Women's Fashion Nigeria",
        "Shop affordable women's fashion in Nigeria at Missus Outfits. Explore dresses, matching sets, tops and more. Free shipping on orders ₦150,000+.",
        "Explore affordable women's fashion for your everyday plans and special occasions. Browse dresses, matching sets, tops, bottoms and relaxed outfits, and find a look that feels like you.",
    ],
    "new-in": [
        "New In",
        "New Women's Fashion Nigeria",
        "Discover new women's fashion in Nigeria at Missus Outfits. Shop the latest dresses, matching sets and tops at affordable prices.",
        "See what is new at Missus and refresh your wardrobe with the latest additions. Explore the current drop for fresh outfit ideas that work with pieces you already love.",
    ],
    sale: [
        "Sale",
        "Women's Clothing Sale Nigeria",
        "Shop the women's clothing sale at Missus Outfits Nigeria. Discover reduced prices on available styles, with free shipping on orders ₦150,000+.",
        "Explore the Missus sale for reduced prices on available women's clothing. Find a new favourite, revisit a style you have been watching, or try something different for your next outfit.",
    ],
};

export function getCategorySeo(slug: string, label?: string) {
    const name = decodeHtmlEntities(label || slug.replace(/-/g, " "));
    const entry = COLLECTIONS[slug];

    const displayHeading = entry?.[0] ?? name;
    const seoHeading = entry?.[1] ?? `${name} Nigeria`;
    const description = entry?.[2] ?? `Shop ${name.toLowerCase()} at Missus Outfits. Explore affordable women's fashion for Lagos, Abuja, Port Harcourt and across Nigeria.`;
    const opening = entry?.[3] ?? `Explore our ${name.toLowerCase()} collection for fresh ways to dress for your plans. Find inspiration in the current selection and choose pieces that fit your own approach to style.`;

    return {
        // heading = clean label for the visible <h1> on the page
        heading: displayHeading,
        // seoHeading = keyword-rich version for <title> / meta only
        seoHeading,
        title: `${seoHeading.slice(0, 41).trim()} | Missus Outfits`,
        description,
        intro: `${opening} Whether you are shopping from Lagos, Abuja, Port Harcourt or elsewhere in Nigeria, take a moment to explore the available colours, sizes and product details before choosing. Think about how each piece will work with your wardrobe, from your go-to shoes to the accessories you reach for most. Use the filters to narrow your selection, compare the current prices, and check the size guide for help with fit. Missus brings a trendy, affordable approach to getting dressed, with free shipping on orders ₦150,000+. Save your favourites and come back when you are ready to put your next look together.`,
    };
}
