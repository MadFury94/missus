import { Metadata } from "next";
import { redirect } from "next/navigation";
import { woocommerce } from "@/lib/woocommerce";

interface Props {
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const tag = params.slug;

    return {
        title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Products | Missus`,
        description: `Shop ${tag} products at Missus. Premium fashion with fast delivery.`,
        openGraph: {
            title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Products | Missus`,
            description: `Shop ${tag} products at Missus. Premium fashion with fast delivery.`,
        },
        twitter: {
            title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Products | Missus`,
            description: `Shop ${tag} products at Missus. Premium fashion with fast delivery.`,
        },
    };
}

export default async function ProductTagPage({ params }: Props) {
    const tag = params.slug;

    try {
        // Try to fetch products with this tag
        const products = await woocommerce.get("products", {
            tag: tag,
            per_page: 1, // Just check if any exist
            status: "publish"
        });

        // If no products found with this tag, redirect to shop
        if (!products.data || products.data.length === 0) {
            redirect("/shop");
        }

        // Redirect to shop with tag filter - you can modify this based on your shop page's filter system
        redirect(`/shop?tag=${tag}`);

    } catch (error) {
        console.error("Error fetching products by tag:", error);
        redirect("/shop");
    }
}