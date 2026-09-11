"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import FilterSidebar from "@/components/shop/FilterSidebar";
import type { StoreProduct } from "@/lib/woocommerce";
import type { ProductFilters } from "@/types";
import { Filter, X } from "lucide-react";

const SORT_OPTIONS = [
    { label: "Newest First", value: "date" },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Featured", value: "" },
];

export default function NewInClient() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ProductFilters>({
        orderby: "date",
        perPage: 60,
        category: "whats-new"
    });
    const [filterOpen, setFilterOpen] = useState(false);

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("category", "whats-new");
        params.set("per_page", "60");

        if (filters.orderby === "date") { params.set("orderby", "date"); params.set("order", "desc"); }
        else if (filters.orderby === "price") { params.set("orderby", "price"); params.set("order", "asc"); }
        else if (filters.orderby === "price-desc") { params.set("orderby", "price"); params.set("order", "desc"); }

        fetch(`/api/products?${params}`)
            .then((r) => r.ok ? r.json() : { products: [] })
            .then((data) => {
                let results: StoreProduct[] = data.products ?? [];

                // Client-side filters
                if (filters.sizes && filters.sizes.length > 0) {
                    results = results.filter((p) =>
                        p.attributes?.some((a) =>
                            a.name.toLowerCase().includes("size") &&
                            a.terms?.some((t) => filters.sizes!.includes(t.name))
                        )
                    );
                }

                if (filters.colors && filters.colors.length > 0) {
                    results = results.filter((p) =>
                        p.attributes?.some((a) =>
                            (a.name.toLowerCase() === "color" || a.name.toLowerCase() === "colour") &&
                            a.terms?.some((t) =>
                                filters.colors!.some(
                                    (c) => c.toLowerCase() === t.name.toLowerCase()
                                )
                            )
                        )
                    );
                }

                if (filters.minPrice !== undefined) {
                    results = results.filter((p) => {
                        const price = parseInt(p.prices.price) / 100;
                        return price >= (filters.minPrice ?? 0) && (filters.maxPrice === undefined || price <= filters.maxPrice);
                    });
                }

                setProducts(results);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const hasActiveFilters =
        (filters.sizes?.length ?? 0) > 0 ||
        (filters.colors?.length ?? 0) > 0 ||
        filters.minPrice !== undefined ||
        (filters.occasions?.length ?? 0) > 0;

    const activeFilterCount =
        (filters.sizes?.length ?? 0) +
        (filters.colors?.length ?? 0) +
        (filters.minPrice !== undefined ? 1 : 0) +
        (filters.occasions?.length ?? 0);

    return (
        <>
            {/* Page header */}
            <div style={{ background: "#000", padding: "28px 20px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(232,0,45,.1) 0%,transparent 70%)" }} aria-hidden="true" />
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: "6px", position: "relative", zIndex: 1 }}>
                    Updated daily
                </p>
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", letterSpacing: ".02em", lineHeight: 1, position: "relative", zIndex: 1 }}>
                    What&apos;s New
                </h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "0", alignItems: "start", minHeight: "60vh" }} className="new-in-layout">
                {/* Desktop Filter Sidebar */}
                <aside
                    className="desktop-filter"
                    style={{
                        borderRight: "1px solid #e8e8e8",
                        padding: "24px 20px",
                        position: "sticky",
                        top: "52px",
                        maxHeight: "calc(100vh - 52px)",
                        overflowY: "auto"
                    }}
                >
                    <FilterSidebar
                        filters={filters}
                        onChange={setFilters}
                        showCategories={false}
                    />
                </aside>

                {/* -- Product area -- */}
                <div>
                    {/* Toolbar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #e8e8e8", position: "sticky", top: "52px", background: "#fff", zIndex: 5 }}>
                        <span style={{ fontSize: "12px", color: "#767676" }}>
                            {!loading && `${products.length} item${products.length !== 1 ? "s" : ""}`}
                        </span>

                        {/* Mobile filter button */}
                        <button
                            onClick={() => setFilterOpen(true)}
                            style={{
                                display: "none",
                                alignItems: "center",
                                gap: "6px",
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: "12px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: ".08em",
                                border: "1px solid #e0e0e0",
                                padding: "8px 12px",
                                background: "#fff",
                                cursor: "pointer",
                                outline: "none"
                            }}
                            className="mobile-filter-btn"
                        >
                            <Filter size={14} />
                            Filter
                            {hasActiveFilters && (
                                <span style={{
                                    background: "#000",
                                    color: "#fff",
                                    borderRadius: "50%",
                                    width: "18px",
                                    height: "18px",
                                    fontSize: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700
                                }}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Active filter chips */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1, padding: "0 16px" }} className="desktop-filter">
                            {filters.sizes?.map((s) => (
                                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "2px 8px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    {s}
                                    <button onClick={() => {
                                        const newSizes = filters.sizes?.filter(size => size !== s) ?? [];
                                        setFilters({ ...filters, sizes: newSizes.length > 0 ? newSizes : undefined });
                                    }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, color: "#000" }}>×</button>
                                </span>
                            ))}
                            {filters.colors?.map((c) => (
                                <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "2px 8px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                    {c}
                                    <button onClick={() => {
                                        const newColors = filters.colors?.filter(color => color !== c) ?? [];
                                        setFilters({ ...filters, colors: newColors.length > 0 ? newColors : undefined });
                                    }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, color: "#000" }}>×</button>
                                </span>
                            ))}
                        </div>

                        <Link href="/shop" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#767676", textDecoration: "none", whiteSpace: "nowrap" }}>
                            Shop All →
                        </Link>
                    </div>

                    {/* Grid */}
                    <div style={{ padding: "0 20px 60px" }} className="new-in-grid-wrap">
                        <style>{`
                            @media (max-width: 1024px) {
                                .new-in-grid-wrap { padding-left: 0 !important; padding-right: 0 !important; }
                                .new-in-grid-wrap .grid-4 { gap: 1px; }
                            }
                        `}</style>
                        {loading ? (
                            <div className="grid-4" style={{ paddingTop: "20px" }}>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ padding: "80px 20px", textAlign: "center" }}>
                                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#ccc", marginBottom: "16px" }}>
                                    No products match your filters
                                </p>
                                <button
                                    onClick={() => setFilters({ orderby: "date", perPage: 60, category: "whats-new" })}
                                    style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "13px 32px", border: "none", cursor: "pointer", borderRadius: "25px" }}
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

            {/* Mobile Filter Drawer */}
            {filterOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 50,
                        display: "flex",
                        alignItems: "flex-end"
                    }}
                    className="mobile-filter-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setFilterOpen(false);
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            width: "100%",
                            maxHeight: "85vh",
                            borderTopLeftRadius: "12px",
                            borderTopRightRadius: "12px",
                            padding: "0",
                            overflowY: "auto",
                            transform: "translateY(0)",
                            transition: "transform 0.3s ease-out"
                        }}
                    >
                        {/* Mobile filter header */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px 20px",
                            borderBottom: "1px solid #e8e8e8",
                            position: "sticky",
                            top: 0,
                            background: "#fff",
                            zIndex: 1
                        }}>
                            <h3 style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: "16px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: ".08em",
                                margin: 0
                            }}>
                                Filter & Sort
                            </h3>
                            <button
                                onClick={() => setFilterOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "4px"
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mobile filter content */}
                        <div style={{ padding: "20px" }}>
                            <FilterSidebar
                                filters={filters}
                                onChange={setFilters}
                                showCategories={false}
                            />
                        </div>

                        {/* Mobile filter footer */}
                        <div style={{
                            padding: "16px 20px",
                            borderTop: "1px solid #e8e8e8",
                            position: "sticky",
                            bottom: 0,
                            background: "#fff"
                        }}>
                            <button
                                onClick={() => setFilterOpen(false)}
                                style={{
                                    width: "100%",
                                    background: "#000",
                                    color: "#fff",
                                    border: "none",
                                    padding: "14px 24px",
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: ".1em",
                                    cursor: "pointer",
                                    borderRadius: "25px"
                                }}
                            >
                                View Results ({products.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .new-in-layout { 
                    grid-template-columns: 240px 1fr; 
                }
                
                .desktop-filter {
                    display: block;
                }
                
                .mobile-filter-btn {
                    display: none !important;
                }
                
                .mobile-filter-overlay {
                    display: none;
                }
                
                @media (max-width: 1024px) {
                    .new-in-layout { 
                        grid-template-columns: 1fr !important;
                    }
                    
                    .desktop-filter {
                        display: none !important;
                    }
                    
                    .mobile-filter-btn {
                        display: flex !important;
                    }
                    
                    .mobile-filter-overlay {
                        display: flex;
                    }
                }
            `}</style>
        </>
    );
}
