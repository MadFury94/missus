import type { Metadata } from "next";
import { SITE_URL } from "./config";
import { canonicalLink } from "./seo-urls";

export const HOME_TITLE = "Women's Fashion Online in Nigeria | Missus Outfits";
export const HOME_DESCRIPTION = "Shop affordable women's fashion in Nigeria: dresses, matching sets, tops and more. Free shipping on orders ₦150,000+ at Missus Outfits.";
export const SOCIAL_IMAGE = "/Desktop view 1.jpg";

export function generatePageMetadata({ title, description, path = "/", ogImage = SOCIAL_IMAGE, noindex = false }: {
    title: string; description: string; path?: string; ogImage?: string; noindex?: boolean;
    // Accepted for older callers, but never emitted as a meta tag.
    keywords?: string[];
}): Metadata {
    const fullTitle = title.includes("Missus Outfits") ? title : `${title} | Missus Outfits`;
    const summary = description.replace(/\s+/g, " ").trim().slice(0, 154);
    const url = new URL(canonicalLink(path).split(/[?#]/)[0], SITE_URL).href;
    const image = new URL(ogImage, SITE_URL).href;
    return {
        title: { absolute: fullTitle }, description: summary,
        alternates: { canonical: url },
        ...(noindex ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
        openGraph: {
            type: "website", locale: "en_NG", siteName: "Missus Outfits",
            title: fullTitle, description: summary, url,
            images: [{ url: image, alt: fullTitle, ...(ogImage === SOCIAL_IMAGE ? { width: 2048, height: 1152 } : {}) }],
        },
        twitter: { card: "summary_large_image", title: fullTitle, description: summary, images: [image] },
    };
}
export const DEFAULT_METADATA: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: HOME_TITLE, template: "%s | Missus Outfits" }, description: HOME_DESCRIPTION,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: { type: "website", siteName: "Missus Outfits", locale: "en_NG", title: HOME_TITLE, description: HOME_DESCRIPTION, images: [{ url: SOCIAL_IMAGE, width: 2048, height: 1152, alt: "Missus Outfits women's fashion in Nigeria" }] },
    twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION, images: [SOCIAL_IMAGE] },
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION },
};
