import { generatePageMetadata } from "@/lib/seo-config";
import { Suspense } from "react";
import SearchContent from "./SearchContent";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
    return generatePageMetadata({ title: "Search Women's Fashion", description: "Find dresses, matching sets, tops and more at Missus Outfits Nigeria.", path: "/search", noindex: true });
}

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
