"use client";
import { useState, useEffect, useCallback } from "react";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import FilterSidebar from "@/components/shop/FilterSidebar";
import type { ProductFilters } from "@/types";
import Link from "next/link";

const SALE_TABS = [
    { label: "All Sale", filter: null },
    { label: "Dresses", filter: "dresses" },
    { label: "Tops", filter: "tops" },
    { label: "Bottoms", filter: "bottoms" },
    { label: "Sets", filter: "matching-sets" },
];

const SORT_OPTIONS = [
    { label: "Best Sellers", value: "popularity" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Newest First", value: "date" },
];

export default function SaleClient({ initialProducts }: { initialProducts: StoreProduct[] }) {
    const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>({ perPage: 60, onSale: true });
    const [activeTab, setActiveTab] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);

    const fetchProducts = useCallback((f: ProductFilters, tab: number) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("per_page", String(f.perPage ?? 60));
        params.set("on_sale", "true"); // Always filter by sale

        // Category: active tab takes priority, then sidebar category filter
        const tabCategory = SALE_TABS[tab].filter;
        if (tabCategory) {
            params.set("category", tabCategory);
        } else if (f.category) {
            params.set("category", f.category);
        }

        // Sort
        if (f.orderby === "date") { params.set("orderby", "date"); params.set("order", "desc"); }
        else if (f.orderby === "price") { params.set("orderby", "price"); params.set("order", "asc"); }
        else if (f.orderby === "price-desc") { params.set("orderby", "price"); params.set("order", "desc"); }
        else if (f.orderby === "popularity") params.set("orderby", "popularity");

        fetch(`/api/products?${params}`)
            .then((r) => r.json())
            .then((data) => {
                let results: StoreProduct[] = data.products ?? [];

                // Client-side filter by size
                if (f.sizes && f.sizes.length > 0) {
                    results = results.filter((p) =>
                        p.attributes?.some((a) =>
                            (a.name.toLowerCase() === "size" || a.name.toLowerCase() === "sizes") &&
                            a.terms?.some((t) => f.sizes!.includes(t.name))
                        )
                    );
                }

                // Client-side colour filter
                if (f.colors && f.colors.length > 0) {
                    results = results.filter((p) =>
                        p.attributes?.some((a) =>
                            (a.name.toLowerCase() === "color" || a.name.toLowerCase() === "colour") &&
                            a.terms?.some((t) =>
                                f.colors!.some(
                                    (c) => c.toLowerCase() === t.name.toLowerCase()
                                )
                            )
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
    const hasActiveFilters =
        (filters.sizes?.length ?? 0) > 0 ||
        (filters.colors?.length ?? 0) > 0 ||
        filters.minPrice !== undefined ||
        !!filters.category;
    const activeFilterCount =
        (filters.sizes?.length ?? 0) +
        (filters.colors?.length ?? 0) +
        (filters.minPrice !== undefined ? 1 : 0) +
        (filters.category ? 1 : 0);

    return (
        <>
            <style>{`
                .sale-layout { display: grid; grid-template-columns: 200px 1fr; gap: 32px; padding: 0 0 60px; align-items: start; }
                .sale-filter-sidebar { position: sticky; top: 52px; }
                .sale-sidebar-desktop { display: block; }
                .sale-filter-bar { display: none; }
                .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
                @media (max-width: 1024px) {
                    .sale-layout { grid-template-columns: 1fr; gap: 0; }
                    .sale-sidebar-desktop { display: none; }
                    .sale-filter-bar { display: flex; }
                    .grid-4 { grid-template-columns: repeat(2, 1fr); gap: 1px; }
                    .sale-products-wrap { padding-left: 0 !important; padding-right: 0 !important; }
                }
                @media (min-width: 1025px) {
                    .grid-4 { grid-template-columns: repeat(4, 1fr); gap: 20px; }
                }
                /* Filter drawer overlay */
                .filter-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 300; }
                .filter-drawer-panel {
                    position: fixed; bottom: 0; left: 0; right: 0;
                    background: #fff; z-index: 301;
                    max-height: 85vh; overflow-y: auto;
                    border-radius: 16px 16px 0 0;
                    padding: 0 20px 40px;
                    animation: drawerUp .28s ease forwards;
                }
                @keyframes drawerUp {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
            `}</style>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 0,
                    padding: "0 20px",
                    borderBottom: "3px solid #7F0E12",
                    overflowX: "auto",
                    background: "#fff",
                    scrollbarWidth: "none",
                }}
                className="scrollbar-hide"
            >
                {SALE_TABS.map((tab, i) => (
                    <button
                        key={tab.label}
                        onClick={() => handleTabClick(i)}
                        style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            padding: "12px 20px",
                            cursor: "pointer",
                            color: activeTab === i ? "#7F0E12" : "#555",
                            whiteSpace: "nowrap",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === i ? "3px solid #7F0E12" : "3px solid transparent",
                            marginBottom: "-3px",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="sale-layout">
                {/* Sidebar — desktop only */}
                <aside className="sale-sidebar-desktop" style={{ position: "sticky", top: "52px" }} aria-label="Product filters">
                    <FilterSidebar filters={filters} onChange={setFilters} />
                </aside>

                {/* Product area */}
                <div style={{ minWidth: 0 }}>
                    {/* Mobile filter/sort bar */}
                    <div className="sale-filter-bar" style={{ alignItems: "center", gap: "8px", padding: "10px 12px", borderBottom: "1px solid #e8e8e8", background: "#fff", position: "sticky", top: "0", zIndex: 10 }}>
                        <button
                            onClick={() => setFilterOpen(true)}
                            style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "center", border: "1px solid #e0e0e0", padding: "9px", background: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="10" y2="18" />
                            </svg>
                            Filter
                            {activeFilterCount > 0 && (
                                <span style={{ background: "#7F0E12", color: "#fff", borderRadius: "99px", fontSize: "10px", padding: "1px 6px", fontWeight: 700 }}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <select
                            value={activeSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            style={{ flex: 1, fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "9px 8px", background: "#fff", cursor: "pointer", outline: "none" }}
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
                        </select>
                    </div>

                    {/* Desktop toolbar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #e8e8e8", flexWrap: "wrap", gap: "12px" }} className="sale-filter-bar-desktop">
                        <h2
                            style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: "24px",
                                fontWeight: 800,
                                letterSpacing: ".04em",
                                textTransform: "uppercase",
                                margin: 0
                            }}
                        >
                            {SALE_TABS[activeTab].label}
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <label htmlFor="sale-sort" style={{ fontSize: "11px", color: "#767676", textTransform: "uppercase", letterSpacing: ".06em" }}>Sort</label>
                            <select id="sale-sort" value={activeSort} onChange={(e) => handleSortChange(e.target.value)} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "7px 10px", background: "#fff", cursor: "pointer", outline: "none" }}>
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px", padding: "0 12px" }}>
                            {filters.category && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    {filters.category?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? ""}
                                    <button aria-label="Remove category filter" onClick={() => setFilters((f) => ({ ...f, category: undefined }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}>X</button>
                                </span>
                            )}
                            {filters.sizes?.map((s) => (
                                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    {s}
                                    <button aria-label={`Remove size ${s}`} onClick={() => setFilters((f) => ({ ...f, sizes: f.sizes?.filter((x) => x !== s) }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}>X</button>
                                </span>
                            ))}
                            {filters.colors?.map((c) => (
                                <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    {c}
                                    <button aria-label={`Remove colour ${c}`} onClick={() => setFilters((f) => ({ ...f, colors: f.colors?.filter((x) => x !== c) }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}>X</button>
                                </span>
                            ))}
                            {filters.minPrice !== undefined && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "3px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    Price filter
                                    <button aria-label="Remove price filter" onClick={() => setFilters((f) => ({ ...f, minPrice: undefined, maxPrice: undefined }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}>X</button>
                                </span>
                            )}
                            <button onClick={() => setFilters({ perPage: filters.perPage, onSale: true })} style={{ fontSize: "11px", color: "#767676", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>Clear all</button>
                        </div>
                    )}

                    {/* Products */}
                    <div style={{ padding: "0 20px 60px" }}>
                        {loading && (
                            <div className="grid-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        )}

                        {!loading && products.length > 0 && (
                            <div className="grid-4">
                                {products.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}

                        {!loading && products.length === 0 && (
                            <div
                                style={{
                                    padding: "60px 20px",
                                    textAlign: "center",
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    color: "#767676",
                                }}
                            >
                                MISS US WITH THE UGLY CLOTHES.{" "}
                                <Link href="/shop" style={{ color: "#7F0E12", textDecoration: "underline" }}>
                                    Shop All →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter bottom-sheet drawer */}
            {filterOpen && (
                <>
                    <div className="filter-drawer-backdrop" onClick={() => setFilterOpen(false)} aria-hidden="true" />
                    <div className="filter-drawer-panel" role="dialog" aria-label="Filters" aria-modal="true">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 8px", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>Filter & Sort</span>
                            <button onClick={() => setFilterOpen(false)} aria-label="Close filters" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", lineHeight: 1, color: "#000" }}>X</button>
                        </div>
                        <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); }} />
                        <div style={{ position: "sticky", bottom: 0, background: "#fff", padding: "12px 0 0" }}>
                            <button onClick={() => setFilterOpen(false)} style={{ width: "100%", background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "16px", border: "none", cursor: "pointer" }}>
                                View Results
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
