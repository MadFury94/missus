"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { getDiscount, getSizes, getColors, toNaira } from "@/lib/woocommerce";
import { addToCart, getCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import RestockSignup from "@/components/product/RestockSignup";
import type { ProductStock } from "@/lib/product-stock";
import { stockForSelection } from "@/lib/stock-selection";
import ProductCard from "@/components/product/ProductCard";
import { useCurrency } from "@/lib/currency";
import { normalizeStockStatus, stockStatusLabel } from "@/lib/stock-status";
import { decodeHtmlEntities } from "@/lib/api-helpers";

const GIFT_CARD_MIN = 10000;
const GIFT_CARD_MAX = 150000;

/** Convert catalogue colour names into reliable CSS swatches. WooCommerce
 * often uses fashion names ("Coffee", "White Beige", "Mocha") that are not
 * valid CSS colours, so passing the label directly produces an invisible or
 * misleading swatch. */
function getColorSwatch(label: string): { background: string; light: boolean } {
    const key = label.trim().toLowerCase().replace(/\s+/g, " ");
    const swatches: Record<string, string> = {
        black: "#111111", white: "#ffffff", ivory: "#fffff0", cream: "#fffdd0",
        beige: "#f5f5dc", "white beige": "linear-gradient(135deg, #ffffff 0 48%, #f5f5dc 52% 100%)",
        coffee: "#6f4e37", mocha: "#967969", chocolate: "#7b3f00", camel: "#c19a6b",
        tan: "#d2b48c", brown: "#964b00", nude: "#e3bc9a", cognac: "#9a463d",
        burgundy: "#800020", wine: "#722f37", maroon: "#800000", red: "#e53935",
        pink: "#ffc0cb", rose: "#e8a0a8", mauve: "#c08081", purple: "#800080",
        lilac: "#c8a2c8", lavender: "#e6e6fa", blue: "#2563eb", navy: "#000080",
        denim: "#3f5f8f", teal: "#008080", green: "#228b22", olive: "#808000",
        sage: "#9caf88", khaki: "#c3b091", orange: "#f97316", rust: "#b7410e",
        yellow: "#facc15", gold: "#d4af37", silver: "#c0c0c0", gray: "#808080",
        grey: "#808080", charcoal: "#36454f",
    };
    const exact = swatches[key];
    if (exact) return { background: exact, light: /white|ivory|cream|beige|tan|nude|yellow|silver|gold/.test(key) };

    // For compound labels, use the most meaningful colour token.
    const token = key.split(/[\s/&-]+/).find((part) => swatches[part]);
    if (token) return { background: swatches[token], light: /white|ivory|cream|beige|tan|nude|yellow|silver|gold/.test(token) };

    // A neutral fallback is preferable to an invalid CSS background value.
    return { background: "#d4d0cc", light: true };
}

function AccordionItem({ title, content }: { title: string; content: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: "1px solid #e8e8e8" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{ width: "100%", padding: "16px 0", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}
            >
                <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "#000" }}>{title}</span>
                <span style={{ fontSize: "18px", color: "#999", transform: open ? "rotate(45deg)" : "none", transition: "transform .2s", display: "inline-block", lineHeight: 1 }}>+</span>
            </button>
            {open && (
                <div
                    style={{ paddingBottom: "16px", fontSize: "13px", color: "#666", lineHeight: 1.7, fontWeight: 300 }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                />
            )}
        </div>
    );
}

function AccordionItemWithIcon({ title, content, icon, isLast }: { title: string; content: string; icon: React.ReactNode; isLast?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: isLast ? "none" : "1px solid #ebebeb" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{ width: "100%", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}
            >
                <span style={{ color: "#333", flexShrink: 0, display: "flex" }}>{icon}</span>
                <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#000", letterSpacing: ".02em" }}>{title}</span>
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"
                    style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <div
                    style={{ padding: "0 18px 18px 48px", fontSize: "13px", color: "#666", lineHeight: 1.8, fontWeight: 300 }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                />
            )}
        </div>
    );
}

