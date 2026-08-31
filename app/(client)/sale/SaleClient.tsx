"use client";
import { useState, useMemo } from "react";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
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
    { label: "Discount: High to Low", value: "discount" },
];

export default function SaleClient({ initialProducts }: { initialProducts: StoreProduct[] }) {
    const [activeTab, setActiveTab] = useState(0);
    const [sort, setSort] = useState("popularity");

    const filtered = useMemo(() => {
        const tab = SALE_TABS[activeTab];
        let results = tab.filter
            ? initialProducts.filter((p) =>
                p.categories?.some((c) => c.slug === tab.filter)
            )
            : initialProducts;

        // Sort
        results = [...results];
        if (sort === "price-asc") {
            results.sort((a, b) => parseInt(a.prices.price) - parseInt(b.prices.price));
        } else if (sort === "price-desc") {
            results.sort((a, b) => parseInt(b.prices.price) - parseInt(a.prices.price));
        } else if (sort === "discount") {
            results.sort((a, b) => {
                const discA = a.prices.regular_price
                    ? parseInt(a.prices.regular_price) - parseInt(a.prices.price)
                    : 0;
                const discB = b.prices.regular_price
                    ? parseInt(b.prices.regular_price) - parseInt(b.prices.price)
                    : 0;
                return discB - discA;
            });
        }
        return results;
    }, [initialProducts, activeTab, sort]);

    return (
        <>
            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 0,
                    padding: "0 20px",
                    borderBottom: "3px solid #630D13",
                    overflowX: "auto",
                    background: "#fff",
                    scrollbarWidth: "none",
                }}
                className="scrollbar-hide"
            >
                {SALE_TABS.map((tab, i) => (
                    <button
                        key={tab.label}
                        onClick={() => setActiveTab(i)}
                        style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            padding: "12px 20px",
                            cursor: "pointer",
                            color: activeTab === i ? "#630D13" : "#555",
                            whiteSpace: "nowrap",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === i ? "3px solid #630D13" : "3px solid transparent",
                            marginBottom: "-3px",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Products */}
            <div style={{ padding: "32px 20px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "24px",
                            fontWeight: 800,
                            letterSpacing: ".04em",
                            textTransform: "uppercase",
                        }}
                    >
                        {SALE_TABS[activeTab].label}
                    </h2>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{
                            fontFamily: "'Barlow', sans-serif",
                            fontSize: "12px",
                            border: "1px solid #e0e0e0",
                            padding: "8px 32px 8px 12px",
                            background: "#fff",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                Sort: {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {filtered.length === 0 ? (
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
                        <Link href="/shop" style={{ color: "#630D13", textDecoration: "underline" }}>
                            Shop All →
                        </Link>
                    </div>
                ) : (
                    <div className="grid-5">
                        {filtered.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
