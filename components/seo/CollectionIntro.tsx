import { getCategorySeo } from "@/lib/category-seo";
import { getBreadcrumbSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/config";
import StructuredData from "./StructuredData";

export default function CollectionIntro({ slug, heading = true }: { slug: string; heading?: boolean }) {
    const copy = getCategorySeo(slug);
    return <section style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px", lineHeight: 1.7 }}>
        <StructuredData schema={getBreadcrumbSchema([{ name: "Home", url: SITE_URL }, { name: copy.heading, url: `${SITE_URL}/${slug}` }])} />
        {heading && <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 16 }}>{copy.heading}</h1>}
        <p>{copy.intro}</p>
    </section>;
}
