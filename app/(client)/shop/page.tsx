import ShopClient from "./ShopClient";
import CollectionIntro from "@/components/seo/CollectionIntro";
import { getCategorySeo } from "@/lib/category-seo";
import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    const copy = getCategorySeo("shop");
    return generatePageMetadata({ title: copy.title, description: copy.description, path: "/shop" });
}
export default function Page() {
    return <><CollectionIntro slug="shop" heading={false} /><ShopClient /></>;
}
