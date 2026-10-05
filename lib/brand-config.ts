/** Central Wearlux identity. Environment overrides can customize the new brand. */
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WearLux";

export const BRAND_CONFIG = {
    name: brandName,
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Style for the Modern Man",
    description: process.env.NEXT_PUBLIC_BRAND_DESCRIPTION || "WearLux is a Nigerian men's fashion brand for modern men who value style, quality, individuality and sophistication. Shop affordable luxury menswear, native wear and accessories online.",
    shortDescription: process.env.NEXT_PUBLIC_BRAND_SHORT_DESCRIPTION || "Affordable luxury menswear made for lasting confidence. Premium quality, distinctive style and everyday sophistication.",
    hqLabel: process.env.NEXT_PUBLIC_BRAND_HQ_LABEL || "WearLux",
    logo: process.env.NEXT_PUBLIC_BRAND_LOGO || "/wearlux/wearlux-logo.png",
    logoAlt: process.env.NEXT_PUBLIC_BRAND_LOGO_ALT || brandName,
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@wearlux.example",
    social: {
        instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://instagram.com/b_and_l_wearlux",
        twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "https://twitter.com/BandLWEARLUX",
        facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://facebook.com/Wear-Lux",
        tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || "https://tiktok.com/@b_and_l_wearlux",
        youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "https://youtube.com/@b_and_l_wearlux",
        snapchat: process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT || "https://snapchat.com/add/wearlux_12",
        whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP || "https://wa.me/2348140172705",
    },
} as const;

export const BRAND_KEYWORDS = [
    "men's fashion Nigeria", "men's clothing Lagos", "Nigerian menswear",
    "affordable luxury menswear", "men's native wear", "senator wear", "agbada",
    "men's kaftan", "men's shirts", "men's trousers", "men's footwear",
    "men's accessories", "online men's fashion Nigeria", "modern men's style",
];

