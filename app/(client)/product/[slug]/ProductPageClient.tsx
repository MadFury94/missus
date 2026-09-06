"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { formatPrice, getDiscount, getSizes, getColors, toNaira } from "@/lib/woocommerce";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard";
import { useCurrency } from "@/lib/currency";

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
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [isWished, setIsWished] = useState(false);
    const [stickyVisible, setStickyVisible] = useState(false);
    const addToBagRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    useEffect(() => {
        setIsWished(isInWishlist(product.id));
    }, [product.id]);

    // Pre-select first color if available
    useEffect(() => {
        const colors = getColors(product);
        if (colors.length > 0) setSelectedColor(colors[0]);
    }, [product]);

    // Show sticky bar when main CTA scrolls out of view
    useEffect(() => {
        const el = addToBagRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setStickyVisible(!entry.isIntersecting),
            { threshold: 0, rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { convert } = useCurrency();
    const sizes = getSizes(product);
    const colors = getColors(product);
    const discount = getDiscount(product.prices.regular_price, product.prices.sale_price);
    const isOnSale = product.on_sale && product.prices.sale_price !== product.prices.regular_price;
    const breadcrumb = product.categories?.[0];
    const images = product.images?.slice(0, 8) ?? [];

    const handleAddToCart = () => {
        if (sizes.length > 0 && !selectedSize) {
            // Scroll to size section instead of alert
            document.getElementById("size-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setAdding(true);
        addToCart({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: toNaira(product.prices.price),
            regularPrice: toNaira(product.prices.regular_price),
            image: product.images[0]?.src || "",
            size: selectedSize || undefined,
            color: selectedColor || undefined,
            quantity: 1
        });
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
                    .pdp-wrap { grid-template-columns: 1fr; }
                    .pdp-thumb-col { display: none; }
                    .pdp-info-col { padding: 20px 16px 40px; position: static; }
                    .pdp-breadcrumb { display: none; }
                    .pdp-mobile-dots { display: flex; }
                    .pdp-main-img { min-height: 420px !important; }
                }

                /* Size button focus ring */
                .size-btn:focus-visible { outline: 2px solid #000; outline-offset: 2px; }

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
                    <div className="pdp-main-img" style={{ position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: "600px" }}>
                        {images[selectedImageIndex] && (
                            <Image
                                key={selectedImageIndex}
                                src={images[selectedImageIndex].src}
                                alt={images[selectedImageIndex].alt || product.name}
                                fill
                                style={{ objectFit: "cover", objectPosition: "center 20%" }}
                                loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                                sizes="(max-width: 900px) 100vw, 55vw"
                                priority={selectedImageIndex === 0}
                            />
                        )}

                        {/* Sale badge */}
                        {isOnSale && discount && (
                            <div style={{ position: "absolute", top: "16px", left: "16px", background: "#e8002d", color: "#fff", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 10px", zIndex: 2 }}>
                                {discount}% OFF
                            </div>
                        )}

                        {/* Wishlist — always visible on mobile */}
                        <button
                            onClick={() => {
                                const newState = toggleWishlist({
                                    productId: product.id,
                                    name: product.name,
                                    price: toNaira(product.prices.price),
                                    image: product.images[0]?.src || "",
                                    slug: product.slug,
                                });
                                setIsWished(newState);
                            }}
                            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                            style={{
                                position: "absolute", top: "14px", right: "14px", zIndex: 3,
                                width: "38px", height: "38px", borderRadius: "50%",
                                background: "rgba(255,255,255,.9)", border: "none",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", backdropFilter: "blur(4px)",
                            }}
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill={isWished ? "#e8002d" : "none"} stroke={isWished ? "#e8002d" : "#000"} strokeWidth="1.8" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
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
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "22px", fontWeight: 700, color: isOnSale ? "#e8002d" : "#000", letterSpacing: "-.01em" }}>
                            {convert(parseInt(product.prices.price))}
                        </span>
                        {isOnSale && (
                            <span style={{ fontSize: "15px", fontWeight: 400, color: "#bbb", textDecoration: "line-through" }}>
                                {convert(parseInt(product.prices.regular_price))}
                            </span>
                        )}
                    </div>

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
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            minWidth: "52px", height: "44px",
                                            padding: "0 14px",
                                            border: selectedSize === size ? "2px solid #000" : "1px solid #e0e0e0",
                                            background: selectedSize === size ? "#000" : "#fff",
                                            color: selectedSize === size ? "#fff" : "#333",
                                            fontSize: "13px", fontWeight: 600,
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

                    {/* Color selection */}
                    {colors.length > 0 && (
                        <div style={{ marginBottom: "20px" }}>
                            <span style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "10px" }}>
                                Color {selectedColor && <span style={{ color: "#777", fontWeight: 400 }}>— {selectedColor}</span>}
                            </span>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {colors.map((color) => {
                                    const isSelected = selectedColor === color;
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            title={color}
                                            aria-label={color}
                                            aria-pressed={isSelected}
                                            style={{
                                                width: "32px", height: "32px",
                                                borderRadius: "50%",
                                                background: color.toLowerCase(),
                                                border: "none",
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

                    {/* Add to Bag + Wishlist */}
                    <div ref={addToBagRef} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                        {/* Pill Add to Bag */}
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            style={{
                                flex: 1,
                                padding: "16px 24px",
                                background: added ? "#1a7a3d" : "#000",
                                color: "#fff",
                                border: "none",
                                borderRadius: "999px",
                                fontSize: "13px",
                                fontWeight: 600,
                                letterSpacing: ".08em",
                                textTransform: "uppercase",
                                cursor: adding ? "not-allowed" : "pointer",
                                transition: "background .3s",
                                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                            }}
                        >
                            {added ? "✓ Added to Bag" : adding ? "Adding…" : "Add to Bag"}
                        </button>
                        {/* Circular wishlist button */}
                        <button
                            onClick={() => {
                                const newState = toggleWishlist({
                                    productId: product.id,
                                    name: product.name,
                                    price: toNaira(product.prices.price),
                                    image: product.images[0]?.src || "",
                                    slug: product.slug,
                                });
                                setIsWished(newState);
                            }}
                            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                            style={{
                                width: "52px", height: "52px", borderRadius: "50%",
                                background: "#fff",
                                border: `1.5px solid ${isWished ? "#000" : "#d0d0d0"}`,
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                transition: "border-color .2s",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={isWished ? "#000" : "none"} stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    </div>

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
                                title: "Shipping & Returns",
                                content: "Free returns within 7 days. Orders dispatched same day if placed before 2pm.",
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="1 4 1 10 7 10" />
                                        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
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
                                    Shop {breadcrumb.name} →
                                </Link>
                            )}
                        </div>
                        <div className="grid-5 related-grid">
                            {related.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Sticky Add to Bag bar — glassmorphism style ── */}
            <div
                role="region"
                aria-label="Quick add to bag"
                style={{
                    position: "fixed",
                    bottom: 0, left: 0, right: 0,
                    background: "rgba(255,255,255,0.72)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderTop: "1px solid rgba(255,255,255,0.4)",
                    padding: "12px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    zIndex: 100,
                    boxShadow: "0 -2px 24px rgba(0,0,0,.08)",
                    transform: stickyVisible ? "translateY(0)" : "translateY(110%)",
                    transition: "transform .3s cubic-bezier(.4,0,.2,1)",
                }}
            >
                {/* Thumbnail */}
                {product.images?.[0]?.src && (
                    <div style={{ width: "62px", height: "78px", flexShrink: 0, position: "relative", overflow: "hidden", borderRadius: "4px", background: "#f5f5f5" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={product.images[0].src}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                        />
                    </div>
                )}

                {/* Product info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>
                        {product.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "#666", lineHeight: 1.4 }}>
                        {selectedSize ? `Size: ${selectedSize}` : sizes.length > 0 ? "No size selected" : ""}
                        {selectedSize && selectedColor ? " · " : ""}
                        {selectedColor ? `Color: ${selectedColor}` : ""}
                        {(selectedSize || selectedColor) ? " · " : ""}
                        {convert(parseInt(product.prices.price))}
                    </p>
                </div>

                {/* Edit choices — scroll back up */}
                {sizes.length > 0 && !selectedSize && (
                    <button
                        onClick={() => {
                            document.getElementById("size-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        style={{
                            flexShrink: 0,
                            background: "none",
                            border: "1px solid rgba(0,0,0,.2)",
                            borderRadius: "999px",
                            padding: "8px 14px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#000",
                            cursor: "pointer",
                            fontFamily: "var(--font-body)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Select Size ↑
                    </button>
                )}

                {/* Add to Bag — pill */}
                <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    style={{
                        flexShrink: 0,
                        padding: "13px 28px",
                        background: added ? "#1a7a3d" : "#000",
                        color: "#fff",
                        border: "none",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        cursor: adding ? "not-allowed" : "pointer",
                        transition: "background .3s",
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {added ? "✓ Added" : adding ? "Adding…" : "Add to Bag"}
                </button>
            </div>
        </>
    );
}
