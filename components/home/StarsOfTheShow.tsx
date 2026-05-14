import Link from "next/link";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";

export default function StarsOfTheShow({ products }: { products: StoreProduct[] }) {
    if (!products.length) return null;

    return (
        <div style={{ background: "#fff", padding: "0 0 40px" }}>
            {/* Header */}
            <div style={{ background: "#000", color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                    <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "22px", fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" }}>
                        ✦ Stars of the Show
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,.55)", marginLeft: "12px" }}>
                        The pieces everyone&apos;s talking about
                    </span>
                </div>
                <Link href="/shop?orderby=popularity" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", textDecoration: "underline" }}>
                    View All →
                </Link>
            </div>

            <div style={{ padding: "24px 20px 0" }}>
                <div className="grid-5">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                <div style={{ textAlign: "center", marginTop: "28px" }}>
                    <Link href="/shop?orderby=popularity" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow-condensed)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "#000", color: "#fff", padding: "13px 32px", fontSize: "13px", textDecoration: "none" }}>
                        See All Popular Picks
                    </Link>
                </div>
            </div>
        </div>
    );
}
