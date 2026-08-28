"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { formatPrice, getDiscount, getSizes, getColors, toNaira } from "@/lib/woocommerce";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard";

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

export default function ProductPageClient({ params, product, related }: {
    params: { slug: string },
    product: any,
    related: any[]
}) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [isWished, setIsWished] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    useEffect(() => {
        setIsWished(isInWishlist(product.id));
    }, [product.id]);

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
            color: undefined,
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
                    grid-template-columns: 60px 1fr 440px;
                    gap: 0;
                    align-items: start;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .pdp-thumb-col { display: flex; flex-direction: column; gap: 6px; padding: 12px 8px 12px 0; }
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
                    <div className="pdp-main-img" style={{ position: "relative", width: "100%", aspectRatio: "3/4", minHeight: "560px" }}>
                        {images[selectedImageIndex] && (
                            <Image
                                key={selectedImageIndex}
                                src={images[selectedImageIndex].src}
                                alt={images[selectedImageIndex].alt || product.name}
                                fill
                                style={{ objectFit: "cover", objectPosition: "top center" }}
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
                            {formatPrice(product.prices.price)}
                        </span>
                        {isOnSale && (
                            <span style={{ fontSize: "15px", fontWeight: 400, color: "#bbb", textDecoration: "line-through" }}>
                                {formatPrice(product.prices.regular_price)}
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

                    {/* Add to Bag — full width, sharp, no pill */}
                    <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        style={{
                            width: "100%",
                            padding: "16px",
                            background: added ? "#1a7a3d" : "#000",
                            color: "#fff",
                            border: "none",
                            fontSize: "13px",
                            fontWeight: 600,
                            letterSpacing: ".1em",
                            textTransform: "uppercase",
                            cursor: adding ? "not-allowed" : "pointer",
                            transition: "background .3s",
                            marginBottom: "10px",
                            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        }}
                    >
                        {added ? "✓ Added to Bag" : adding ? "Adding…" : "Add to Bag"}
                    </button>

                    {/* Payment note */}
                    <p style={{ fontSize: "11px", color: "#aaa", letterSpacing: ".04em", marginBottom: "24px", textAlign: "center" }}>
                        Secure checkout via Paystack · Card, bank transfer, USSD
                    </p>

                    {/* Delivery info — inline, compact */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px", padding: "16px", background: "#f8f8f8" }}>
                        {[
                            { icon: "⚡", label: "Lagos: 1–2 hrs", sub: "Express available" },
                            { icon: "📦", label: "Nationwide: 2–5 days", sub: "Free over ₦150k" },
                            { icon: "🔄", label: "7-day Returns", sub: "Easy & free" },
                            { icon: "🔒", label: "Secure Payment", sub: "100% encrypted" },
                        ].map((item) => (
                            <div key={item.label} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "14px", lineHeight: 1 }}>{item.icon}</span>
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#000", lineHeight: 1.3, letterSpacing: ".02em" }}>{item.label}</p>
                                    <p style={{ fontSize: "11px", color: "#999", lineHeight: 1.3 }}>{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Accordions */}
                    <div>
                        <AccordionItem
                            title="Product Details"
                            content={product.description || product.short_description || "No description available."}
                        />
                        <AccordionItem title="Sizing & Fit" content="Model is 5'8&quot; wearing size S. We recommend sizing up if between sizes." />
                        <AccordionItem title="Shipping & Returns" content="Free returns within 7 days. Orders dispatched same day if placed before 2pm." />
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
        </>
    );
}
