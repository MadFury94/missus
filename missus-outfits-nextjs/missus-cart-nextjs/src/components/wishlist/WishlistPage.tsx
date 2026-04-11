"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, HeartOff, ShoppingBag, Trash2, Share2, X } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/lib/wishlist-context";
import { formatNaira } from "@/lib/utils";

/* ─────────────────────── EMPTY STATE ─────────────────────────────────────── */
function WishlistEmpty() {
  const TRENDING = [
    { name: "Maybelline Bubble Mini", price: 43000, bg: "#fce8ec" },
    { name: "Stella Wrap Dress",      price: 48000, bg: "#f4ecec" },
    { name: "Malibu Barbie Halter",   price: 30000, bg: "#e8f0f4" },
    { name: "Zara Crochet Co-ord",    price: 65000, bg: "#f4f0e8" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Heart icon with zero badge */}
      <div className="relative mb-8">
        <div className="w-24 h-24 border-2 border-[#e0e0e0] rounded-full flex items-center justify-center">
          <Heart className="w-10 h-10 text-[#e0e0e0]" strokeWidth={1.2} />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#e8002d] rounded-full flex items-center justify-center">
          <span className="text-white text-[11px] font-bold font-condensed">0</span>
        </div>
      </div>

      <h1 className="font-condensed text-[32px] font-black uppercase tracking-[0.06em] text-black mb-2">
        Your Wishlist is Empty
      </h1>
      <p className="text-[14px] text-[#767676] font-light max-w-[360px] leading-relaxed mb-8">
        Save your favourite pieces here so you never lose track of them. Browse
        our latest drops and heart what you love.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/shop"
          className="bg-black text-white font-condensed text-[13px] font-bold tracking-[0.12em] uppercase px-8 py-3.5 hover:bg-[#222] transition-colors"
        >
          Shop Now
        </Link>
        <Link
          href="/new"
          className="border-[1.5px] border-black text-black font-condensed text-[13px] font-bold tracking-[0.12em] uppercase px-8 py-3.5 hover:bg-black hover:text-white transition-colors"
        >
          New Arrivals
        </Link>
      </div>

      {/* Trending section */}
      <div className="mt-16 w-full max-w-3xl text-left">
        <h2 className="font-condensed text-[18px] font-black uppercase tracking-[0.1em] mb-4 border-l-4 border-[#e8002d] pl-3">
          Trending Now
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {TRENDING.map((p) => (
            <div key={p.name} className="group cursor-pointer">
              <div
                className="aspect-[2/3] relative flex items-center justify-center mb-2 overflow-hidden"
                style={{ background: p.bg }}
              >
                <span className="font-condensed text-[10px] font-bold uppercase tracking-[0.08em] text-black/20 text-center px-2 leading-loose">
                  {p.name}
                </span>
                <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
              </div>
              <p className="text-[11px] text-[#111] leading-tight">{p.name}</p>
              <p className="text-[11px] font-bold mt-0.5">{formatNaira(p.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── GRID CARD ───────────────────────────────────────── */
function WishlistCard({ item }: { item: WishlistItem }) {
  const { removeItem } = useWishlist();
  const [removing, setRemoving] = useState(false);

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => removeItem(item.id), 280);
  }

  return (
    <div
      className={[
        "group relative bg-white border border-[#e8e8e8] transition-all duration-300",
        removing ? "opacity-0 scale-95" : "opacity-100 scale-100",
      ].join(" ")}
    >
      {/* Image */}
      <div
        className="aspect-[2/3] relative flex items-center justify-center overflow-hidden"
        style={{ background: item.bgColor }}
      >
        <span className="font-condensed text-[11px] font-bold uppercase tracking-[0.08em] text-black/20 text-center px-3 leading-loose">
          {item.name}
        </span>

        {/* Remove btn */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-[#e8002d] hover:text-white"
          aria-label="Remove from wishlist"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>

        {/* Badge */}
        {item.badge && (
          <span className="absolute top-2 left-2 bg-[#e8002d] text-white font-condensed text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 z-10">
            {item.badge}
          </span>
        )}

        {/* Out of stock overlay */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="font-condensed text-[12px] font-bold tracking-[0.14em] uppercase text-[#767676] bg-white px-3 py-1.5 border border-[#e0e0e0]">
              Out of Stock
            </span>
          </div>
        )}

        {/* Add to bag hover (only when in stock) */}
        {item.inStock && (
          <button className="absolute bottom-0 left-0 right-0 bg-black text-white font-condensed text-[11px] font-bold tracking-[0.12em] uppercase py-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-1.5 border-none cursor-pointer">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.8} />
            Add to Bag
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <Link
          href={`/product/${item.slug}`}
          className="font-condensed text-[13px] font-bold uppercase tracking-[0.03em] text-black hover:text-[#555] transition-colors leading-tight block mb-1"
        >
          {item.name}
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="w-3 h-3 border border-black/10 rounded-full flex-shrink-0"
            style={{ background: item.colorHex }}
          />
          <span className="text-[11px] text-[#767676]">{item.color}</span>
        </div>

        <div className="flex items-baseline gap-1.5">
          {item.originalPrice && (
            <span className="text-[11px] text-[#aaa] line-through">
              {formatNaira(item.originalPrice)}
            </span>
          )}
          <span
            className={[
              "text-[13px] font-bold",
              item.originalPrice ? "text-[#e8002d]" : "text-black",
            ].join(" ")}
          >
            {formatNaira(item.price)}
          </span>
        </div>

        <p className="text-[10px] text-[#bbb] mt-1.5">
          Saved{" "}
          {new Date(item.addedAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── LIST ROW ────────────────────────────────────────── */
function WishlistListRow({ item }: { item: WishlistItem }) {
  const { removeItem } = useWishlist();
  const [removing, setRemoving] = useState(false);

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => removeItem(item.id), 280);
  }

  return (
    <div
      className={[
        "flex items-center gap-5 py-4 transition-all duration-300",
        removing ? "opacity-0 translate-x-4" : "opacity-100",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div
        className="w-[70px] h-[90px] flex-shrink-0 flex items-center justify-center"
        style={{ background: item.bgColor }}
      >
        <span className="font-condensed text-[8px] font-bold uppercase text-black/20 text-center px-1 leading-loose">
          {item.name.split(" ").slice(0, 2).join(" ")}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${item.slug}`}
          className="font-condensed text-[15px] font-bold uppercase tracking-[0.03em] hover:text-[#555] transition-colors block truncate"
        >
          {item.name}
        </Link>
        <p className="text-[12px] text-[#767676] mt-0.5">{item.color}</p>
        {!item.inStock && (
          <span className="inline-block text-[10px] font-bold text-[#767676] border border-[#e0e0e0] px-2 py-0.5 mt-1 font-condensed uppercase tracking-wider">
            Out of Stock
          </span>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        {item.originalPrice && (
          <p className="text-[12px] text-[#aaa] line-through">
            {formatNaira(item.originalPrice)}
          </p>
        )}
        <p
          className={`text-[15px] font-bold ${
            item.originalPrice ? "text-[#e8002d]" : "text-black"
          }`}
        >
          {formatNaira(item.price)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.inStock && (
          <button className="bg-black text-white font-condensed text-[11px] font-bold tracking-[0.1em] uppercase px-4 py-2 hover:bg-[#222] transition-colors whitespace-nowrap flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.8} />
            Add to Bag
          </button>
        )}
        <button
          onClick={handleRemove}
          aria-label="Remove from wishlist"
          className="w-8 h-8 border border-[#e0e0e0] flex items-center justify-center hover:border-[#e8002d] hover:text-[#e8002d] transition-colors"
        >
          <HeartOff className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN PAGE ───────────────────────────────────────── */
export default function WishlistPage() {
  const { state, clear, count } = useWishlist();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("recent");

  const isEmpty = count === 0;

  const sortedItems = [...state.items].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  return (
    <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-8 pb-20">
      {isEmpty ? (
        <WishlistEmpty />
      ) : (
        <>
          {/* ── Page header ── */}
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Heart className="w-6 h-6 fill-[#e8002d] text-[#e8002d]" strokeWidth={0} />
                <h1 className="font-condensed text-[clamp(28px,4vw,42px)] font-black uppercase tracking-[0.04em] text-black leading-none">
                  My Wishlist
                </h1>
              </div>
              <p className="text-[13px] text-[#767676]">
                {count} saved item{count !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button className="flex items-center gap-1.5 border-[1.5px] border-[#e0e0e0] px-4 py-2 font-condensed text-[11px] font-bold tracking-[0.1em] uppercase hover:border-black transition-colors">
                <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
                Share
              </button>
              <button
                onClick={clear}
                className="flex items-center gap-1.5 border-[1.5px] border-[#e0e0e0] px-4 py-2 font-condensed text-[11px] font-bold tracking-[0.1em] uppercase hover:border-[#e8002d] hover:text-[#e8002d] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                Clear All
              </button>
              <button className="flex items-center gap-1.5 bg-black text-white px-5 py-2 font-condensed text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#222] transition-colors">
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.8} />
                Move All to Bag
              </button>
            </div>
          </div>

          {/* ── Sort / view toolbar ── */}
          <div className="flex items-center justify-between border-y border-[#e8e8e8] py-2.5 mb-6">
            <p className="text-[12px] text-[#767676]">
              {count} item{count !== 1 ? "s" : ""}
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

              <div className="flex gap-1">
                {(["grid", "list"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    title={`${v} view`}
                    className={[
                      "w-7 h-7 border flex items-center justify-center transition-colors",
                      view === v
                        ? "bg-black border-black"
                        : "border-[#e0e0e0] hover:border-black",
                    ].join(" ")}
                  >
                    {v === "grid" ? (
                      <svg viewBox="0 0 16 16" className={`w-3 h-3 ${view === "grid" ? "fill-white" : "fill-[#aaa]"}`}>
                        <rect x="0" y="0" width="6" height="6" /><rect x="9" y="0" width="6" height="6" />
                        <rect x="0" y="9" width="6" height="6" /><rect x="9" y="9" width="6" height="6" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" className={`w-3 h-3 ${view === "list" ? "fill-white" : "fill-[#aaa]"}`}>
                        <rect x="0" y="1" width="16" height="2" />
                        <rect x="0" y="6" width="16" height="2" />
                        <rect x="0" y="11" width="16" height="2" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Grid view ── */}
          {view === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedItems.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* ── List view ── */}
          {view === "list" && (
            <div className="divide-y divide-[#e8e8e8]">
              {sortedItems.map((item) => (
                <WishlistListRow key={item.id} item={item} />
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
        </>
      )}
    </div>
  );
}
