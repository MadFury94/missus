"use client";
import { useState, useEffect, useCallback } from "react";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import type { ProductFilters } from "@/types";

const SORT_OPTIONS = [
    { label: "Featured", value: "" },
    { label: "Newest First", value: "date" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
];

const QUICK_TABS = [
    { label: "All", category: "" },
    { label: "What's New", category: "whats-new" },
    { label: "Deals", category: "discount-sale" },
    { label: "Dresses", category: "dresses" },
    { label: "Sets", category: "matching-sets" },
    { label: "Tops", category: "tops" },
    { label: "Bottoms", category: "bottoms" },
    { label: "Athleisure", category: "athleisure-loungewear" },
];

export default function ShopPage() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ProductFilters>({ perPage: 60 });
    const [activeTab, setActiveTab] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);

    const fetchProducts = useCallback((f: ProductFilters, tab: number) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("per_page", String(f.perPage ?? 60));

        // Active tab overrides sidebar category
        const tabCategory = QUICK_TABS[tab].category;
        if (tabCategory) params.set("category", tabCategory);

        // Sort
        if (f.orderby === "date") { params.set("orderby", "date"); params.set("order", "desc"); }
        else if (f.orderby === "price") { params.set("orderby", "price"); params.set("order", "asc"); }
        else if (f.orderby === "price-desc") { params.set("orderby", "price"); params.set("order", "desc"); }
        else if (f.orderby === "popularity") params.set("orderby", "popularity");

        if (f.onSale) params.set("on_sale", "true");

        fetch(`/api/products?${params}`)
            .then((r) => r.json())
            .then((data) => {
                let results: StoreProduct[] = data.products ?? [];

                // Client-side filter by size (WooCommerce Store API doesn't support server-side size filter)
                if (f.sizes && f.sizes.length > 0) {
                    results = results.filter((p) =>
                        p.attributes?.some((a) =>
                            (a.name.toLowerCase() === "size" || a.name.toLowerCase() === "sizes") &&
                            a.terms?.some((t) => f.sizes!.includes(t.name))
                        )
                    );
                }

                // Client-side price filter
                if (f.minPrice !== undefined) {
                    results = results.filter((p) => {
                        const price = parseInt(p.prices.price) / 100;
                        return price >= (f.minPrice ?? 0) && (f.maxPrice === undefined || price <= f.maxPrice);
                    });
                }

                setProducts(results);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchProducts(filters, activeTab);
    }, [filters, activeTab, fetchProducts]);

    function handleTabClick(idx: number) {
        setActiveTab(idx);
        setFilters((f) => ({ ...f, page: 1 }));
    }

    function handleSortChange(value: string) {
        setFilters((f) => ({ ...f, orderby: value as ProductFilters["orderby"] }));
    }

    const activeSort = filters.orderby ?? "";

    return (
        <>
            <style>{`
                .shop-layout { display: grid; grid-template-columns: 220px 1fr; gap: 32px; padding: 24px 20px 60px; align-items: start; }
                .shop-filter-sidebar { position: sticky; top: 72px; }
                .shop-filter-toggle { display: none; }
                .shop-filter-drawer { display: block; }
                @media (max-width: 1024px) {
                    .shop-layout { grid-template-columns: 1fr; }
                    .shop-filter-sidebar { position: static; }
                    .shop-filter-toggle { display: flex; }
                    .shop-filter-drawer { display: none; }
                    .shop-filter-drawer.open { display: block; }
                }
                select:focus-visible { outline: 2px solid #000; outline-offset: 1px; }
                .shop-tab-btn:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
            `}</style>

            {/* Page header */}
            <div style={{ background: "#000", padding: "28px 20px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(232,0,45,.12) 0%,transparent 70%)" }} aria-hidden="true" />
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: ".02em", lineHeight: 1, position: "relative", zIndex: 2 }}>
                    Shop All Women&apos;s
                </h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", marginTop: "6px", position: "relative", zIndex: 2 }}>
                    {loading ? "Loading…" : `${products.length} products`}
                </p>
            </div>

            {/* Quick-filter tabs */}
            <div
                role="tablist"
                aria-label="Filter by category"
                style={{ display: "flex", gap: "8px", padding: "14px 20px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #e8e8e8", scrollbarWidth: "none" }}
                className="scrollbar-hide"
            >
                {QUICK_TABS.map((tab, i) => (
                    <button
                        key={tab.label}
                        role="tab"
                        aria-selected={activeTab === i}
                        className="shop-tab-btn"
                        onClick={() => handleTabClick(i)}
                        style={{
                            border: "1.5px solid",
                            borderColor: activeTab === i ? "#000" : "#e0e0e0",
                            padding: "8px 16px",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            color: activeTab === i ? "#fff" : "#333",
                            background: activeTab === i ? "#000" : "#fff",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all .15s",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="shop-layout">
                {/* Sidebar — desktop always visible, mobile drawer */}
                <aside className="shop-filter-sidebar" aria-label="Product filters">
                    {/* Mobile toggle */}
                    <button
                        className="shop-filter-toggle"
                        onClick={() => setFilterOpen((o) => !o)}
                        aria-expanded={filterOpen}
                        style={{ display: "none", alignItems: "center", gap: "8px", background: "none", border: "1.5px solid #e0e0e0", padding: "10px 16px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", width: "100%", marginBottom: "12px" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <line x1="4" y1="6" x2="20" y2="6" />
                            <line x1="4" y1="12" x2="14" y2="12" />
                            <line x1="4" y1="18" x2="10" y2="18" />
                        </svg>
                        Filter & Sort
                        {(filters.sizes?.length || filters.minPrice !== undefined) ? (
                            <span style={{ background: "#e8002d", color: "#fff", borderRadius: "99px", fontSize: "10px", padding: "1px 7px", fontWeight: 700 }}>
                                {(filters.sizes?.length ?? 0) + (filters.minPrice !== undefined ? 1 : 0)}
                            </span>
                        ) : null}
                    </button>

                    <div className={`shop-filter-drawer${filterOpen ? " open" : ""}`}>
                        <FilterSidebar filters={filters} onChange={setFilters} />
                    </div>
                </aside>

                {/* Product grid */}
                <div>
                    {/* Toolbar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e8e8e8", flexWrap: "wrap", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#767676" }}>
                            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <label htmlFor="shop-per-page" style={{ fontSize: "11px", color: "#767676", textTransform: "uppercase", letterSpacing: ".06em" }}>Show</label>
                            <select
                                id="shop-per-page"
                                value={filters.perPage ?? 60}
                                onChange={(e) => setFilters((f) => ({ ...f, perPage: Number(e.target.value) }))}
                                style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "7px 10px", background: "#fff", cursor: "pointer", outline: "none" }}
                            >
                                <option value={60}>60</option>
                                <option value={120}>120</option>
                            </select>
                            <label htmlFor="shop-sort" style={{ fontSize: "11px", color: "#767676", textTransform: "uppercase", letterSpacing: ".06em" }}>Sort</label>
                            <select
                                id="shop-sort"
                                value={activeSort}
                                onChange={(e) => handleSortChange(e.target.value)}
                                style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "7px 10px", background: "#fff", cursor: "pointer", outline: "none" }}
                            >
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {(filters.sizes?.length || filters.minPrice !== undefined) && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                            {filters.sizes?.map((s) => (
                                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    {s}
                                    <button
                                        aria-label={`Remove size ${s} filter`}
                                        onClick={() => setFilters((f) => ({ ...f, sizes: f.sizes?.filter((x) => x !== s) }))}
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}
                                    >×</button>
                                </span>
                            ))}
                            {filters.minPrice !== undefined && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    Price filter
                                    <button
                                        aria-label="Remove price filter"
                                        onClick={() => setFilters((f) => ({ ...f, minPrice: undefined, maxPrice: undefined }))}
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}
                                    >×</button>
                                </span>
                            )}
                            <button
                                onClick={() => setFilters({ perPage: filters.perPage })}
                                style={{ fontSize: "11px", color: "#767676", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Skeletons */}
                    {loading && (
                        <div className="grid-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{ aspectRatio: "2/3", background: "#f0ece8", animation: "pulse 1.5s ease-in-out infinite" }} aria-hidden="true" />
                            ))}
                        </div>
                    )}

                    {/* Products */}
                    {!loading && products.length > 0 && (
                        <div className="grid-4">
                            {products.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && products.length === 0 && (
                        <div style={{ padding: "80px 20px", textAlign: "center" }}>
                            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#ccc", marginBottom: "16px" }}>
                                No products match your filters
                            </p>
                            <button
                                onClick={() => setFilters({ perPage: 60 })}
                                style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 32px", border: "none", cursor: "pointer" }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
