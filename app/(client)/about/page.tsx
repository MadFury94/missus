import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
    title: "About WearLux | Premium Men's Fashion Brand",
    description: "Learn about WearLux, a Nigerian menswear brand creating affordable luxury clothing for the modern man.",
    keywords: [
        "about WearLux menswear",
        "Nigerian fashion brand",
        "menswear company",
        "premium fashion story",
        "contemporary fashion brand",
        "luxury menswear Nigeria",
        "fashion brand values"
    ],
    path: "/about",
    ogImage: "/wearlux/wearlux-logo.png"
});

export default function AboutPage() {
    return <AboutClient />;
}