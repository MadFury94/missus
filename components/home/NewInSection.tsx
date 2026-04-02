import Link from "next/link";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";

export default function NewInSection({ products }: { products: StoreProduct[] }) {
    return (
        <>
            <div style={{ background: "#000", color: "#fff", padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>New In</span>
                    <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,.6)", marginLeft: "12px" }}>Updated daily — don&apos;t miss out</span>
                </div>
                <Link href="/category/whats-new" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", textDecoration: "underline" }}>
                    View All →
                </Link>
            </div>

            <div style={{ padding: "20px 20px 32px" }}>
                <div className="grid-5">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                <div style={{ textAlign: "center", marginTop: "28px" }}>
                    <Link href="/category/whats-new" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "#000", color: "#fff", padding: "13px 28px", fontSize: "13px" }}>
                        View All New Arrivals
                    </Link>
                </div>
            </div>
        </>
    );
}
