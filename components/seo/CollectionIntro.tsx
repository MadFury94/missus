import { getCategorySeo } from "@/lib/category-seo";
import { getBreadcrumbSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/config";
import StructuredData from "./StructuredData";

export default function CollectionIntro({ slug, heading = true }: { slug: string; heading?: boolean }) {
    const copy = getCategorySeo(slug);
    return <StructuredData schema={getBreadcrumbSchema([{ name: "Home", url: SITE_URL }, { name: copy.heading, url: `${SITE_URL}/${slug}` }])} />;
}
