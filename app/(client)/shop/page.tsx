import ShopClient from "./ShopClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop Adire Ready-to-Wear | Yoanne Couture Lagos",
    description: "Shop Yoanne Couture's luxury Adire ready-to-wear collection: kaftans, agbadas, dresses and contemporary African occasion wear, handcrafted in Lagos with nationwide delivery.",
    keywords: ["shop Adire ready-to-wear", "Adire dresses Lagos", "kaftans Nigeria", "agbada online Nigeria", "African occasion wear", "Lagos fashion online"],
};

export default function ShopPage() {
    return <ShopClient />;
}
