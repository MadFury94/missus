"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";

function Skeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ aspectRatio: "2/3", background: "#f0ece8", animation: "pulse 1.4s ease-in-out infinite" }} />
            <div style={{ height: "14px", width: "70%", background: "#f0ece8", animation: "pulse 1.4s ease-in-out infinite" }} />
            <div style={{ height: "12px", width: "40%", background: "#f0ece8", animation: "pulse 1.4s ease-in-out infinite" }} />
        </div>
    );
}

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
                    .newin-view-all {
                        padding: 20px;
                    }
                }
            `}</style>

            {/* Section header */}
            <div style={{ background: "#000", color: "#fff", padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>New In</span>
                    <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,.6)", marginLeft: "12px" }}>Updated daily — don&apos;t miss out</span>
                </div>
                <Link href="/category/whats-new" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", textDecoration: "underline" }}>
                    View All →
                </Link>
            </div>

            <div className="newin-section-wrap">
                <div className="grid-4">
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
                        : products.map((product) => <ProductCard key={product.id} product={product} />)
                    }
                </div>

                {!loading && products.length > 0 && (
                    <div className="newin-view-all" style={{ textAlign: "center", marginTop: "28px" }}>
                        <Link href="/category/whats-new" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "#000", color: "#fff", padding: "13px 28px", fontSize: "13px" }}>
                            View All New Arrivals
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
