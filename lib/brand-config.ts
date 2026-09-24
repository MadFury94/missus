/** Central Wearlux identity. Environment overrides can customize the new brand. */
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Wearlux";

export const BRAND_CONFIG = {
    name: brandName,
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Premium Women's Fashion & Contemporary Style",
    description: process.env.NEXT_PUBLIC_BRAND_DESCRIPTION || "Discover premium women's fashion at Wearlux. Shop curated collections of dresses, sets, tops, and contemporary styles. Free shipping on orders over ₦50,000. Nigeria's leading fashion destination.",
    shortDescription: process.env.NEXT_PUBLIC_BRAND_SHORT_DESCRIPTION || "Trendy, affordable women's fashion built for the modern Nigerian woman. Delivering style from Lagos to Abuja and beyond.",
    hqLabel: process.env.NEXT_PUBLIC_BRAND_HQ_LABEL || "Wearlux",
    logo: process.env.NEXT_PUBLIC_BRAND_LOGO || "/wearlux-logo.svg",
    logoAlt: process.env.NEXT_PUBLIC_BRAND_LOGO_ALT || brandName,
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.CONTACT_EMAIL || "hello@missusoutfits.com",
    social: {
        instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://instagram.com/missusoutfits",
        twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "https://twitter.com/missusoutfits",
        facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://facebook.com/missusoutfits",
        tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || "https://tiktok.com/@missusoutfits",
        youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "https://youtube.com/missusoutfits",
        snapchat: process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT || "https://snapchat.com/add/missusoutfits",
        whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP || "https://wa.me/2348012345678",
    },
} as const;

export const BRAND_KEYWORDS = [
    "women's fashion Nigeria", "premium dresses Lagos", "contemporary women's clothing",
    "designer fashion Nigeria", "online fashion store", "luxury women's wear",
    "trendy outfits Nigeria", "fashion boutique online", "women's designer clothing",
    "premium fashion brand", "stylish women's clothes", "fashion forward clothing",
];
