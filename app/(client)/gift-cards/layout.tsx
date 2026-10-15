import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
    title: "Fashion Gift Cards Nigeria",
    description: "Give the gift of choice with Missus Outfits digital fashion gift cards in Nigeria. Choose an amount from ₦10,000 to ₦150,000.",
    path: "/gift-cards",
});

export default function GiftCardsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
