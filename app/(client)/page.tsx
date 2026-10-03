import type { Metadata } from "next";
import YoanneHome from "@/components/yoanne/YoanneHome";
import { BRAND_CONFIG } from "@/lib/brand-config";

export const metadata: Metadata = {
    title: { absolute: BRAND_CONFIG.homepage.name + " \u2014 Adire Ready-to-Wear, Lagos" },
    description: "Yoanne Couture is a luxury Adire ready-to-wear house in Lekki Phase 1, Lagos \u2014 modern African fashion crafted for comfort and designed for elegance.",
};

export default function HomePage() {
    return <YoanneHome />;
}
