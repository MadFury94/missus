/** Central store identity. Missus defaults preserve the current storefront. */
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Missus";

export const BRAND_CONFIG = {
    name: brandName,
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Affordable Women's Fashion in Nigeria",
    description: process.env.NEXT_PUBLIC_BRAND_DESCRIPTION || "Shop trendy, affordable women's fashion in Nigeria at Missus Outfits. Free shipping on orders ₦150,000+.",
    shortDescription: process.env.NEXT_PUBLIC_BRAND_SHORT_DESCRIPTION || "Trendy, affordable women's fashion built for the modern Nigerian woman. Delivering style from Lagos to Abuja and beyond.",
    hqLabel: process.env.NEXT_PUBLIC_BRAND_HQ_LABEL || "Missus HQ",
    logo: process.env.NEXT_PUBLIC_BRAND_LOGO || "/missus-logo.webp",
    logoAlt: process.env.NEXT_PUBLIC_BRAND_LOGO_ALT || brandName,
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.CONTACT_EMAIL || "hello@missusoutfits.com",
    social: {
        instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://instagram.com/missusoutfits",
        twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "https://twitter.com/missusoutfits",
        facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://facebook.com/missusoutfits",
        tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || "https://tiktok.com/@missusoutfits",
        youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "https://youtube.com/missusoutfits",
        snapchat: process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT || "https://snapchat.com/add/missusoutfits",
        whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP || "",
    },
} as const;
