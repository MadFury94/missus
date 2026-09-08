"use client";
import { useState, useEffect } from "react";
import type { StoreProduct, StoreCategory } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";

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
    const [sort, setSort] = useState("");

    useEffect(() => {
        if (!sort) return;

        setLoading(true);
        const params = new URLSearchParams({ category: slug, per_page: "60" });

        if (sort === "date") {
            params.set("orderby", "date");
            params.set("order", "desc");
        }
        if (sort === "price-asc") {
            params.set("orderby", "price");
            params.set("order", "asc");
        }
        if (sort === "price-desc") {
            params.set("orderby", "price");
            params.set("order", "desc");
        }

        fetch(`/api/products?${params}`)
            .then((r) => r.json())
            .then((data) => setProducts(data.products ?? []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [sort, slug]);

    return (
        <div style={{ minHeight: "70vh", padding: "40px 20px 80px" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: "40px", textAlign: "center" }}>
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

                {/* Toolbar */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #eee"
                }}>
                    <p style={{ fontSize: "13px", color: "#888" }}>
                        {products.length} product{products.length !== 1 ? "s" : ""}
                    </p>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "13px",
                            background: "#fff"
                        }}
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Products Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px"
                }}>
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))
                    ) : products.length === 0 ? (
                        <div style={{
                            gridColumn: "1 / -1",
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
                    ) : (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}