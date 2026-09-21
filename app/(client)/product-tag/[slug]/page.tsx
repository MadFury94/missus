import { Metadata } from "next";
import { redirect } from "next/navigation";

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

    // Old WooCommerce product tag URLs - redirect to shop with tag parameter
    // The shop page can handle tag filtering if implemented
    redirect(`/shop?tag=${tag}`);
}