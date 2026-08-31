"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getWishlist, removeFromWishlist, clearWishlist, type WishlistItem } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import type { StoreProduct } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";

// price in WishlistItem is already in naira — format directly
function fmtNaira(naira: number) {
    return `₦${naira.toLocaleString("en-NG")}`;
}

// ─── SIZE PICKER MODAL ────────────────────────────────────────────────────────
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

function SizePickerModal({
    item,
    onConfirm,
    onClose,
}: {
    item: WishlistItem;
    onConfirm: (size: string) => void;
    onClose: () => void;
}) {
    const [selected, setSelected] = useState("");
    const [sizes, setSizes] = useState<string[]>(DEFAULT_SIZES);
    const [loadingSizes, setLoadingSizes] = useState(true);

    useEffect(() => {
        fetch(`/api/products/${item.slug}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                const sizeAttr = (data?.attributes ?? []).find((a: { name: string }) =>
                    a.name.toLowerCase().includes("size")
                );
                if (sizeAttr?.options?.length) setSizes(sizeAttr.options);
            })
            .catch(() => { })
            .finally(() => setLoadingSizes(false));
    }, [item.slug]);

    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ background: "#fff", width: "100%", maxWidth: "380px", padding: "28px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
                    <div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#aaa", marginBottom: "4px" }}>Select Size</p>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#000", lineHeight: 1.3, maxWidth: "260px" }}>{item.name}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "22px", lineHeight: 1, padding: "0 0 0 8px" }}>×</button>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "18px", minHeight: "48px" }}>
                    {loadingSizes
                        ? DEFAULT_SIZES.map((s) => <div key={s} style={{ width: "50px", height: "38px", background: "#f0f0f0" }} />)
                        : sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelected(size)}
                                style={{
                                    minWidth: "50px", height: "38px", padding: "0 10px",
                                    border: selected === size ? "2px solid #000" : "1.5px solid #d0d0d0",
                                    background: selected === size ? "#000" : "#fff",
                                    color: selected === size ? "#fff" : "#000",
                                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700,
                                    letterSpacing: ".04em", textTransform: "uppercase", cursor: "pointer", transition: "all .15s",
                                }}
                            >
                                {size}
                            </button>
                        ))
                    }
                </div>

                <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "14px" }}>
                    Not sure?{" "}
                    <Link href="/size-guide" target="_blank" style={{ color: "#000", textDecoration: "underline" }}>
                        Size Guide →
                    </Link>
                </p>

                <button
                    disabled={!selected}
                    onClick={() => selected && onConfirm(selected)}
                    style={{
                        width: "100%", height: "46px",
                        background: selected ? "#000" : "#ccc", color: "#fff", border: "none",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
                        letterSpacing: ".1em", textTransform: "uppercase",
                        cursor: selected ? "pointer" : "not-allowed", transition: "background .2s",
                    }}
                >
                    {selected ? `Add to Bag — ${selected}` : "Select a Size"}
                </button>
                <button
                    onClick={() => onConfirm("")}
                    style={{ width: "100%", background: "none", border: "none", marginTop: "8px", fontSize: "11px", color: "#999", cursor: "pointer", textDecoration: "underline" }}
                >
                    Skip — add without size
                </button>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [view, setView] = useState<"grid" | "list">("grid");
    const [sort, setSort] = useState("recent");
    const [sizePickerItem, setSizePickerItem] = useState<WishlistItem | null>(null);
    const [trending, setTrending] = useState<StoreProduct[]>([]);

    useEffect(() => {
        setItems(getWishlist());
        const sync = () => setItems(getWishlist());
        window.addEventListener("wishlistUpdated", sync);

        fetch("/api/products?per_page=4&orderby=date&order=desc")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (d?.products) setTrending(d.products); })
            .catch(() => { });

        return () => window.removeEventListener("wishlistUpdated", sync);
    }, []);

    const handleRemove = (id: number) => { removeFromWishlist(id); setItems(getWishlist()); };

    const handleClear = () => {
        if (!confirm("Remove all items from your wishlist?")) return;
        clearWishlist();
        setItems([]);
    };

    const doAddToBag = (item: WishlistItem, size: string) => {
        addToCart({
            productId: item.productId, name: item.name, slug: item.slug,
            price: item.price, regularPrice: item.price,
            quantity: 1, image: item.image,
            size: size || undefined, color: undefined,
        });
        window.dispatchEvent(new Event("cart-updated"));
        window.dispatchEvent(new Event("open-cart-drawer"));
        setSizePickerItem(null);
    };

    const handleAddToBag = (item: WishlistItem) => setSizePickerItem(item);

    const handleMoveAll = () => {
        items.forEach((item) => {
            addToCart({
                productId: item.productId, name: item.name, slug: item.slug,
                price: item.price, regularPrice: item.price,
                quantity: 1, image: item.image,
                size: undefined, color: undefined,
            });
        });
        window.dispatchEvent(new Event("cart-updated"));
        window.dispatchEvent(new Event("open-cart-drawer"));
    };

    const sorted = [...items].sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        return b.productId - a.productId; // recently added
    });

    // ── EMPTY STATE ──────────────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 20px 80px", textAlign: "center" }}>
                <div style={{ width: "72px", height: "72px", border: "2px solid #e0e0e0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", position: "relative" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "22px", height: "22px", background: "#e8002d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700 }}>0</span>
                    </div>
                </div>

                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", color: "#000", marginBottom: "12px" }}>
                    Your Wishlist is Empty
                </h1>
                <p style={{ fontSize: "14px", color: "#767676", lineHeight: 1.7, maxWidth: "360px", margin: "0 auto 32px" }}>
                    Save pieces you love by tapping the heart on any product. They&apos;ll all live here.
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "56px" }}>
                    <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "13px 32px", textDecoration: "none" }}>
                        Shop Now
                    </Link>
                    <Link href="/new-in" style={{ background: "#fff", color: "#000", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "13px 32px", textDecoration: "none", border: "1.5px solid #000" }}>
                        New Arrivals
                    </Link>
                </div>

                {trending.length > 0 && (
                    <div style={{ textAlign: "left" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "16px", paddingLeft: "4px", borderLeft: "3px solid #e8002d" }}>
                            &nbsp;Trending Now
                        </h2>
                        <div className="grid-4">
                            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── FILLED STATE ─────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 20px 80px" }}>

            {sizePickerItem && (
                <SizePickerModal
                    item={sizePickerItem}
                    onConfirm={(size) => doAddToBag(sizePickerItem, size)}
                    onClose={() => setSizePickerItem(null)}
                />
            )}

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", color: "#000", marginBottom: "2px" }}>
                        My Wishlist
                    </h1>
                    <p style={{ fontSize: "12px", color: "#767676" }}>{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <button
                        onClick={handleClear}
                        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1.5px solid #e0e0e0", padding: "8px 14px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#555", cursor: "pointer", transition: "all .15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e8002d"; e.currentTarget.style.color = "#e8002d"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#555"; }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                        Clear All
                    </button>
                    <button
                        onClick={handleMoveAll}
                        style={{ display: "flex", alignItems: "center", gap: "6px", background: "#000", color: "#fff", border: "none", padding: "8px 18px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", transition: "background .15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9h12l-1.5 10H7.5L6 9z" /><path d="M9 9V7a3 3 0 0 1 6 0v2" /></svg>
                        Move All to Bag
                    </button>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8", padding: "10px 0", marginBottom: "20px" }}>
                <span style={{ fontSize: "12px", color: "#767676" }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{ fontFamily: "'Barlow', sans-serif", fontSize: "12px", border: "1px solid #e0e0e0", padding: "6px 10px", background: "#fff", cursor: "pointer", outline: "none" }}
                    >
                        <option value="recent">Sort: Recently Added</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>

                    {/* View toggles */}
                    {(["grid", "list"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            aria-label={`${v} view`}
                            aria-pressed={view === v}
                            style={{ width: "28px", height: "28px", border: `1px solid ${view === v ? "#000" : "#e0e0e0"}`, background: view === v ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s" }}
                        >
                            {v === "grid" ? (
                                <svg viewBox="0 0 16 16" width="12" height="12" fill={view === "grid" ? "#fff" : "#aaa"}>
                                    <rect x="0" y="0" width="6" height="6" /><rect x="9" y="0" width="6" height="6" />
                                    <rect x="0" y="9" width="6" height="6" /><rect x="9" y="9" width="6" height="6" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 16 16" width="12" height="12" fill={view === "list" ? "#fff" : "#aaa"}>
                                    <rect x="0" y="1" width="16" height="2" /><rect x="0" y="6" width="16" height="2" /><rect x="0" y="11" width="16" height="2" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Grid view ── */}
            {view === "grid" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }} className="wishlist-grid">
                    {sorted.map((item) => (
                        <WishlistCard key={item.productId} item={item} onRemove={handleRemove} onAddToBag={handleAddToBag} />
                    ))}
                </div>
            )}

            {/* ── List view ── */}
            {view === "list" && (
                <div style={{ borderTop: "1px solid #e8e8e8" }}>
                    {sorted.map((item) => (
                        <WishlistListRow key={item.productId} item={item} onRemove={handleRemove} onAddToBag={handleAddToBag} />
                    ))}
                </div>
            )}

            {/* ── Footer CTA ── */}
            <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e8e8e8", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#767676", marginBottom: "14px" }}>Want to discover more?</p>
                <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "13px 40px", textDecoration: "none" }}>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

// ─── GRID CARD ────────────────────────────────────────────────────────────────
function WishlistCard({
    item,
    onRemove,
    onAddToBag,
}: {
    item: WishlistItem;
    onRemove: (id: number) => void;
    onAddToBag: (item: WishlistItem) => void;
}) {
    const [removing, setRemoving] = useState(false);
    const [hovered, setHovered] = useState(false);

    if (removing) return null;

    return (
        <div
            style={{ position: "relative", background: "#fff", cursor: "pointer" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <Link href={`/product/${item.slug}`} style={{ display: "block", position: "relative", aspectRatio: "2/3", overflow: "hidden", background: "#f0ece8" }}>
                {item.image && (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover", objectPosition: "top" }}
                        sizes="(max-width: 640px) 50vw, 25vw"
                    />
                )}

                {/* Remove × */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRemoving(true); setTimeout(() => onRemove(item.productId), 250); }}
                    aria-label="Remove from wishlist"
                    style={{
                        position: "absolute", top: "8px", right: "8px",
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "rgba(255,255,255,.9)", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", zIndex: 2,
                        opacity: hovered ? 1 : 0, transition: "opacity .2s",
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Add to bag bar — visible on hover on desktop, always visible on touch */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToBag(item); }}
                    style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "#000", color: "#fff",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700,
                        letterSpacing: ".12em", textTransform: "uppercase",
                        padding: "10px", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        zIndex: 2,
                        // always visible on touch (no hover), fade in on pointer devices
                        opacity: hovered ? 1 : 0,
                        transition: "opacity .2s",
                    }}
                    className="wishlist-add-btn"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9h12l-1.5 10H7.5L6 9z" />
                        <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                    </svg>
                    Add to Bag
                </button>
            </Link>

            {/* Info */}
            <div style={{ padding: "8px 6px 12px" }}>
                <Link href={`/product/${item.slug}`} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "#000", display: "block", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none" }}>
                    {item.name}
                </Link>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#000" }}>{fmtNaira(item.price)}</p>
                {/* Mobile add-to-bag button — always visible */}
                <button
                    onClick={() => onAddToBag(item)}
                    style={{ marginTop: "8px", width: "100%", background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "9px", border: "none", cursor: "pointer", display: "none" }}
                    className="wishlist-mobile-add"
                >
                    Add to Bag
                </button>
            </div>

            <style>{`
                @media (hover: none) {
                    .wishlist-add-btn { opacity: 0 !important; }
                    .wishlist-mobile-add { display: block !important; }
                }
                @media (max-width: 768px) {
                    .wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </div>
    );
}

// ─── LIST ROW ────────────────────────────────────────────────────────────────
function WishlistListRow({
    item,
    onRemove,
    onAddToBag,
}: {
    item: WishlistItem;
    onRemove: (id: number) => void;
    onAddToBag: (item: WishlistItem) => void;
}) {
    const [removing, setRemoving] = useState(false);

    if (removing) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0", borderBottom: "1px solid #e8e8e8" }}>
            {/* Thumbnail */}
            <Link href={`/product/${item.slug}`} style={{ width: "70px", height: "90px", flexShrink: 0, position: "relative", overflow: "hidden", background: "#f0ece8", display: "block" }}>
                {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="70px" />}
            </Link>

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/product/${item.slug}`} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "#000", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none" }}>
                    {item.name}
                </Link>
            </div>

            {/* Price */}
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#000", flexShrink: 0 }}>{fmtNaira(item.price)}</p>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <button
                    onClick={() => onAddToBag(item)}
                    style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "9px 16px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9h12l-1.5 10H7.5L6 9z" /><path d="M9 9V7a3 3 0 0 1 6 0v2" /></svg>
                    Add to Bag
                </button>
                <button
                    onClick={() => { setRemoving(true); setTimeout(() => onRemove(item.productId), 250); }}
                    aria-label="Remove from wishlist"
                    style={{ width: "34px", height: "34px", border: "1.5px solid #e0e0e0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e8002d"; e.currentTarget.style.color = "#e8002d"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#000"; }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
