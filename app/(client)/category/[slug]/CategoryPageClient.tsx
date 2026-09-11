"use client";
import { useState, useEffect, useCallback } from "react";
import type { StoreProduct, StoreCategory } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import FilterSidebar from "@/components/shop/FilterSidebar";
import type { ProductFilters } from "@/types";

const SORT_OPTIONS = [
    { label: "Featured", value: "" },
    { label: "Newest First", value: "date" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
];

interface CategoryPageClientProps {
    slug: string;
    label: string;
    initialProducts: StoreProduct[];
    category: StoreCategory;
}

export default function CategoryPageClient({
    slug,
    label,
    initialProducts,
    category
}: CategoryPageClientProps) {
    const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>({ perPage: 60, category: slug });
    const [filterOpen, setFilterOpen] = useState(false);

    const fetchProducts = useCallback((f: ProductFilters) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("category", slug);
        params.set("per_page", String(f.perPage ?? 60));

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
    }, [slug]);

    useEffect(() => {
        fetchProducts(filters);
    }, [filters, fetchProducts]);

    function handleSortChange(value: string) {
        setFilters((f) => ({ ...f, orderby: value as ProductFilters["orderby"] }));
    }

    const activeSort = filters.orderby ?? "";
    const hasActiveFilters =
        (filters.sizes?.length ?? 0) > 0 ||
        (filters.colors?.length ?? 0) > 0 ||
        filters.minPrice !== undefined;
    const activeFilterCount =
        (filters.sizes?.length ?? 0) +
        (filters.colors?.length ?? 0) +
        (filters.minPrice !== undefined ? 1 : 0);

    return (
        <>
            <style>{`
                .category-layout { display: grid; grid-template-columns: 200px 1fr; gap: 32px; padding: 24px 20px 60px; align-items: start; }
                .category-filter-sidebar { position: sticky; top: 52px; }
                .category-sidebar-desktop { display: block; }
                .category-filter-bar { display: none; }
                .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
                @media (max-width: 1024px) {
                    .category-layout { grid-template-columns: 1fr; padding: 0 0 60px; gap: 0; }
                    .category-sidebar-desktop { display: none; }
                    .category-filter-bar { display: flex; }
                    .grid-4 { grid-template-columns: repeat(2, 1fr); gap: 1px; }
                    .category-products-wrap { padding-left: 0 !important; padding-right: 0 !important; }
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

            {/* Header */}
            <div style={{ padding: "40px 20px 20px", textAlign: "center", background: "#fff" }}>
                <div style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: "#f8f8f8",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#666",
                    marginBottom: "16px"
                }}>
                    Collection
                </div>
                <h1 style={{
                    fontFamily: "var(--font-display, 'Cormorant', serif)",
                    fontSize: "clamp(36px, 5vw, 54px)",
                    fontWeight: 600,
                    color: "#000",
                    letterSpacing: "-.02em",
                    marginBottom: "12px"
                }}>
                    {label}
                </h1>
                {category.description && (
                    <p style={{
                        fontSize: "15px",
                        color: "#666",
                        maxWidth: "600px",
                        margin: "0 auto",
                        lineHeight: 1.6
                    }}
                        dangerouslySetInnerHTML={{ __html: category.description }}
                    />
                )}
            </div>

            <div className="category-layout">
                {/* Sidebar — desktop only */}
                <aside className="category-sidebar-desktop" style={{ position: "sticky", top: "52px" }} aria-label="Product filters">
                    <FilterSidebar filters={filters} onChange={setFilters} showCategories={false} />
                </aside>

                {/* Product area */}
                <div style={{ minWidth: 0 }}>
                    {/* Mobile filter/sort bar */}
                    <div className="category-filter-bar" style={{ alignItems: "center", gap: "8px", padding: "10px 12px", borderBottom: "1px solid #e8e8e8", background: "#fff", position: "sticky", top: "0", zIndex: 10 }}>
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
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #e8e8e8", flexWrap: "wrap", gap: "8px" }} className="category-filter-bar-desktop">
                        <p style={{ fontSize: "13px", color: "#888" }}>
                            {products.length} product{products.length !== 1 ? "s" : ""}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <label htmlFor="category-sort" style={{ fontSize: "11px", color: "#767676", textTransform: "uppercase", letterSpacing: ".06em" }}>Sort</label>
                            <select id="category-sort" value={activeSort} onChange={(e) => handleSortChange(e.target.value)} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "7px 10px", background: "#fff", cursor: "pointer", outline: "none" }}>
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px", padding: "0 12px" }}>
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
                            <button onClick={() => setFilters({ perPage: filters.perPage, category: slug })} style={{ fontSize: "11px", color: "#767676", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>Clear all</button>
                        </div>
                    )}

                    {/* Products Grid */}
                    {loading && (
                        <div className="grid-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {!loading && products.length > 0 && (
                        <div className="grid-4">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#666"
                        }}>
                            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                                No products found in this category.
                            </p>
                            <p style={{ fontSize: "14px" }}>
                                Check back soon for new arrivals!
                            </p>
                        </div>
                    )}
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
                        <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); }} showCategories={false} />
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