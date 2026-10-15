import { generatePageMetadata } from "@/lib/seo-config";
export function generateMetadata() {
    return generatePageMetadata({ title: "Contact Missus Outfits", description: "Get in touch with Missus Outfits for help with orders, sizing and women's fashion shopping in Nigeria.", path: "/contact" });
}
import ContactClient from "./ContactClient";

export default function ContactPage() {
    return <ContactClient />;
}
