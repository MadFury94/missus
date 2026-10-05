import { Suspense } from "react";
import SearchContent from "./SearchContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search Fashion | Find Your Perfect Style",
    description: "Search through WearLux collection of premium men's fashion. Find shirts, sets, kaftans, and more by style, color, or trend. Discover your perfect fashion pieces.",
    keywords: [
        "fashion search",
        "find men's clothing",
        "search shirts Nigeria",
        "fashion finder",
        "clothing search engine",
        "style search",
        "fashion discovery",
        "find fashion Nigeria"
    ],
    openGraph: {
        title: "Search Fashion | Find Your Perfect Style | WearLux",
        description: "Search through our collection of premium men's fashion. Find your perfect style among shirts, sets, kaftans, and more.",
    },
    twitter: {
        title: "Search Fashion | Find Your Perfect Style | WearLux",
        description: "Search through our collection of premium men's fashion. Find your perfect style.",
    },
    robots: {
        index: false, // Don't index search pages
        follow: true
    }
};

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{ background: "#000", padding: "32px 20px 28px" }}>
                <div style={{ maxWidth: "680px", margin: "0 auto", height: "52px", background: "rgba(255,255,255,.08)" }} />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
