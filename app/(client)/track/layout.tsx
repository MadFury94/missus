import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    return generatePageMetadata({ title: "Track Your Order", description: "Track Your Order at Missus Outfits Nigeria.", path: "/track", noindex: true });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
