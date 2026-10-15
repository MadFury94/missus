import NewInClient from "./NewInClient";
import CollectionIntro from "@/components/seo/CollectionIntro";
import { getCategorySeo } from "@/lib/category-seo";
import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    const copy = getCategorySeo("new-in");
    return generatePageMetadata({ title: copy.title, description: copy.description, path: "/new-in" });
}
export default function Page() {
    return <><CollectionIntro slug="new-in" heading={false} /><NewInClient /></>;
}
