import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
    title: "About Yoanne Couture | Lagos Adire Fashion House",
    description: "Discover the story behind Yoanne Couture, a Lagos fashion house bringing handcrafted Adire textiles into modern kaftans, agbadas and contemporary African ready-to-wear.",
    keywords: [
        "about Yoanne Couture",
        "Lagos Adire fashion house",
        "Nigerian fashion brand story",
        "contemporary African fashion",
        "luxury Adire clothing Nigeria",
        "handcrafted kaftans Lagos",
        "African fashion brand values"
    ],
    path: "/about",
    ogImage: "/Yoann/Blue%20Agbada%20at%20Golden%20Hour.png"
});

export default function AboutPage() {
    return <AboutClient />;
}
