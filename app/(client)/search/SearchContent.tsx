"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import FilterSidebar from "@/components/shop/FilterSidebar";
import type { ProductFilters } from "@/types";
import { Search, X, Filter } from "lucide-react";

const SORT_OPTIONS = [
    { label: "Most Relevant", value: "" },
    { label: "Newest First", value: "date" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
];

export default function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") ?? "";

    const [query, setQuery] = useState(initialQuery);
    const [inputVal, setInputVal] = useState(initialQuery);
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>({ perPage: 60 });
    const [filterOpen, setFilterOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = useCallback((searchQuery: string, f: ProductFilters) => {
        if (!searchQuery.trim()) { setProducts([]); return; }
        setLoading(true);
        const controller = new AbortController();
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, { signal: controller.signal })
            .then((r) => r.json())
            .then((data) => {
                let results: StoreProduct[] = data.products ?? [];

                // Client-side filters
                if (f.sizes && f.sizes.length > 0) {
                    results = results.filter((p) =>
                        p.attributes?.some((a) =>
                            (a.name.toLowerCase() === "size" || a.name.toLowerCase() === "sizes") &&
                            a.terms?.some((t) => f.sizes!.includes(t.name))
                        )
                    );
                }

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

                if (f.minPrice !== undefined) {
                    results = results.filter((p) => {
                        const price = parseInt(p.prices.price) / 100;
                        return price >= (f.minPrice ?? 0) && (f.maxPrice === undefined || price <= f.maxPrice);
                    });
                }

                if (f.category) {
                    results = results.filter((p) =>
                        p.categories?.some((c) => c.slug === f.category)
                    );
                }

                // Sort
                if (f.orderby === "date") results = [...results].sort((a, b) => b.id - a.id);
                else if (f.orderby === "price") results = [...results].sort((a, b) => parseInt(a.prices.price) - parseInt(b.prices.price));
                else if (f.orderby === "price-desc") results = [...results].sort((a, b) => parseInt(b.prices.price) - parseInt(a.prices.price));

                setProducts(results);
            })
            .catch((err) => { if (err.name !== "AbortError") setProducts([]); })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    useEffect(() => {
        fetchProducts(query, filters);
    }, [query, filters, fetchProducts]);

    useEffect(() => { inputRef.current?.focus(); }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = inputVal.trim();
        if (trimmed) {
            setQuery(trimmed);
            const url = new URL(window.location.href);
            url.searchParams.set("q", trimmed);
            window.history.replaceState({}, "", url.toString());
        }
    }

    function handleSortChange(value: string) {
        setFilters((f) => ({ ...f, orderby: value as ProductFilters["orderby"] }));
    }

    function clearSearch() {
        setInputVal(""); setQuery(""); setProducts([]);
        inputRef.current?.focus();
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
            <div style={{ background: "#000", padding: "32px 20px 28px" }}>
                <div style={{ maxWidth: "680px", margin: "0 auto" }}>
                    <form onSubmit={handleSubmit} style={{ display: "flex", border: "2px solid #fff", height: "52px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                            <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "rgba(255,255,255,.5)", pointerEvents: "none" }} aria-hidden="true" />
                            <input
                                ref={inputRef}
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                placeholder="Search for dresses, tops, sets…"
                                aria-label="Search products"
                                style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", paddingLeft: "44px", paddingRight: inputVal ? "44px" : "16px", fontSize: "15px", color: "#fff", fontFamily: "'Barlow', sans-serif" }}
                            />
                            {inputVal && (
                                <button type="button" onClick={clearSearch} aria-label="Clear search" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.5)", padding: 0, display: "flex" }}>
                                    <X style={{ width: "16px", height: "16px" }} />
                                </button>
                            )}
                        </div>
                        <button type="submit" style={{ background: "#fff", color: "#000", border: "none", paddingInline: "24px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 20px 60px" }}>
                {!query && (
                    <div style={{ textAlign: "center", padding: "80px 20px" }}>
                        <p style={{ fontSize: "16px", color: "#aaa" }}>Start typing to search our collection</p>
                    </div>
                )}

                {query && !loading && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid #e8e8e8", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#000", marginBottom: "2px" }}>
                                {products.length > 0 ? `${products.length} result${products.length !== 1 ? "s" : ""} for "${query}"` : `No results for "${query}"`}
                            </h1>
                            {products.length === 0 && (
                                <p style={{ fontSize: "13px", color: "#767676" }}>
                                    Try different keywords or{" "}
                                    <Link href="/shop" style={{ color: "#000", textDecoration: "underline", fontWeight: 600 }}>browse all products</Link>
                                </p>
                            )}
                        </div>
                        {products.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                                <select value={activeSort} onChange={(e) => handleSortChange(e.target.value)} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "8px 28px 8px 10px", background: "#fff", cursor: "pointer", outline: "none" }}>
                                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="grid-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "0", alignItems: "start" }} className="search-layout">
                        {/* Desktop Filter Sidebar */}
                        <div className="desktop-filter">
                            <FilterSidebar
                                filters={filters}
                                onChange={setFilters}
                                showCategories={true}
                            />
                        </div>

                        {/* Product Grid */}
                        <div style={{ borderLeft: "1px solid #e8e8e8" }}>
                            {/* Active filter chips - desktop only */}
                            {hasActiveFilters && (
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }} className="desktop-filter">
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                        <span style={{ fontSize: "12px", color: "#767676", marginRight: "8px" }}>Active filters:</span>
                                        {filters.sizes?.map((size) => (
                                            <span key={size} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "4px 8px", fontFamily: "'Barlow', sans-serif", fontSize: "11px" }}>
                                                Size: {size}
                                                <button onClick={() => {
                                                    const newSizes = filters.sizes?.filter(s => s !== size) ?? [];
                                                    setFilters({ ...filters, sizes: newSizes.length > 0 ? newSizes : undefined });
                                                }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, marginLeft: "2px" }}>×</button>
                                            </span>
                                        ))}
                                        {filters.colors?.map((color) => (
                                            <span key={color} style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "4px 8px", fontFamily: "'Barlow', sans-serif", fontSize: "11px" }}>
                                                Color: {color}
                                                <button onClick={() => {
                                                    const newColors = filters.colors?.filter(c => c !== color) ?? [];
                                                    setFilters({ ...filters, colors: newColors.length > 0 ? newColors : undefined });
                                                }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, marginLeft: "2px" }}>×</button>
                                            </span>
                                        ))}
                                        {filters.category && (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #000", padding: "4px 8px", fontFamily: "'Barlow', sans-serif", fontSize: "11px" }}>
                                                Category: {filters.category}
                                                <button onClick={() => setFilters({ ...filters, category: undefined })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0, marginLeft: "2px" }}>×</button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: "20px" }} className="grid-4-wrap">
                                <div className="grid-4">
                                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && query && products.length === 0 && (
                    <div style={{ marginTop: "40px" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "16px", color: "#000" }}>
                            Try these instead
                        </h2>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {["Dresses", "Matching Sets", "Tops", "Bottoms", "Athleisure", "What's New", "Sale"].map((term) => (
                                <button key={term} onClick={() => { setInputVal(term); setQuery(term); }}
                                    style={{ border: "1.5px solid #e0e0e0", padding: "8px 16px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer", background: "#fff", color: "#333", transition: "all .15s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#333"; }}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
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
                                showCategories={true}
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
                .search-layout {
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
                    .search-layout {
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