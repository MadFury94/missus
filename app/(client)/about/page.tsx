import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
    title: "About WearLux | Premium Men's Fashion Brand",
    description: "Learn about WearLux, a men's fashion brand creating affordable luxury menswear with premium materials, exceptional craftsmanship and lasting confidence for the modern man in Nigeria.",
    keywords: [
        "about WearLux menswear",
        "Nigerian fashion brand",
        "menswear company",
        "premium fashion story",
        "contemporary fashion brand",
        "luxury menswear Nigeria",
        "premium men's clothing",
        "fashion brand values"
    ],
    path: "/about",
    ogImage: "/wearlux/wearlux-logo.png"
});

export default function AboutPage() {
    return <AboutClient />;
}
