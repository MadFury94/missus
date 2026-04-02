"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("");

    const label = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ category: slug, per_page: "60" });
        if (sort === "date") { params.set("orderby", "date"); params.set("order", "desc"); }
        if (sort === "price-asc") { params.set("orderby", "price"); params.set("order", "asc"); }
        if (sort === "price-desc") { params.set("orderby", "price"); params.set("order", "desc"); }

        fetch(`/api/products?${params}`)
            .then((r) => r.json())
            .then((data) => setProducts(data.products ?? []))
            .finally(() => setLoading(false));
    }, [slug, sort]);

    return (
        <>
            <div style={{ background: "#000", padding: "28px 20px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(232,0,45,.12) 0%,transparent 70%)" }} />
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: ".02em", lineHeight: 1, position: "relative", zIndex: 2 }}>
                    {label}
                </h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", marginTop: "6px", position: "relative", zIndex: 2 }}>
                    {products.length} products
                </p>
            </div>

            <div style={{ padding: "16px 20px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e8e8e8" }}>
                    <span style={{ fontSize: "12px", color: "#767676" }}>1 – {products.length} of {products.length} products</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "7px 28px 7px 10px", background: "#fff", cursor: "pointer", outline: "none" }}>
                        <option value="">Sort: Featured</option>
                        <option value="date">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px 12px" }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ aspectRatio: "2/3", background: "#f0ece8" }} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ padding: "80px 20px", textAlign: "center", color: "#767676", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, textTransform: "uppercase" }}>
                        No products found
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px 12px" }}>
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </div>
        </>
    );
}
