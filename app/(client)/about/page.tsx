import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { generatePageMetadata } from "@/lib/seo-config";

export function generateMetadata(): Metadata {
    return generatePageMetadata({ title: "About Missus Outfits", description: "Meet Missus Outfits, a trendy, affordable women's fashion brand for Nigerian women. Discover our story and shop your next look.", path: "/about" });
}

export default function AboutPage() {
    return <AboutClient />;
}