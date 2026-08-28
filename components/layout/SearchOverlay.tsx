"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "@/lib/woocommerce";
import { toNaira, formatPrice } from "@/lib/woocommerce";

// ── Static ────────────────────────────────────────────────────────────────

const HOT_SEARCHES = [
    "Dresses", "Matching Sets", "Bandage Dress", "Tops",
    "Night Out", "Snatched", "Vacation", "Faux Leather",
];

// ── Types ─────────────────────────────────────────────────────────────────
interface CatItem { slug: string; name: string; image: string | null; }

interface Props {
    isOpen: boolean;
    inputValue: string;
    onInputChange: (val: string) => void;
    onClose: () => void;
    onSubmit: (q: string) => void;
}

// ── Module-level cache ────────────────────────────────────────────────────
let catCache: CatItem[] | null = null;

function titleCase(str: string) {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&#8217;/g, "\u2019")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────

export default function SearchOverlay({ isOpen, inputValue, onInputChange, onClose, onSubmit }: Props) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const [liveResults, setLiveResults] = useState<StoreProduct[]>([]);
    const [liveLoading, setLiveLoading] = useState(false);
    const [imagedCats, setImagedCats] = useState<CatItem[]>(
        catCache ? catCache.filter((c) => c.image) : []
    );

    // Measure navbar height → CSS var for overlay offset
    useEffect(() => {
        function measure() {
            const nav = document.querySelector("[data-navbar]") as HTMLElement | null;
            if (nav) document.documentElement.style.setProperty("--navbar-h", `${nav.offsetHeight}px`);
        }
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 60);
    }, [isOpen]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
        if (isOpen) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Fetch categories with images once
    useEffect(() => {
        if (!isOpen || catCache) return;
        fetch("/api/categories")
            .then((r) => r.json())
            .then((cats: CatItem[]) => {
                catCache = cats;
                setImagedCats(cats.filter((c) => c.image));
            })
            .catch(() => { });
    }, [isOpen]);

    // Debounced live search — only products with images
    useEffect(() => {
        const q = inputValue.trim();
        if (!q) { setLiveResults([]); return; }
        setLiveLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
                .then((r) => r.json())
                .then((d) => {
                    const withImages = (d.products ?? []).filter(
                        (p: StoreProduct) => p.images?.[0]?.src
                    );
                    setLiveResults(withImages.slice(0, 6));
                    setLiveLoading(false);
                })
                .catch((err) => { if (err.name !== "AbortError") setLiveLoading(false); });
        }, 280);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [inputValue]);

    function navigate(path: string) { onClose(); router.push(path); }
    function submitSearch(q: string) { if (!q.trim()) return; onClose(); onSubmit(q.trim()); }

    if (!isOpen) return null;
    const hasQuery = inputValue.trim().length > 0;

    // Reusable thumbnail row
    function ThumbRow({ rank, slug, name, image, href }: {
        rank: number; slug: string; name: string; image: string | null; href: string;
    }) {
        return (
            <button
                onClick={() => navigate(href)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "4px", transition: "background .12s", width: "100%" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ccc", width: "16px", textAlign: "center", flexShrink: 0 }}>{rank}</span>
                <div style={{ width: "44px", height: "58px", background: "#f0ece8", flexShrink: 0, overflow: "hidden" }}>
                    {image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    )}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "'Barlow', sans-serif", lineHeight: 1.3 }}>
                    {titleCase(name)}
                </span>
            </button>
        );
    }

    // Accent row (for New In / Sale — no WC image, use a colour block)
    function AccentRow({ rank, label, href, bg, accent }: {
        rank: number; label: string; href: string; bg: string; accent: string;
    }) {
        return (
            <button
                onClick={() => navigate(href)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "4px", transition: "background .12s", width: "100%" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ccc", width: "16px", textAlign: "center", flexShrink: 0 }}>{rank}</span>
                <div style={{ width: "44px", height: "58px", background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "8px", fontWeight: 800, color: accent, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: ".1em", textTransform: "uppercase", textAlign: "center", padding: "0 4px" }}>
                        {label}
                    </span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "'Barlow', sans-serif", lineHeight: 1.3 }}>
                    {label}
                </span>
            </button>
        );
    }

    // Split the 4 imaged cats across two columns: first 2 → col A, last 2 → col B
    const colA = imagedCats.slice(0, 2);   // e.g. Dresses, Matching Sets
    const colB = imagedCats.slice(2, 4);   // e.g. Tops, Bottoms

    return (
        <>
            <style>{`
                .search-overlay-cols {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 32px;
                }
                .search-col-desktop { display: block; }
                @media (max-width: 768px) {
                    .search-overlay-cols {
                        grid-template-columns: 1fr 1fr;
                        gap: 0;
                    }
                    .search-col-desktop { display: none; }
                }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 199 }}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                style={{
                    position: "fixed", top: 0, left: 0, right: 0,
                    background: "#fff", zIndex: 200,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    maxHeight: "100vh", overflowY: "auto",
                    paddingTop: "var(--navbar-h, 52px)",
                }}
            >
                {/* Input bar */}
                <div style={{ borderBottom: "1px solid #e8e8e8", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", maxWidth: "1200px", margin: "0 auto" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" style={{ flexShrink: 0 }} aria-hidden="true">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="search"
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitSearch(inputValue); }}
                        placeholder="Search…"
                        aria-label="Search products"
                        style={{ flex: 1, border: "none", outline: "none", fontSize: "16px", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontWeight: 300, color: "#000", background: "transparent", minWidth: 0, letterSpacing: ".02em" }}
                    />
                    {inputValue && (
                        <button onClick={() => onInputChange("")} aria-label="Clear search"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: "4px", display: "flex", flexShrink: 0, transition: "color .15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                    {/* Close — text link, not a box */}
                    <button
                        onClick={onClose}
                        aria-label="Close search"
                        style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, color: "#999", fontSize: "12px", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", letterSpacing: ".06em", textTransform: "uppercase", padding: "4px 0", transition: "color .15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
                    >
                        Close
                    </button>
                </div>

                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 16px 32px" }}>

                    {/* ── Live results when typing ── */}
                    {hasQuery && (
                        <div>
                            {liveLoading && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i}>
                                            <div style={{ aspectRatio: "3/4", background: "#f0ece8" }} aria-hidden="true" />
                                            <div style={{ height: "10px", background: "#f0ece8", marginTop: "8px", width: "70%" }} aria-hidden="true" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!liveLoading && liveResults.length > 0 && (
                                <>
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "12px" }}>
                                        Suggestions
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                                        {liveResults.map((p) => (
                                            <button key={p.id} onClick={() => navigate(`/product/${p.slug}`)}
                                                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                                                <div style={{ aspectRatio: "3/4", background: "#f8f8f8", overflow: "hidden" }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={p.images[0].src} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                                </div>
                                                <p style={{ fontSize: "11px", fontWeight: 600, color: "#000", marginTop: "5px", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                    {p.name}
                                                </p>
                                                <p style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                                                    {formatPrice(toNaira(p.prices.price))}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => submitSearch(inputValue)}
                                        style={{ fontSize: "12px", color: "#000", fontWeight: 700, background: "none", border: "1.5px solid #000", padding: "9px 20px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: ".08em", textTransform: "uppercase" }}>
                                        See all results for &ldquo;{inputValue.trim()}&rdquo; →
                                    </button>
                                </>
                            )}
                            {!liveLoading && liveResults.length === 0 && (
                                <p style={{ fontSize: "14px", color: "#888", padding: "20px 0" }}>
                                    No results for &ldquo;{inputValue.trim()}&rdquo; — try different keywords.
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── Default state ── */}
                    {!hasQuery && (
                        <>
                            {/* Hot Searches */}
                            <div style={{ marginBottom: "20px" }}>
                                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "10px" }}>
                                    Hot Searches
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                                    {HOT_SEARCHES.map((term) => (
                                        <button key={term} onClick={() => submitSearch(term)}
                                            style={{ border: "1.5px solid #ddd", borderRadius: "999px", padding: "5px 13px", background: "#fff", fontSize: "13px", color: "#333", cursor: "pointer", fontFamily: "'Barlow', sans-serif", transition: "border-color .15s, color .15s" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#333"; }}>
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Three cols desktop / Two cols mobile */}
                            <div className="search-overlay-cols">

                                {/* Col 1: Shop by Style — desktop only, text links */}
                                <div className="search-col-desktop">
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "10px" }}>
                                        Shop by Style
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {[
                                            { rank: 1, label: "Dresses", href: "/category/dresses" },
                                            { rank: 2, label: "Matching Sets", href: "/category/matching-sets" },
                                            { rank: 3, label: "Tops", href: "/category/tops" },
                                            { rank: 4, label: "Bottoms", href: "/category/bottoms" },
                                        ].map((item) => (
                                            <button key={item.rank} onClick={() => navigate(item.href)}
                                                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "4px", transition: "background .12s" }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                                                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ccc", width: "16px", textAlign: "center", flexShrink: 0 }}>{item.rank}</span>
                                                <span style={{ fontSize: "14px", fontWeight: 600, color: "#000", fontFamily: "'Barlow', sans-serif" }}>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Col 2: It-Girl Picks — first 2 imaged cats + accent rows */}
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "10px" }}>
                                        It-Girl Picks
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {colA.map((cat, i) => (
                                            <ThumbRow key={cat.slug} rank={i + 1} slug={cat.slug} name={cat.name} image={cat.image} href={`/category/${cat.slug}`} />
                                        ))}
                                        <AccentRow rank={colA.length + 1} label="New Drops" href="/new-in" bg="#111" accent="#fff" />
                                        <AccentRow rank={colA.length + 2} label="MissusDeals" href="/sale" bg="#e8002d" accent="#fff" />
                                    </div>
                                </div>

                                {/* Col 3: Fresh Fits — last 2 imaged cats + Shop All */}
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "10px" }}>
                                        Fresh Fits
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {colB.map((cat, i) => (
                                            <ThumbRow key={cat.slug} rank={i + 1} slug={cat.slug} name={cat.name} image={cat.image} href={`/category/${cat.slug}`} />
                                        ))}
                                        <AccentRow rank={colB.length + 1} label="Athleisure" href="/category/athleisure-loungewear" bg="#1a1a2e" accent="#fff" />
                                        <AccentRow rank={colB.length + 2} label="Gift Shop" href="/category/gift-shop" bg="#2d1b34" accent="#fff" />
                                    </div>
                                </div>

                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
