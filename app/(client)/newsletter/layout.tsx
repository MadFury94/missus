import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    return generatePageMetadata({ title: "Missus Newsletter", description: "Missus Newsletter at Missus Outfits Nigeria.", path: "/newsletter", noindex: true });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
