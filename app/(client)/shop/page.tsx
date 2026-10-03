import ShopClient from "./ShopClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ready to Wear — Yoanne Couture",
    description: "Shop Yoanne Couture's Adire ready-to-wear collection, handcrafted in Lekki Phase 1, Lagos.",
};

export default function ShopPage() {
    return <ShopClient />;
}
