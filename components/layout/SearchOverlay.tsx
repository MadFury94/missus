"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "@/lib/woocommerce";
import { toNaira, formatPrice } from "@/lib/woocommerce";

// ── Static ────────────────────────────────────────────────────────────────

const HOT_SEARCHES = [
    "Dresses", "Matching Sets", "Bandage Dress", "Tops", "Night Out",
    "Snatched", "Vacation", "Faux Leather",
];

const TOP_SEARCHES = [
    { rank: 1, label: "Dresses", href: "/category/dresses" },
    { rank: 2, label: "Matching Sets", href: "/category/matching-sets" },
    { rank: 3, label: "Tops", href: "/category/tops" },
    { rank: 4, label: "Bottoms", href: "/category/bottoms" },
];

// ── Category type returned by /api/categories ─────────────────────────────
interface CatItem { slug: string; name: string; image: string | null; }

// ── Module-level cache — fetched once per page session ────────────────────
let catCache: CatItem[] | null = null;

interface Props {
    isOpen: boolean;
    inputValue: string;
    onInputChange: (val: string) => void;
    onClose: () => void;
    onSubmit: (q: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function SearchOverlay({ isOpen, inputValue, onInputChange, onClose, onSubmit }: Props) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const [liveResults, setLiveResults] = useState<StoreProduct[]>([]);
    const [liveLoading, setLiveLoading] = useState(false);
    // categories that have images — used for both Trending and Occasion columns
    const [imagedCats, setImagedCats] = useState<CatItem[]>(
        catCache ? catCache.filter((c) => c.image) : []
    );

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 60);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
        if (isOpen) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Fetch categories once on first open — only categories with images are used
    useEffect(() => {
        if (!isOpen || catCache) return;
        fetch("/api/categories")
            .then((r) => r.json())
            .then((cats: CatItem[]) => {
                catCache = cats;
                setImagedCats(cats.filter((c) => c.image));
            })
            .catch(() => { /* images stay empty — no crash */ });
    }, [isOpen]);

    // Live search as user types (debounced)
    useEffect(() => {
        const q = inputValue.trim();
        if (!q) { setLiveResults([]); return; }
        setLiveLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
                .then((r) => r.json())
                .then((d) => { setLiveResults((d.products ?? []).slice(0, 6)); setLiveLoading(false); })
                .catch((err) => { if (err.name !== "AbortError") setLiveLoading(false); });
        }, 280);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [inputValue]);

    function navigate(path: string) { onClose(); router.push(path); }
    function submitSearch(q: string) { if (!q.trim()) return; onClose(); onSubmit(q.trim()); }

    if (!isOpen) return null;
    const hasQuery = inputValue.trim().length > 0;

    // Thumbnail row — driven by imagedCats
    function ThumbRow({ rank, cat, href }: { rank: number; cat: CatItem; href: string }) {
        return (
            <button
                onClick={() => navigate(href)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "4px", transition: "background .12s", width: "100%" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ccc", width: "16px", textAlign: "center", flexShrink: 0 }}>{rank}</span>
                <div style={{ width: "44px", height: "58px", background: "#f0ece8", flexShrink: 0, overflow: "hidden" }}>
                    {cat.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    )}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "'Barlow', sans-serif", lineHeight: 1.3 }}>
                    {/* Title-case the WC name which comes back in ALL CAPS */}
                    {cat.name.replace(/&amp;/g, "&").replace(/&#8217;/g, "\u2019").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")}
                </span>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: "fixed", inset: 0, top: "68px", background: "rgba(0,0,0,0.45)", zIndex: 199 }}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={overlayRef}
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                style={{
                    position: "fixed", top: "68px", left: 0, right: 0,
                    background: "#fff", zIndex: 200,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    maxHeight: "calc(100vh - 68px)", overflowY: "auto",
                }}
            >
                {/* Input bar */}
                <div style={{ borderBottom: "1px solid #e8e8e8", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", maxWidth: "1200px", margin: "0 auto" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ flexShrink: 0 }} aria-hidden="true">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="search"
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitSearch(inputValue); }}
                        placeholder="Search for dresses, tops, sets…"
                        aria-label="Search products"
                        style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", fontFamily: "'Barlow', sans-serif", color: "#000", background: "transparent" }}
                    />
                    {inputValue && (
                        <button onClick={() => onInputChange("")} aria-label="Clear search"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: "4px", display: "flex", flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => submitSearch(inputValue)}
                        style={{ background: "#000", color: "#fff", border: "none", padding: "8px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
                    >
                        Search
                    </button>
                </div>

                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 20px 28px" }}>

                    {/* ── Live results ── */}
                    {hasQuery && (
                        <div>
                            {liveLoading && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i}>
                                            <div style={{ aspectRatio: "2/3", background: "#f0ece8" }} aria-hidden="true" />
                                            <div style={{ height: "10px", background: "#f0ece8", marginTop: "8px", width: "70%" }} aria-hidden="true" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!liveLoading && liveResults.length > 0 && (
                                <>
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "14px" }}>
                                        Suggestions
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                                        {liveResults.map((p) => {
                                            const img = p.images?.[0]?.src ?? "";
                                            return (
                                                <button key={p.id} onClick={() => navigate(`/product/${p.slug}`)}
                                                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                                                    <div style={{ aspectRatio: "2/3", background: "#f8f8f8", overflow: "hidden" }}>
                                                        {img && (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                                        )}
                                                    </div>
                                                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#000", marginTop: "6px", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                        {p.name}
                                                    </p>
                                                    <p style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>
                                                        {formatPrice(toNaira(p.prices.price))}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button onClick={() => submitSearch(inputValue)}
                                        style={{ fontSize: "13px", color: "#000", fontWeight: 700, background: "none", border: "1.5px solid #000", padding: "10px 24px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: ".08em", textTransform: "uppercase" }}>
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
                            <div style={{ marginBottom: "24px" }}>
                                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "12px" }}>
                                    Hot Searches
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {HOT_SEARCHES.map((term) => (
                                        <button key={term} onClick={() => submitSearch(term)}
                                            style={{ border: "1.5px solid #ddd", borderRadius: "999px", padding: "6px 14px", background: "#fff", fontSize: "13px", color: "#333", cursor: "pointer", fontFamily: "'Barlow', sans-serif", transition: "border-color .15s, color .15s" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#333"; }}>
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Three columns */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "32px" }}>

                                {/* Top Searches — no images, just ranked links */}
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "12px" }}>
                                        Top Searches
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {TOP_SEARCHES.map((item) => (
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

                                {/* Trending — first half of imaged categories */}
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "12px" }}>
                                        Trending
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {imagedCats.slice(0, 4).map((cat, i) => (
                                            <ThumbRow key={cat.slug} rank={i + 1} cat={cat} href={`/category/${cat.slug}`} />
                                        ))}
                                    </div>
                                </div>

                                {/* Occasion — second half of imaged categories (or repeat first if <5) */}
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#999", marginBottom: "12px" }}>
                                        Occasion
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        {(imagedCats.length > 4 ? imagedCats.slice(4, 8) : imagedCats.slice(0, 4)).map((cat, i) => (
                                            <ThumbRow key={cat.slug + "-occ"} rank={i + 1} cat={cat} href={`/category/${cat.slug}`} />
                                        ))}
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