export default function ProductPageClient({ params, product, related }: {
    params: { slug: string },
    product: any,
    related: any[]
}) {
    const { convert } = useCurrency();
    const [stock, setStock] = useState<ProductStock | null>(null);
    const [stockLoading, setStockLoading] = useState(true);
    const [stockError, setStockError] = useState("");
    useEffect(() => {
        const controller = new AbortController();
        setStock(null);
        setStockLoading(true);
        setStockError("");
        fetch(`/api/stock?productId=${product.id}`, { signal: controller.signal, cache: "no-store" })
            .then(async response => { if (!response.ok) throw new Error("Availability could not be loaded. Refresh to try again."); return response.json(); })
            .then(data => { if (!controller.signal.aborted) setStock(data); })
            .catch(error => { if (!controller.signal.aborted) setStockError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setStockLoading(false); });
        return () => controller.abort();
    }, [product.id]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [isWished, setIsWished] = useState(false);
    const [wishlistError, setWishlistError] = useState("");
    const [stickyVisible, setStickyVisible] = useState(false);
    const isGiftCard = product.slug === "gift-card" || product.type === "gift-card" || /gift\s*(card|voucher|certificate)/i.test(product.name);
    const [giftAmount, setGiftAmount] = useState(25000);
    const [giftAmountInput, setGiftAmountInput] = useState("");
    const addToBagRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    useEffect(() => {
        const syncWishlist = () => setIsWished(isInWishlist(product.id));
        syncWishlist();
        window.addEventListener("wishlistUpdated", syncWishlist);
        window.addEventListener("storage", syncWishlist);
        return () => {
            window.removeEventListener("wishlistUpdated", syncWishlist);
            window.removeEventListener("storage", syncWishlist);
        };
    }, [product.id]);

    function handleWishlist() {
        const expected = toggleWishlist({
            productId: product.id, name: product.name, slug: product.slug,
            price: toNaira(product.prices.price), image: product.images?.[0]?.src || "",
        });
        const saved = isInWishlist(product.id);
        setIsWished(saved);
        setWishlistError(saved === expected ? "" : "Could not update your wishlist. Please try again.");
    }

    // Pre-select first color if available
    useEffect(() => {
        const colors = getColors(product);
        if (colors.length > 0) setSelectedColor(colors[0]);
    }, [product]);

    // Show sticky bar only after user scrolls past the main Add to Bag button.
    // Uses scroll position vs button's bottom edge — same approach as FashionNova.
    // IntersectionObserver fires on load before scroll; scroll listener does not.
    useEffect(() => {
        function onScroll() {
            const el = addToBagRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            // rect.bottom <= 0 means the button has scrolled fully off screen upward
            setStickyVisible(rect.bottom <= 0);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const sizes = getSizes(product);
    const colors = getColors(product);
    const discount = getDiscount(product.prices.regular_price, product.prices.sale_price);
    const isOnSale = product.on_sale && product.prices.sale_price !== product.prices.regular_price;
    const breadcrumb = product.categories?.[0];
    const images = product.images?.slice(0, 8) ?? [];

    const currentStock = stock?.productId === product.id ? stock : null;
    const selectionStock = stockForSelection(currentStock, selectedSize, selectedColor);
    // Catalogue stock is available on first render; fresh inventory can supersede it.
    const productStatus = normalizeStockStatus(product.stock_status, product.is_in_stock);
    const soldOut = !isGiftCard && (selectionStock !== null ? !selectionStock.available : productStatus === "outofstock");
    const selectedGiftAmount = giftAmountInput ? Number(giftAmountInput) : giftAmount;
    const validGiftAmount = !isGiftCard || (Number.isInteger(selectedGiftAmount) && selectedGiftAmount >= GIFT_CARD_MIN && selectedGiftAmount <= GIFT_CARD_MAX);
    const handleAddToCart = async () => {
        if (soldOut) {
            document.getElementById("restock-signup")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        if (stockLoading && !isGiftCard) return;
        if (adding) return;
        if (!validGiftAmount) return;
        if (sizes.length > 0 && !selectedSize) {
            // Scroll to size section instead of alert
            document.getElementById("size-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setAdding(true);
        const item = {
            productId: product.id,
            variationId: stock?.variable ? selectionStock?.id : undefined,
            name: isGiftCard ? `${product.name} — ₦${selectedGiftAmount.toLocaleString("en-NG")}` : product.name,
            slug: product.slug,
            price: isGiftCard ? selectedGiftAmount : toNaira(product.prices.price),
            regularPrice: isGiftCard ? selectedGiftAmount : toNaira(product.prices.regular_price),
            image: product.images[0]?.src || "",
            size: selectedSize || undefined,
            color: selectedColor || undefined,
            quantity: 1,
            stockStatus: productStatus,
            backordersAllowed: product.backorders_allowed,
            isOnBackorder: product.is_on_backorder,
        };
        try {
            const existingQuantity = getCart().items.filter(existing => existing.productId === item.productId && existing.size === item.size && existing.color === item.color)
                .reduce((sum, existing) => sum + existing.quantity, 0);
            const response = await fetch("/api/cart/validate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item: { ...item, quantity: existingQuantity + 1 } }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "This item is unavailable.");
            addToCart(item);
        } catch (error) {
            alert(error instanceof Error ? error.message : "We could not check availability. Please try again.");
            setAdding(false);
            return;
        }
        window.dispatchEvent(new Event("cart-updated"));
        window.dispatchEvent(new Event("open-cart-drawer"));
        setAdded(true);
        setTimeout(() => { setAdding(false); setAdded(false); }, 1600);
    };

    // Swipe handling for mobile image carousel
    function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
    function onTouchEnd(e: React.TouchEvent) {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) {
            if (diff > 0) setSelectedImageIndex((i) => Math.min(i + 1, images.length - 1));
            else setSelectedImageIndex((i) => Math.max(i - 1, 0));
        }
    }

    return (
        <>
            <style>{`
                /* ── PDP layout ─────────────────────────────── */
                .pdp-wrap {
                    display: grid;
                    grid-template-columns: 80px 480px 1fr;
                    gap: 0;
                    max-width: 1100px;
                    margin: 0 auto;
                    align-items: start;
                }
                .pdp-thumb-col { display: flex; flex-direction: column; gap: 6px; padding: 12px 8px 12px 12px; width: 80px; }
                .pdp-info-col { padding: 24px 32px 48px; position: sticky; top: 52px; }
                .pdp-breadcrumb { display: block; }
                .pdp-mobile-dots { display: none; }

                @media (max-width: 900px) {
                    .pdp-wrap { 
                        grid-template-columns: 1fr; 
                        margin-top: -41px; /* Pull up under category nav (41px height) */
                    }
                    .pdp-thumb-col { display: none; }
                    .pdp-info-col { padding: 20px 16px 40px; position: static; }
                    .pdp-breadcrumb { display: none !important; }
                    .pdp-main-img { min-height: 500px !important; aspect-ratio: 3/5 !important; }
                    .pdp-mobile-dots { display: flex; }
                }

                /* Size button focus ring */
                .size-btn:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
                .pdp-wishlist {
                    display: flex; align-items: center; justify-content: center; gap: 9px;
                    width: 100%; min-height: 48px; margin-top: 10px; padding: 13px 20px;
                    border: 1px solid #d5d5d5; border-radius: 999px; background: #fff; color: #222;
                    font-family: var(--font-body, 'DM Sans', sans-serif); font-size: 12px;
                    font-weight: 600; letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
                    transition: border-color .2s, background .2s, color .2s;
                }
                .pdp-wishlist:hover { border-color: #111; background: #fafafa; }
                .pdp-wishlist[aria-pressed="true"] { color: #7f0e12; border-color: #7f0e12; background: #fff8f8; }
                .pdp-wishlist:focus-visible { outline: 2px solid #111; outline-offset: 3px; }

                /* Related grid mobile */
                @media (max-width: 768px) {
                    .related-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1px !important; }
                    .related-section { padding: 32px 0 40px !important; }
                    .related-header { padding: 0 16px 20px !important; }
                }
            `}</style>

            {/* Breadcrumb — hidden on mobile */}
            <div className="pdp-breadcrumb" style={{ padding: "10px 20px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto", fontSize: "11px", color: "#999", display: "flex", gap: "6px", alignItems: "center", letterSpacing: ".04em" }}>
                    <Link href="/" style={{ color: "#999" }}>Home</Link>
                    <span>/</span>
                    <Link href="/shop" style={{ color: "#999" }}>Shop</Link>
                    {breadcrumb && (
                        <>
                            <span>/</span>
                            <Link href={`/category/${breadcrumb.slug}`} style={{ color: "#999", textTransform: "capitalize" }}>{breadcrumb.name}</Link>
                        </>
                    )}
                    <span>/</span>
                    <span style={{ color: "#333" }}>{product.name}</span>
                </div>
            </div>

            <div className="pdp-wrap">
                {/* ── Thumbnail strip — desktop only ── */}
                <div className="pdp-thumb-col">
                    {images.map((img: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => setSelectedImageIndex(i)}
                            style={{
                                width: "60px", height: "76px",
                                position: "relative", overflow: "hidden",
                                border: i === selectedImageIndex ? "2px solid #000" : "1px solid #e0e0e0",
                                cursor: "pointer", background: "#f8f8f8",
                                padding: 0, flexShrink: 0,
                                transition: "border-color .15s",
                            }}
                            aria-label={`View image ${i + 1}`}
                        >
                            <Image src={img.src} alt="" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="60px" />
                        </button>
                    ))}
                </div>

                {/* ── Main image — full-bleed, swipeable on mobile ── */}
                <div
                    style={{ position: "relative", background: "#f5f5f5" }}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="pdp-main-img" style={{ position: "relative", width: "100%", aspectRatio: "3/4.5", maxHeight: "680px" }}>
                        {images[selectedImageIndex] && (
                            <Image
                                key={selectedImageIndex}
                                src={images[selectedImageIndex].src}
                                alt={images[selectedImageIndex].alt || product.name}
                                fill
                                style={{ objectFit: "cover", objectPosition: "center top" }}
                                loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                                sizes="(max-width: 900px) 100vw, 55vw"
                                priority={selectedImageIndex === 0}
                            />
                        )}

                        {/* Sale badge */}
                        {isOnSale && discount && (
                            <div style={{ position: "absolute", top: "16px", left: "16px", background: "#e8002d", color: "#fff", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 10px", zIndex: 2, borderRadius: "4px" }}>
                                {discount}% OFF
                            </div>
                        )}
                    </div>

                    {/* Mobile dot indicators */}
                    {images.length > 1 && (
                        <div className="pdp-mobile-dots" style={{ justifyContent: "center", gap: "6px", padding: "12px 0 4px" }}>
                            {images.map((_: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImageIndex(i)}
                                    aria-label={`Go to image ${i + 1}`}
                                    style={{
                                        width: i === selectedImageIndex ? "20px" : "6px",
                                        height: "6px", borderRadius: "3px",
                                        background: i === selectedImageIndex ? "#000" : "#ccc",
                                        border: "none", padding: 0, cursor: "pointer",
                                        transition: "all .25s ease",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Product info panel ── */}
                <div className="pdp-info-col">

                    {/* Name */}
                    <h1 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 600, lineHeight: 1.2, marginBottom: "12px", color: "#000", letterSpacing: "-.01em" }}>
                        {decodeHtmlEntities(product.name)}
                    </h1>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "22px", fontWeight: 700, color: isOnSale ? "#e8002d" : "#000", letterSpacing: "-.01em" }}>
                            {isGiftCard ? convert(selectedGiftAmount) : convert(toNaira(product.prices.price))}
                        </span>
                        {isOnSale && (
                            <span style={{ fontSize: "15px", fontWeight: 400, color: "#bbb", textDecoration: "line-through" }}>
                                {convert(toNaira(product.prices.regular_price))}
                            </span>
                        )}
                    </div>

                    {isGiftCard && (
                        <div style={{ marginBottom: "20px", padding: "16px", border: "1px solid #e8e8e8", borderRadius: "6px", background: "#fff" }}>
                            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "10px" }}>Select amount</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "12px" }}>
                                {[10000, 25000, 50000, 100000, 150000].map((value) => (
                                    <button key={value} type="button" onClick={() => { setGiftAmount(value); setGiftAmountInput(""); }} style={{ padding: "9px 12px", border: `1px solid ${!giftAmountInput && giftAmount === value ? "#7F0E12" : "#ddd"}`, background: !giftAmountInput && giftAmount === value ? "#fff7f7" : "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                                        ₦{value.toLocaleString("en-NG")}
                                    </button>
                                ))}
                            </div>
                            <label style={{ display: "block", fontSize: "11px", color: "#555", marginBottom: "5px" }}>Choose another amount</label>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "4px" }}>
                                <span style={{ paddingLeft: "10px", color: "#555" }}>₦</span>
                                <input inputMode="numeric" value={giftAmountInput} onChange={(e) => setGiftAmountInput(e.target.value.replace(/[^0-9]/g, ""))} placeholder="10,000 – 150,000" style={{ width: "100%", border: 0, padding: "9px 7px", outline: "none", fontSize: "13px" }} />
                            </div>
                            {!validGiftAmount && <p role="alert" style={{ color: "#7F0E12", fontSize: "11px", margin: "6px 0 0" }}>Enter an amount between ₦10,000 and ₦150,000.</p>}
                        </div>
                    )}

                    {/* Stars */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", gap: "1px" }}>
                            {"★★★★".split("").map((s, i) => <span key={i} style={{ color: "#000", fontSize: "13px" }}>{s}</span>)}
                            <span style={{ color: "#ddd", fontSize: "13px" }}>★</span>
                        </div>
                        <Link href="#reviews" style={{ fontSize: "12px", color: "#777", letterSpacing: ".04em" }}>
                            {product.review_count > 0 ? `${product.review_count} reviews` : "No reviews yet"}
                        </Link>
                    </div>

                    {/* Color selection */}
                    {colors.length > 0 && (
                        <div style={{ marginBottom: "20px" }}>
                            <span style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "10px" }}>
                                Color {selectedColor && <span style={{ color: "#777", fontWeight: 400 }}>— {selectedColor}</span>}
                            </span>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {colors.map((color) => {
                                    const isSelected = selectedColor === color;
                                    const swatch = getColorSwatch(color);

                                    return (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            title={color}
                                            aria-label={color}
                                            aria-pressed={isSelected}
                                            style={{
                                                width: "24px", height: "24px", // Reduced from 32px to 24px
                                                borderRadius: "50%",
                                                background: swatch.background,
                                                border: swatch.light ? "1.5px solid #d0d0d0" : "none",
                                                outline: isSelected ? "2px solid #000" : "1.5px solid #d0d0d0",
                                                outlineOffset: isSelected ? "3px" : "2px",
                                                cursor: "pointer",
                                                transition: "outline .15s",
                                                flexShrink: 0,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Size selection */}
                    {sizes.length > 0 && (
                        <div id="size-section" style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>
                                    Size {selectedSize && <span style={{ color: "#777", fontWeight: 400 }}>— {selectedSize}</span>}
                                </span>
                                <Link href="/size-guide" style={{ fontSize: "11px", color: "#777", letterSpacing: ".06em", textDecoration: "underline" }}>
                                    Size Guide
                                </Link>
                            </div>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        className="size-btn"
                                        title={stockForSelection(stock, size, selectedColor)?.available === false ? "Out of stock - select to get a restock alert" : size}
                                        aria-label={stockForSelection(stock, size, selectedColor)?.available === false ? `${size} - out of stock, notify me` : size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            textDecoration: stockForSelection(stock, size, selectedColor)?.available === false ? "line-through" : "none",
                                            opacity: stockForSelection(stock, size, selectedColor)?.available === false ? 0.55 : 1,
                                            minWidth: "32px", height: "28px", // Reduced from 52px x 44px to 32px x 28px
                                            padding: "0 8px", // Reduced from 0 14px to 0 8px
                                            border: selectedSize === size ? "2px solid #000" : "1px solid #e0e0e0",
                                            background: selectedSize === size ? "#000" : "#fff",
                                            color: selectedSize === size ? "#fff" : "#333",
                                            fontSize: "11px", fontWeight: 600, // Reduced from 13px to 11px
                                            cursor: "pointer",
                                            transition: "all .15s",
                                            letterSpacing: ".04em",
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {sizes.length > 0 && !selectedSize && (
                                <p style={{ fontSize: "11px", color: "#e8002d", marginTop: "6px", letterSpacing: ".04em" }}>Select a size to continue</p>
                            )}
                        </div>
                    )}

                    {soldOut && <p role="status" style={{ fontSize: "12px", marginBottom: "12px" }}>Out of stock</p>}
                    {stockLoading && !isGiftCard && !soldOut && <p role="status" style={{ fontSize: "12px", marginBottom: "12px" }}>Checking availability...</p>}
                    {stockError && !soldOut && <p role="alert" style={{ fontSize: "12px", marginBottom: "12px" }}>{stockError}</p>}

                    {/* Show inline restock signup when out of stock */}
                    {soldOut && (
                        <RestockSignup
                            key={selectionStock?.id || product.id}
                            productId={product.id}
                            variationId={currentStock?.variable ? selectionStock?.id : undefined}
                            selection={currentStock?.variable ? [selectedColor, selectedSize].filter(Boolean).join(" / ") : ""}
                            inline={true}
                        />
                    )}
                    {/* Add to Bag */}
                    <div ref={addToBagRef}>
                        {/* Pill Add to Bag */}
                        <button
                            onClick={handleAddToCart}
                            disabled={adding || (stockLoading && !isGiftCard && !soldOut)}
                            style={{
                                width: "100%",
                                padding: "16px 24px",
                                background: added ? "#1a7a3d" : soldOut ? "#666" : "#000",
                                color: "#fff",
                                border: "none",
                                borderRadius: "999px",
                                fontSize: "13px",
                                fontWeight: 600,
                                letterSpacing: ".08em",
                                textTransform: "uppercase",
                                cursor: adding || (stockLoading && !isGiftCard && !soldOut) ? "not-allowed" : "pointer",
                                transition: "background .3s",
                                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                            }}
                        >
                            {soldOut ? "OUT OF STOCK - NOTIFY ME" : stockLoading && !isGiftCard ? "Checking availability..." : added ? "✓ Added to Bag" : adding ? "Adding…" : "Add to Bag"}
                        </button>
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                        <button type="button" className="pdp-wishlist" onClick={handleWishlist}
                            aria-pressed={isWished} aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={isWished ? "currentColor" : "none"}
                                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                            </svg>
                            <span aria-live="polite">{isWished ? "Saved to wishlist" : "Add to wishlist"}</span>
                        </button>
                        {wishlistError && <p role="alert" style={{ fontSize: "12px", color: "#7f0e12", marginTop: "8px" }}>{wishlistError}</p>}
                    </div>

                    {productStatus !== "instock" && <p style={{ margin: "0 0 14px", fontSize: "12px", color: productStatus === "onbackorder" ? "#8a5a00" : "#7f0e12", fontWeight: 600 }}>
                        {stockStatusLabel(productStatus)}
                    </p>}

                    {/* Delivery note */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "24px", padding: "14px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
                        {/* Premium delivery truck icon */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                            <rect x="1" y="3" width="15" height="13" rx="1" />
                            <path d="M16 8h4l3 3v5h-7V8z" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#000", marginBottom: "2px" }}>
                                Lagos: same-day · Nationwide: 2–5 days
                            </p>
                            <p style={{ fontSize: "12px", color: "#888" }}>
                                Free shipping on orders over ₦150,000
                            </p>
                        </div>
                    </div>

                    {/* Accordions — with premium icons */}
                    <div style={{ border: "1px solid #ebebeb", borderRadius: "8px", overflow: "hidden" }}>
                        {[
                            {
                                title: "Product Details",
                                content: product.description || product.short_description || "No description available.",
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                        <line x1="7" y1="7" x2="7.01" y2="7" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Sizing & Fit",
                                content: "Model is 5'8\" wearing size S. We recommend sizing up if between sizes.",
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 3h18v4l-2 2 2 2v4l-2 2 2 2v4H3v-4l2-2-2-2V9l2-2-2-2V3z" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Shipping & Delivery",
                                content: "Orders dispatched same day if placed before 2pm. Lagos delivery in 1-2 hours.",
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                ),
                            },
                        ].map((item, idx, arr) => (
                            <AccordionItemWithIcon
                                key={item.title}
                                title={item.title}
                                content={item.content}
                                icon={item.icon}
                                isLast={idx === arr.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <section
                    aria-labelledby="related-heading"
                    className="related-section"
                    style={{ background: "#fff", borderTop: "1px solid #e8e8e8", padding: "48px 20px 60px" }}
                >
                    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                        <div className="related-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                            <h2
                                id="related-heading"
                                style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 600, letterSpacing: "-.01em", color: "#000" }}
                            >
                                You May Also Like
                            </h2>
                            {breadcrumb && (
                                <Link href={`/category/${breadcrumb.slug}`} style={{ fontSize: "11px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1px solid #000", paddingBottom: "1px" }}>
                                    Shop {breadcrumb.name}
                                </Link>
                            )}
                        </div>
                        <div className="grid-5 related-grid">
                            {related.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Sticky Add to Bag bar ── */}
            {/* Only shown after user scrolls past the main CTA */}
            <div
                role="region"
                aria-label="Quick add to bag"
                style={{
                    position: "fixed",
                    bottom: 0, left: 0, right: 0,
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderTop: "1px solid rgba(232, 232, 232, 0.6)",
                    padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    zIndex: 100,
                    boxShadow: "0 -4px 20px rgba(0,0,0,.07)",
                    transform: stickyVisible ? "translateY(0)" : "translateY(120%)",
                    transition: "transform .3s cubic-bezier(.4,0,.2,1)",
                    pointerEvents: stickyVisible ? "auto" : "none",
                }}
            >
                {/* Product thumbnail */}
                <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e8e8e8",
                    flexShrink: 0
                }}>
                    <Image
                        src={product.images[0]?.src || "/placeholder.jpg"}
                        alt={product.name}
                        width={48}
                        height={48}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>

                {/* Name + price — compact */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        fontSize: "13px", fontWeight: 600, color: "#000",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        lineHeight: 1.3,
                    }}>
                        {decodeHtmlEntities(product.name)}
                    </p>
                    <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                        {isGiftCard ? convert(selectedGiftAmount) : convert(toNaira(product.prices.price))}
                        {selectedSize ? ` · ${selectedSize}` : ""}
                        {selectedColor ? ` · ${selectedColor}` : ""}
                    </p>
                </div>

                {/* Single CTA — oval shaped button (hidden when sold out since restock signup is handled inline) */}
                {!soldOut && (
                    <button
                        onClick={() => {
                            if (sizes.length > 0 && !selectedSize) {
                                document.getElementById("size-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            } else {
                                handleAddToCart();
                            }
                        }}
                        disabled={adding || (stockLoading && !isGiftCard)}
                        style={{
                            flexShrink: 0,
                            padding: "14px 22px",
                            background: added ? "#1a7a3d" : "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: "25px", // Oval shape
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            cursor: adding ? "not-allowed" : "pointer",
                            transition: "background .25s",
                            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                            whiteSpace: "nowrap",
                            minWidth: "130px",
                            textAlign: "center",
                        }}
                    >
                        {stockLoading && !isGiftCard ? "Checking availability..." : added ? "✓ Added" : adding ? "Adding…" : (sizes.length > 0 && !selectedSize) ? "Select Size" : "Add to Bag"}
                    </button>
                )}
            </div>
        </>
    );
}
