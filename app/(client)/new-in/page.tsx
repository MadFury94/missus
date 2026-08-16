"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { StoreProduct } from "@/lib/woocommerce";

const SORT_OPTIONS = [
    { label: "Newest First", value: "date-desc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Featured", value: "" },
];

const SIZE_FILTERS = ["XS", "S", "M", "L", "XL", "2XL"];

export default function NewInPage() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("date-desc");
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [onSaleOnly, setOnSaleOnly] = useState(false);

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("category", "whats-new");
        params.set("per_page", "60");
        if (sort === "date-desc") { params.set("orderby", "date"); params.set("order", "desc"); }
        else if (sort === "price-asc") { params.set("orderby", "price"); params.set("order", "asc"); }
        else if (sort === "price-desc") { params.set("orderby", "price"); params.set("order", "desc"); }
        if (onSaleOnly) params.set("on_sale", "true");

        fetch(`/api/products?${params}`)
            .then((r) => r.ok ? r.json() : { products: [] })
            .then((data) => {
                let results: StoreProduct[] = data.products ?? [];
                // client-side size filter
                if (selectedSizes.length > 0) {
                    results = results.filter((p) =>
                        p.attributes?.some((a) =>
                            a.name.toLowerCase().includes("size") &&
                            a.terms?.some((t) => selectedSizes.includes(t.name))
                        )
                    );
                }
                setProducts(results);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [sort, selectedSizes, onSaleOnly]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    function toggleSize(size: string) {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    }

    const hasFilters = selectedSizes.length > 0 || onSaleOnly;

    return (
        <>
            {/* Page header */}
            <div style={{ background: "#000", padding: "28px 20px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(232,0,45,.1) 0%,transparent 70%)" }} aria-hidden="true" />
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: "6px", position: "relative", zIndex: 1 }}>
                    Updated daily
                </p>
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: ".02em", lineHeight: 1, position: "relative", zIndex: 1 }}>
                    New In
                </h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0", alignItems: "start", minHeight: "60vh" }} className="new-in-layout">

                {/* ── Sidebar ── */}
                <aside style={{ borderRight: "1px solid #e8e8e8", padding: "24px 20px", position: "sticky", top: "52px", maxHeight: "calc(100vh - 52px)", overflowY: "auto" }}>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000" }}>
                            Filter
                        </span>
                        {hasFilters && (
                            <button
                                onClick={() => { setSelectedSizes([]); setOnSaleOnly(false); }}
                                style={{ fontSize: "11px", color: "#767676", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'Barlow', sans-serif" }}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #e8e8e8" }}>
                        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#000", marginBottom: "10px" }}>Sort</p>
                        {SORT_OPTIONS.map((opt) => (
                            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: sort === opt.value ? "#000" : "#555", fontWeight: sort === opt.value ? 600 : 400, padding: "4px 0" }}>
                                <input
                                    type="radio"
                                    name="sort"
                                    checked={sort === opt.value}
                                    onChange={() => setSort(opt.value)}
                                    style={{ accentColor: "#000", cursor: "pointer" }}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>

                    {/* Size */}
                    <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #e8e8e8" }}>
                        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#000", marginBottom: "10px" }}>Size</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {SIZE_FILTERS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => toggleSize(s)}
                                    style={{
                                        minWidth: "42px", height: "36px", padding: "0 8px",
                                        border: `1.5px solid ${selectedSizes.includes(s) ? "#000" : "#d0d0d0"}`,
                                        background: selectedSizes.includes(s) ? "#000" : "#fff",
                                        color: selectedSizes.includes(s) ? "#fff" : "#333",
                                        fontFamily: "'Barlow', sans-serif", fontSize: "12px", fontWeight: 500,
                                        cursor: "pointer", transition: "all .15s",
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sale toggle */}
                    <div>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={onSaleOnly}
                                onChange={(e) => setOnSaleOnly(e.target.checked)}
                                style={{ accentColor: "#e8002d", width: "15px", height: "15px", cursor: "pointer" }}
                            />
                            <span style={{ fontSize: "13px", color: "#000", fontWeight: onSaleOnly ? 700 : 400 }}>On Sale Only</span>
                        </label>
                    </div>
                </aside>

                {/* ── Product area ── */}
                <div>
                    {/* Toolbar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #e8e8e8", position: "sticky", top: "52px", background: "#fff", zIndex: 5 }}>
                        <span style={{ fontSize: "12px", color: "#767676" }}>
                            {!loading && `${products.length} item${products.length !== 1 ? "s" : ""}`}
                        </span>
                        {/* Active filter chips */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1, padding: "0 16px" }}>
                            {selectedSizes.map((s) => (
                                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "2px 8px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    {s}
                                    <button onClick={() => toggleSize(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, color: "#000" }}>×</button>
                                </span>
                            ))}
                            {onSaleOnly && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #e8002d", padding: "2px 8px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#e8002d" }}>
                                    Sale
                                    <button onClick={() => setOnSaleOnly(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, color: "#e8002d" }}>×</button>
                                </span>
                            )}
                        </div>
                        <Link href="/shop" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#767676", textDecoration: "none", whiteSpace: "nowrap" }}>
                            Shop All →
                        </Link>
                    </div>

                    {/* Grid */}
                    <div style={{ padding: "0 20px 60px" }}>
                        {loading ? (
                            <div className="grid-4" style={{ paddingTop: "20px" }}>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <div style={{ aspectRatio: "2/3", background: "#f0ece8", animation: "pulse 1.4s ease-in-out infinite" }} />
                                        <div style={{ height: "14px", width: "70%", background: "#f0ece8", animation: "pulse 1.4s ease-in-out infinite" }} />
                                        <div style={{ height: "12px", width: "40%", background: "#f0ece8", animation: "pulse 1.4s ease-in-out infinite" }} />
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ padding: "80px 20px", textAlign: "center" }}>
                                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#ccc", marginBottom: "16px" }}>
                                    No products match your filters
                                </p>
                                <button
                                    onClick={() => { setSelectedSizes([]); setOnSaleOnly(false); }}
                                    style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "13px 32px", border: "none", cursor: "pointer" }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid-4" style={{ paddingTop: "20px" }}>
                                {products.map((p) => <ProductCard key={p.id} product={p} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .new-in-layout { grid-template-columns: 200px 1fr; }
                @media (max-width: 1024px) {
                    .new-in-layout { grid-template-columns: 1fr; }
                    .new-in-layout aside { display: none; }
                }
            `}</style>
        </>
    );
}
