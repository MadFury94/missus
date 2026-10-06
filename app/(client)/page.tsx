import type { Metadata } from "next";
import YoanneHome from "@/components/yoanne/YoanneHome";
import { BRAND_CONFIG } from "@/lib/brand-config";

export const metadata: Metadata = {
    title: { absolute: "Yoanne Couture | Luxury Adire Ready-to-Wear in Lagos" },
    description: "Shop luxury Adire ready-to-wear, kaftans, agbadas and contemporary African fashion from Yoanne Couture in Lekki Phase 1, Lagos. Handcrafted Nigerian style with nationwide delivery.",
    keywords: ["Yoanne Couture Lagos", "luxury Adire ready-to-wear", "Adire kaftans Lagos", "Nigerian African fashion", "buy Adire online Nigeria", "Lagos fashion designer"],
    alternates: { canonical: "/" },
    openGraph: {
        title: "Yoanne Couture | Luxury Adire Ready-to-Wear in Lagos",
        description: "Discover handcrafted Adire kaftans, agbadas and contemporary African fashion from Yoanne Couture, Lagos.",
        url: "/",
        siteName: "Yoanne Couture",
        locale: "en_NG",
        type: "website",
        images: [{ url: "/Yoann/Elegant%20Blue%20Batik%20Kaftan%20Portrait.png", width: 1024, height: 1536, alt: "Elegant blue Adire kaftan by Yoanne Couture" }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Yoanne Couture | Luxury Adire Ready-to-Wear in Lagos",
        description: "Handcrafted Adire kaftans, agbadas and modern African fashion from Lagos.",
        images: ["/Yoann/Elegant%20Blue%20Batik%20Kaftan%20Portrait.png"]
    }
};

export default function HomePage() {
    return <YoanneHome />;
}
