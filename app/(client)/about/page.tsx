import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
    title: "About Missus | Premium Women's Fashion Brand",
    description: "Learn about Missus, Nigeria's premier destination for contemporary women's fashion. Discover our story, values, and commitment to empowering women through style and quality fashion.",
    keywords: [
        "about Missus fashion",
        "Nigerian fashion brand",
        "women's fashion company",
        "premium fashion story",
        "contemporary fashion brand",
        "luxury women's wear Nigeria",
        "fashion brand values"
    ],
    path: "/about",
    ogImage: "/about-missus.jpg"
});

export default function AboutPage() {
    return <AboutClient />;
}