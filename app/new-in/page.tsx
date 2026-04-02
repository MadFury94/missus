import type { Metadata } from "next";
import { getNewArrivals } from "@/lib/woocommerce";
import ProductGrid from "@/components/product/ProductGrid";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
    title: `New In — Latest Arrivals | ${SITE_NAME}`,
    description: "Shop the latest arrivals at Missus. New drops every week — dresses, tops, sets and more.",
};

export const revalidate = 30;

export default async function NewInPage() {
    const products = await getNewArrivals(60);

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-secondary uppercase">New In</h1>
                <p className="text-sm text-secondary/50 mt-1">Updated daily — don&apos;t miss out</p>
            </div>
            {products.length === 0 ? (
                <div className="py-20 text-center text-secondary/40">New arrivals coming soon!</div>
            ) : (
                <ProductGrid products={products} cols={4} />
            )}
        </div>
    );
}
