"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import { Search, X } from "lucide-react";

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
    const [sort, setSort] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!query.trim()) { setProducts([]); return; }
        setLoading(true);
        const controller = new AbortController();
        fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
            .then((r) => r.json())
            .then((data) => {
                let results: StoreProduct[] = data.products ?? [];
                if (sort === "date") results = [...results].sort((a, b) => b.id - a.id);
                else if (sort === "price-asc") results = [...results].sort((a, b) => parseInt(a.prices.price) - parseInt(b.prices.price));
                else if (sort === "price-desc") results = [...results].sort((a, b) => parseInt(b.prices.price) - parseInt(a.prices.price));
                setProducts(results);
            })
            .catch((err) => { if (err.name !== "AbortError") setProducts([]); })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [query, sort]);

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

    function clearSearch() {
        setInputVal(""); setQuery(""); setProducts([]);
        inputRef.current?.focus();
    }

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
                                    <Link href="/shop" style={{ color: "#000", textDecoration: "underline", fontWeight: 600 }}>browse all products →</Link>
                                </p>
                            )}
                        </div>
                        {products.length > 0 && (
                            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "8px 28px 8px 10px", background: "#fff", cursor: "pointer", outline: "none" }}>
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
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
                    <div className="grid-4">
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
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
        </>
    );
}
