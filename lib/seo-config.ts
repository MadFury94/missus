import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

// Brand configuration
export const BRAND_CONFIG = {
    name: "Missus",
    tagline: "Premium Women's Fashion & Contemporary Style",
    description: "Discover premium women's fashion at Missus. Shop curated collections of dresses, sets, tops, and contemporary styles. Free shipping on orders over ₦50,000. Nigeria's leading fashion destination.",
    keywords: [
        "women's fashion Nigeria",
        "premium dresses Lagos",
        "contemporary women's clothing",
        "designer fashion Nigeria",
        "online fashion store",
        "luxury women's wear",
        "trendy outfits Nigeria",
        "fashion boutique online",
        "women's designer clothing",
        "premium fashion brand",
        "stylish women's clothes",
        "fashion forward clothing"
    ],
    social: {
        instagram: "@missusoutfits",
        twitter: "@missusoutfits",
        facebook: "missusoutfits",
        tiktok: "@missusoutfits"
    }
};

// Default metadata template
export const DEFAULT_METADATA: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        template: `%s | ${BRAND_CONFIG.name}`,
        default: `${BRAND_CONFIG.name} - ${BRAND_CONFIG.tagline}`
    },
    description: BRAND_CONFIG.description,
    keywords: BRAND_CONFIG.keywords,
    authors: [{ name: BRAND_CONFIG.name }],
    creator: BRAND_CONFIG.name,
    publisher: BRAND_CONFIG.name,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_NG",
        url: SITE_URL,
        siteName: BRAND_CONFIG.name,
        title: `${BRAND_CONFIG.name} - ${BRAND_CONFIG.tagline}`,
        description: BRAND_CONFIG.description,
        images: [{
            url: "/og-image.jpg",
            width: 1200,
            height: 630,
            alt: `${BRAND_CONFIG.name} - Premium Women's Fashion`
        }]
    },
    twitter: {
        card: "summary_large_image",
        site: BRAND_CONFIG.social.twitter,
        creator: BRAND_CONFIG.social.twitter,
        title: `${BRAND_CONFIG.name} - ${BRAND_CONFIG.tagline}`,
        description: BRAND_CONFIG.description,
        images: ["/twitter-image.jpg"]
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
        // Add other verification codes as needed
    },
    alternates: {
        canonical: SITE_URL,
    },
    other: {
        'facebook-domain-verification': process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION || '',
    }
};

// Generate page-specific metadata
export function generatePageMetadata({
    title,
    description,
    keywords = [],
    path = "/",
    ogImage,
    noindex = false
}: {
    title: string;
    description: string;
    keywords?: string[];
    path?: string;
    ogImage?: string;
    noindex?: boolean;
}): Metadata {
    const url = `${SITE_URL.replace(/\/$/, "")}${path}`;
    const combinedKeywords = [...BRAND_CONFIG.keywords, ...keywords];

    return {
        title,
        description: description.slice(0, 160),
        keywords: combinedKeywords,
        robots: noindex ? { index: false, follow: false } : undefined,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            images: ogImage ? [{
                url: ogImage,
                width: 1200,
                height: 630,
                alt: title
            }] : undefined
        },
        twitter: {
            title,
            description,
            images: ogImage ? [ogImage] : undefined
        }
    };
}