"use client";
import { useEffect, useState } from "react";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";

export default function NewInSection() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/products?category=whats-new&per_page=8&orderby=date&order=desc")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data?.products) setProducts(data.products); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
                .newin-section-wrap {
                    padding: 20px 72px 32px;
                }
                @media (max-width: 1024px) {
                    .newin-section-wrap {
                        padding: 0 0 24px;
                    }
                    .newin-section-wrap .grid-4 {
                        gap: 1px;
                    }
                }
            `}</style>

            {/* Section header */}
            <div style={{ background: "#000", color: "#fff", padding: "11px 20px" }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>New In</span>
            </div>

            <div className="newin-section-wrap">
                <div className="grid-4">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                        : products.map((product) => <ProductCard key={product.id} product={product} />)
                    }
                </div>
            </div>
        </>
    );
}
