import type { Metadata } from "next";
import { getSaleProducts } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import CountdownTimer from "@/components/ui/CountdownTimer";
export const metadata: Metadata = { title: "MissusDeals — Up to 60% Off" };
export const revalidate = 60;

const SALE_TABS = ["All Sale", "Dresses", "Tops", "Bottoms", "Sets", "Under ₦15,000", "Up to 60% Off", "Almost Gone"];

export default async function SalePage() {
    const products = await getSaleProducts(60);

    return (
        <>
            {/* Sale hero */}
            <div style={{ background: "#e8002d", padding: "36px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(255,255,255,.03) 10px,rgba(255,255,255,.03) 20px)" }} />
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(60px,10vw,120px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: "-.02em", lineHeight: .9, position: "relative", zIndex: 2 }}>
                    MISSUS<br />DEALS
                </h1>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,.8)", letterSpacing: ".2em", marginTop: "12px", position: "relative", zIndex: 2 }}>
                    Up to 60% OFF · Prices As Marked
                </p>
                <div style={{ position: "relative", zIndex: 2, marginTop: "20px" }}>
                    <CountdownTimer targetHours={8} />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: "3px solid #e8002d", overflowX: "auto", background: "#fff", scrollbarWidth: "none" }} className="scrollbar-hide">
                {SALE_TABS.map((tab, i) => (
                    <button key={tab} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "12px 20px", cursor: "pointer", color: i === 0 ? "#e8002d" : "#555", whiteSpace: "nowrap", background: "none", border: "none", borderBottom: i === 0 ? "3px solid #e8002d" : "3px solid transparent", marginBottom: "-3px" }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Deal banner */}
            <div style={{ background: "#e8002d", padding: "32px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(32px,5vw,64px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: "-.01em", lineHeight: 1 }}>
                        ₦15,000<br />DRESSES
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", color: "rgba(255,255,255,.8)", marginTop: "6px", letterSpacing: ".1em" }}>
                        Selected styles · While stocks last
                    </div>
                </div>
                <button style={{ background: "#fff", color: "#e8002d", padding: "15px 36px", fontSize: "14px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                    Shop Now →
                </button>
            </div>

            {/* Products */}
            <div style={{ padding: "32px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" }}>
                        All Sale — {products.length} Products
                    </h2>
                    <select style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "8px 32px 8px 12px", background: "#fff", cursor: "pointer", outline: "none" }}>
                        <option>Sort: Best Sellers</option>
                        <option>Price: Low to High</option>
                        <option>Discount: High to Low</option>
                    </select>
                </div>

                <div className="grid-5">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {products.length >= 60 && (
                    <div style={{ textAlign: "center", marginTop: "32px" }}>
                        <button style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "#000", color: "#fff", padding: "14px 48px", fontSize: "13px", border: "none", cursor: "pointer" }}>
                            Load More Sale Items
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
