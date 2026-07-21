"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { formatPrice, getDiscount, getSizes, getColors, toNaira } from "@/lib/woocommerce";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard";

export default function ProductPageClient({ params, product, related }: {
    params: { slug: string },
    product: any,
    related: any[]
}) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [adding, setAdding] = useState(false);
    const [isWished, setIsWished] = useState(false);

    useEffect(() => {
        setIsWished(isInWishlist(product.id));
    }, [product.id]);

    const sizes = getSizes(product);
    const colors = getColors(product);
    const discount = getDiscount(product.prices.regular_price, product.prices.sale_price);
    const isOnSale = product.on_sale && product.prices.sale_price !== product.prices.regular_price;
    const breadcrumb = product.categories?.[0];

    const handleAddToCart = () => {
        if (sizes.length > 0 && !selectedSize) {
            alert("Please select a size");
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

        // Open cart drawer
        window.dispatchEvent(new Event("cart-updated"));
        window.dispatchEvent(new Event("open-cart-drawer"));

        setTimeout(() => {
            setAdding(false);
        }, 300);
    };

    return (
        <div>
            {/* Breadcrumb */}
            <div style={{ padding: "10px 16px", background: "#f8f8f8", borderBottom: "1px solid #e8e8e8" }}>
                <div style={{ fontSize: "11px", color: "#666", display: "flex", gap: "6px", alignItems: "center" }}>
                    <Link href="/" style={{ color: "#666" }}>Home</Link>
                    <span>/</span>
                    <Link href="/shop" style={{ color: "#666", textTransform: "uppercase" }}>SHOP ALL</Link>
                    {breadcrumb && (
                        <>
                            <span>/</span>
                            <Link href={`/category/${breadcrumb.slug}`} style={{ color: "#666", textTransform: "capitalize" }}>{breadcrumb.name}</Link>
                        </>
                    )}
                </div>
            </div>

            <div className="pdp-grid">
                {/* Thumbnail Strip - Left */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px" }}>
                    {product.images.slice(0, 8).map((img: any, i: number) => (
                        <div
                            key={i}
                            style={{
                                width: "60px",
                                height: "80px",
                                background: "#f5f5f5",
                                position: "relative",
                                overflow: "hidden",
                                border: i === selectedImageIndex ? "1px solid #000" : "1px solid #ddd",
                                cursor: "pointer",
                                transition: "border .15s"
                            }}
                            onMouseEnter={() => setSelectedImageIndex(i)}
                            onClick={() => setSelectedImageIndex(i)}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt || product.name}
                                fill
                                style={{ objectFit: "cover", objectPosition: "top" }}
                                sizes="60px"
                            />
                        </div>
                    ))}
                </div>

                {/* Main Image - Center */}
                <div style={{ background: "#f5f5f5", position: "relative", minHeight: "700px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {product.images[selectedImageIndex] && (
                        <Image
                            key={selectedImageIndex}
                            src={product.images[selectedImageIndex].src}
                            alt={product.images[selectedImageIndex].alt || product.name}
                            fill
                            style={{ objectFit: "contain" }}
                            loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                            preload={selectedImageIndex === 0}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    )}

                    {/* Badges */}
                    {(product.tags?.some((t: any) => t.slug === "whats-new") || isOnSale) && (
                        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 2 }}>
                            {product.tags?.some((t: any) => t.slug === "whats-new") && (
                                <span style={{ background: "#e8002d", color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", padding: "4px 8px" }}>NEW</span>
                            )}
                            {isOnSale && (
                                <span style={{ background: "#000", color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", padding: "4px 8px" }}>{discount}% OFF</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Product Info - Right */}
                <div style={{ padding: "16px", background: "#fff" }}>
                    {/* Product Name */}
                    <h1 style={{ fontSize: "18px", fontWeight: 400, lineHeight: 1.3, marginBottom: "12px", color: "#000" }}>
                        {product.name}
                    </h1>

                    {/* Price Section */}
                    <div style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "24px", fontWeight: 700, color: isOnSale ? "#e8002d" : "#000" }}>
                                {formatPrice(product.prices.price)}
                            </span>
                            {isOnSale && (
                                <>
                                    <span style={{ fontSize: "16px", fontWeight: 400, color: "#999", textDecoration: "line-through" }}>
                                        {formatPrice(product.prices.regular_price)}
                                    </span>
                                    <span style={{ fontSize: "13px", color: "#666" }}>Comp. Value</span>
                                </>
                            )}
                        </div>

                        {/* Payment note */}
                        <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>
                            Pay securely via Paystack — card, bank transfer or USSD.
                        </p>
                    </div>

                    {/* Rating & Reviews */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                            {"★★★★".split("").map((s, i) => <span key={i} style={{ color: "#ffc107", fontSize: "14px" }}>{s}</span>)}
                            <span style={{ color: "#ddd", fontSize: "14px" }}>★</span>
                        </div>
                        <Link href="#reviews" style={{ fontSize: "13px", color: "#000", textDecoration: "underline", fontWeight: 600 }}>
                            {product.review_count > 0 ? `(${product.review_count})` : "Be the first to review"}
                        </Link>
                        <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", textDecoration: "underline" }}>
                            ✨ See Summary
                        </button>
                    </div>

                    {/* Size Selection */}
                    {sizes.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                                    Size | <Link href="/size-guide" style={{ color: "#000", textDecoration: "underline" }}>View Size Guide</Link>
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            padding: "12px 20px",
                                            border: selectedSize === size ? "2px solid #000" : "1px solid #ddd",
                                            background: "#fff",
                                            color: "#000",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all .2s",
                                            minWidth: "60px",
                                            textAlign: "center",
                                            borderRadius: "4px"
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add to Bag & Wishlist */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            style={{
                                flex: 1,
                                padding: "16px",
                                background: adding ? "#666" : "#000",
                                color: "#fff",
                                border: "none",
                                fontSize: "15px",
                                fontWeight: 700,
                                cursor: adding ? "not-allowed" : "pointer",
                                borderRadius: "50px",
                                transition: "background .2s",
                                opacity: adding ? 0.7 : 1
                            }}
                        >
                            {adding ? "Adding..." : "Add to Bag"}
                        </button>
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
                            style={{
                                width: "56px",
                                height: "56px",
                                background: "#fff",
                                border: "2px solid #000",
                                borderRadius: "50%",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={isWished ? "#e8002d" : "none"} stroke={isWished ? "#e8002d" : "#000"} strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    </div>

                    {/* Shipping Info */}
                    <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e8e8e8" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px", fontSize: "13px" }}>
                            <span>⚡</span>
                            <div><strong>Lagos: 1–2 Hours</strong> — Express delivery available</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px", fontSize: "13px" }}>
                            <span>📦</span>
                            <div>
                                <div><strong>Nationwide: 2–5 Business Days</strong></div>
                                <div style={{ color: "#666" }}>Free shipping on orders ₦150,000+</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "10px" }}>
                            <span>🔄</span>
                            <Link href="/returns" style={{ fontSize: "13px", fontWeight: 600, textDecoration: "underline", color: "#000" }}>
                                7-day Returns Policy
                            </Link>
                        </div>
                    </div>

                    {/* Accordions */}
                    <div>
                        {[
                            { icon: "👔", title: "Product Details", content: DOMPurify.sanitize(product.description || product.short_description) },
                            { icon: "✓", title: "Why You'll Love It", content: "Premium quality fabric with perfect fit." },
                            { icon: "📋", title: "Material", content: "100% Premium Cotton." }
                        ].map((item) => (
                            <details key={item.title} style={{ borderBottom: "1px solid #e8e8e8" }}>
                                <summary style={{
                                    padding: "16px 0",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    listStyle: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    outline: "none",
                                }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span aria-hidden="true">{item.icon}</span>
                                        {item.title}
                                    </span>
                                    <span aria-hidden="true">▼</span>
                                </summary>
                                <div
                                    style={{ paddingBottom: "16px", fontSize: "13px", color: "#666", lineHeight: 1.6 }}
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            </details>
                        ))}
                        <style>{`
                        details > summary { list-style: none; }
                        details > summary::-webkit-details-marker { display: none; }
                        details > summary::marker { display: none; }
                        details > summary:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
                    `}</style>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <section aria-labelledby="related-heading" style={{ background: "#fafafa", borderTop: "1px solid #e8e8e8", padding: "48px 20px 60px" }}>
                    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
                        {/* Section header */}
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#e8002d", marginBottom: "4px" }}>
                                    Complete the Look
                                </p>
                                <h2
                                    id="related-heading"
                                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", color: "#000", lineHeight: 1 }}
                                >
                                    You May Also Like
                                </h2>
                            </div>
                            {breadcrumb && (
                                <Link
                                    href={`/category/${breadcrumb.slug}`}
                                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "1px" }}
                                >
                                    Shop {breadcrumb.name} →
                                </Link>
                            )}
                        </div>

                        <div className="grid-5">
                            {related.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
