"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getWishlist, removeFromWishlist, clearWishlist, type WishlistItem } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [view, setView] = useState<"grid" | "list">("grid");
    const [sort, setSort] = useState("recent");

    useEffect(() => {
        setItems(getWishlist());
        const handleUpdate = () => setItems(getWishlist());
        window.addEventListener("wishlistUpdated", handleUpdate);
        return () => window.removeEventListener("wishlistUpdated", handleUpdate);
    }, []);

    const handleRemove = (productId: number) => {
        removeFromWishlist(productId);
        setItems(getWishlist());
    };

    const handleClear = () => {
        if (confirm("Remove all items from your wishlist?")) {
            clearWishlist();
            setItems([]);
        }
    };

    const handleAddToBag = (item: WishlistItem) => {
        addToCart({
            productId: item.productId,
            name: item.name,
            slug: item.slug,
            price: item.price,
            regularPrice: item.price,
            quantity: 1,
            image: item.image,
            size: undefined,
            color: undefined,
        });
        window.dispatchEvent(new Event("cart-updated"));
    };

    const handleMoveAllToBag = () => {
        items.forEach((item) => handleAddToBag(item));
    };

    const sortedItems = [...items].sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        return b.productId - a.productId;
    });

    const isEmpty = items.length === 0;

    // ─── EMPTY STATE ─────────────────────────────────────────────────────────
    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 pb-28">

                {/* Empty heart with zero badge */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-2 border-[#e0e0e0] rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#e0e0e0]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#e8002d] rounded-full flex items-center justify-center">
                        <span className="text-white text-[11px] font-bold font-condensed">0</span>
                    </div>
                </div>

                <h1 className="font-condensed text-[32px] font-black uppercase tracking-[0.06em] text-black mb-2">
                    Your Wishlist is Empty
                </h1>
                <p className="text-[14px] text-[#767676] font-light max-w-[360px] leading-relaxed mb-10">
                    Save your favourite pieces here so you never lose track of them. Browse our latest drops and heart what you love.
                </p>

                <div className="flex gap-3 flex-wrap justify-center mb-20">
                    <Link
                        href="/shop"
                        className="inline-block bg-black text-white text-[12px] font-bold uppercase tracking-[0.25em] px-8 py-3 border border-black transition-all duration-300 hover:bg-transparent hover:text-black"
                    >
                        Shop Now
                    </Link>

                    <Link
                        href="/new"
                        className="inline-block bg-white text-black text-[12px] font-bold uppercase tracking-[0.25em] px-8 py-3 border border-black transition-all duration-300 hover:bg-black hover:text-white"
                    >
                        New Arrals
                    </Link>
                </div>

                {/* Trending section */}
                <div className="w-full max-w-3xl px-6">
                    <h2 className="font-condensed text-[18px] font-black uppercase tracking-[0.1em] mb-4 border-l-4 border-[#e8002d] pl-3 text-left">
                        Trending Now
                    </h2>
                    <div className="grid grid-cols-4 gap-3">
                        <TrendingCard name="Maybelline Bubble Mini" price={43000} bg="#fce8ec" />
                        <TrendingCard name="Stella Wrap Dress" price={48000} bg="#f4ecec" />
                        <TrendingCard name="Malibu Barbie Halter" price={30000} bg="#e8f0f4" />
                        <TrendingCard name="Zara Crochet Co-ord" price={65000} bg="#f4f0e8" />
                    </div>
                </div>
            </div>
        );
    }

    // ─── FILLED STATE ────────────────────────────────────────────────────────
    return (
        <div className="max-w-[1280px] mx-auto px-6 py-8 pb-28">

            {/* ── Page header ── */}
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        {/* Filled heart */}
                        <svg className="w-6 h-6" fill="#e8002d" stroke="none" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <h1 className="font-condensed text-[42px] font-black uppercase tracking-[0.04em] text-black leading-none">
                            My Wishlist
                        </h1>
                    </div>
                    <p className="text-[13px] text-[#767676]">
                        {items.length} saved item{items.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Share */}
                    <button className="flex items-center gap-1.5 border-[1.5px] border-[#e0e0e0] px-4 py-2 font-condensed text-[11px] font-bold tracking-[0.1em] uppercase hover:border-black transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        Share
                    </button>

                    {/* Clear all */}
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 border-[1.5px] border-[#e0e0e0] px-4 py-2 font-condensed text-[11px] font-bold tracking-[0.1em] uppercase hover:border-[#e8002d] hover:text-[#e8002d] transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                        </svg>
                        Clear All
                    </button>

                    {/* Move all to bag */}
                    <button
                        onClick={handleMoveAllToBag}
                        className="flex items-center gap-1.5 bg-black text-white px-5 py-2 font-condensed text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#222] transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Move All to Bag
                    </button>
                </div>
            </div>

            {/* ── Sort / view toolbar ── */}
            <div className="flex items-center justify-between border-y border-[#e8e8e8] py-2.5 mb-6">
                <p className="text-[12px] text-[#767676]">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-3">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="text-[12px] border border-[#e0e0e0] px-2 py-1.5 outline-none bg-white cursor-pointer"
                    >
                        <option value="recent">Sort: Recently Added</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>

                    {/* Grid / list toggle */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => setView("grid")}
                            title="Grid view"
                            className={`w-7 h-7 border flex items-center justify-center transition-colors ${view === "grid"
                                ? "bg-black border-black"
                                : "border-[#e0e0e0] hover:border-black"
                                }`}
                        >
                            <svg viewBox="0 0 16 16" className={`w-3 h-3 ${view === "grid" ? "fill-white" : "fill-[#aaa]"}`}>
                                <rect x="0" y="0" width="6" height="6" />
                                <rect x="9" y="0" width="6" height="6" />
                                <rect x="0" y="9" width="6" height="6" />
                                <rect x="9" y="9" width="6" height="6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setView("list")}
                            title="List view"
                            className={`w-7 h-7 border flex items-center justify-center transition-colors ${view === "list"
                                ? "bg-black border-black"
                                : "border-[#e0e0e0] hover:border-black"
                                }`}
                        >
                            <svg viewBox="0 0 16 16" className={`w-3 h-3 ${view === "list" ? "fill-white" : "fill-[#aaa]"}`}>
                                <rect x="0" y="1" width="16" height="2" />
                                <rect x="0" y="6" width="16" height="2" />
                                <rect x="0" y="11" width="16" height="2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Grid view ── */}
            {view === "grid" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedItems.map((item) => (
                        <WishlistCard
                            key={item.productId}
                            item={item}
                            onRemove={handleRemove}
                            onAddToBag={handleAddToBag}
                        />
                    ))}
                </div>
            )}

            {/* ── List view ── */}
            {view === "list" && (
                <div className="divide-y divide-[#e8e8e8]">
                    {sortedItems.map((item) => (
                        <WishlistListRow
                            key={item.productId}
                            item={item}
                            onRemove={handleRemove}
                            onAddToBag={handleAddToBag}
                        />
                    ))}
                </div>
            )}

            {/* ── Bottom CTA ── */}
            <div className="mt-12 flex flex-col items-center gap-3 py-8 border-t border-[#e8e8e8]">
                <p className="text-[13px] text-[#767676]">Want to discover more?</p>
                <Link
                    href="/shop"
                    className="bg-black text-white font-condensed text-[13px] font-bold tracking-[0.12em] uppercase px-10 py-3.5 hover:bg-[#222] transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

// ─── TRENDING CARD (empty state) ─────────────────────────────────────────────
function TrendingCard({ name, price, bg }: { name: string; price: number; bg: string }) {
    const parts = name.split(" ");
    const mid = Math.ceil(parts.length / 2);
    const line1 = parts.slice(0, mid).join(" ");
    const line2 = parts.slice(mid).join(" ");

    return (
        <div className="group cursor-pointer bg-white">
            <div
                className="aspect-[2/3] relative flex items-center justify-center mb-2 overflow-hidden"
                style={{ backgroundColor: bg }}
            >
                <span className="font-condensed text-[10px] font-bold uppercase tracking-[0.08em] text-black/20 text-center px-2 leading-loose">
                    {line1}
                    {line2 && <><br />{line2}</>}
                </span>
                {/* Wishlist heart on hover */}
                <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>
            <p className="text-[11px] text-[#111] leading-tight">{name}</p>
            <p className="text-[11px] font-bold mt-0.5">{formatPrice(price)}</p>
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

    const handleRemove = () => {
        setRemoving(true);
        setTimeout(() => onRemove(item.productId), 280);
    };

    return (
        <div
            className={`group relative bg-white border border-[#e8e8e8] transition-all duration-300 ${removing ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <Link href={`/product/${item.slug}`} className="block relative aspect-[2/3] overflow-hidden bg-[#f0ece8]">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 50vw, 20vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-condensed text-[11px] font-bold uppercase tracking-[0.08em] text-black/20 text-center px-3 leading-loose">
                        {item.name}
                    </div>
                )}

                {/* Remove btn — top-right × */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(); }}
                    aria-label="Remove from wishlist"
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center z-[2] transition-all hover:bg-[#e8002d] hover:text-white"
                    style={{ opacity: hovered ? 1 : 0 }}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Add to bag — bottom bar */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToBag(item); }}
                    className="absolute bottom-0 left-0 right-0 bg-black text-white font-condensed text-[11px] font-bold tracking-[0.12em] uppercase py-2.5 z-[2] flex items-center justify-center gap-1.5 transition-opacity border-none w-full cursor-pointer"
                    style={{ opacity: hovered ? 1 : 0 }}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Add to Bag
                </button>
            </Link>

            {/* Info */}
            <div className="p-3">
                <Link
                    href={`/product/${item.slug}`}
                    className="font-condensed text-[13px] font-bold uppercase tracking-[0.03em] text-black hover:text-[#555] transition-colors leading-tight block mb-1 line-clamp-2"
                >
                    {item.name}
                </Link>
                <p className="text-[13px] font-bold text-black">{formatPrice(item.price)}</p>
            </div>
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

    const handleRemove = () => {
        setRemoving(true);
        setTimeout(() => onRemove(item.productId), 280);
    };

    return (
        <div
            className={`flex items-center gap-5 py-4 transition-all duration-300 ${removing ? "opacity-0 translate-x-4" : "opacity-100"
                }`}
        >
            {/* Thumbnail */}
            <Link href={`/product/${item.slug}`} className="w-[70px] h-[90px] flex-shrink-0 relative overflow-hidden bg-[#f0ece8]">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="70px"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-condensed text-[8px] font-bold uppercase text-black/20 text-center px-1 leading-loose">
                        {item.name.split(" ").slice(0, 2).join(" ")}
                    </div>
                )}
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/product/${item.slug}`}
                    className="font-condensed text-[15px] font-bold uppercase tracking-[0.03em] hover:text-[#555] transition-colors block truncate"
                >
                    {item.name}
                </Link>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
                <p className="text-[15px] font-bold text-black">{formatPrice(item.price)}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onAddToBag(item)}
                    className="bg-black text-white font-condensed text-[11px] font-bold tracking-[0.1em] uppercase px-4 py-2 hover:bg-[#222] transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Add to Bag
                </button>
                <button
                    onClick={handleRemove}
                    aria-label="Remove from wishlist"
                    className="w-8 h-8 border border-[#e0e0e0] flex items-center justify-center hover:border-[#e8002d] hover:text-[#e8002d] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
