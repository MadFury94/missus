import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    return generatePageMetadata({ title: "Frequently Asked Questions", description: "Frequently Asked Questions at Missus Outfits Nigeria.", path: "/faq", noindex: false });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
