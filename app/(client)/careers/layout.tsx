import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    return generatePageMetadata({ title: "Careers at Missus Outfits", description: "Careers at Missus Outfits at Missus Outfits Nigeria.", path: "/careers", noindex: true });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
