import { Suspense } from "react";
import SearchContent from "./SearchContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search Fashion | Find Your Perfect Style",
    description: "Search through Missus collection of premium women's fashion. Find dresses, sets, tops, and more by style, color, or trend. Discover your perfect fashion pieces.",
    keywords: [
        "fashion search",
        "find women's clothing",
        "search dresses Nigeria",
        "fashion finder",
        "clothing search engine",
        "style search",
        "fashion discovery",
        "find fashion Nigeria"
    ],
    openGraph: {
        title: "Search Fashion | Find Your Perfect Style | Missus",
        description: "Search through our collection of premium women's fashion. Find your perfect style among dresses, sets, tops, and more.",
    },
    twitter: {
        title: "Search Fashion | Find Your Perfect Style | Missus",
        description: "Search through our collection of premium women's fashion. Find your perfect style.",
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
