"use client";
import { useState, useEffect } from "react";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";

const SORT_OPTIONS = [
    { label: "Sort: Featured", value: "" },
    { label: "Newest First", value: "date" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
];

const SUB_TABS = ["For You", "What's New", "MissusDeals", "Dresses", "Sets", "Tops", "Bottoms", "Athleisure"];

export default function ShopPage() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState(60);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ per_page: String(perPage) });
        if (sort === "date") { params.set("orderby", "date"); params.set("order", "desc"); }
        if (sort === "price-asc") { params.set("orderby", "price"); params.set("order", "asc"); }
        if (sort === "price-desc") { params.set("orderby", "price"); params.set("order", "desc"); }

        fetch(`/api/products?${params}`)
            .then((r) => r.json())
            .then((data) => setProducts(data.products ?? []))
            .finally(() => setLoading(false));
    }, [sort, perPage]);

    return (
        <>
            <style jsx>{`
                @media (max-width: 768px) {
                    .shop-toolbar {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 8px !important;
                    }
                    .shop-toolbar-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>
            {/* Hero */}
            <div style={{ background: "#000", padding: "28px 20px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(232,0,45,.12) 0%,transparent 70%)" }} />
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: ".02em", lineHeight: 1, position: "relative", zIndex: 2 }}>
                    Shop All Women&apos;s
                </h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", marginTop: "6px", position: "relative", zIndex: 2 }}>
                    {products.length} products
                </p>
            </div>

            {/* Sub tabs */}
            <div style={{ display: "flex", gap: "8px", padding: "16px 20px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #e8e8e8", scrollbarWidth: "none" }} className="scrollbar-hide">
                {SUB_TABS.map((tab, i) => (
                    <button key={tab} style={{ border: "1.5px solid", borderColor: i === 0 ? "#000" : "#e0e0e0", padding: "8px 16px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: i === 0 ? "#fff" : "#333", background: i === 0 ? "#000" : "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
                        {tab}
                    </button>
                ))}
            </div>

            <div style={{ padding: "16px 20px 40px" }}>
                {/* Toolbar */}
                <div className="shop-toolbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e8e8e8" }}>
                    <span style={{ fontSize: "12px", color: "#767676" }}>1 – {products.length} of {products.length} products</span>
                    <div className="shop-toolbar-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "7px 28px 7px 10px", background: "#fff", cursor: "pointer", outline: "none" }}>
                            <option value={60}>Show 60</option>
                            <option value={120}>Show 120</option>
                        </select>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "7px 28px 7px 10px", background: "#fff", cursor: "pointer", outline: "none" }}>
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ aspectRatio: "2/3", background: "#f0ece8" }} />
                        ))}
                    </div>
                ) : (
                    <div className="grid-4">
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </div>
        </>
    );
}
