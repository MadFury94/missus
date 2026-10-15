import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    return generatePageMetadata({ title: "Check Gift Card Balance", description: "Check Gift Card Balance at Missus Outfits Nigeria.", path: "/gift-card-balance", noindex: true });
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
