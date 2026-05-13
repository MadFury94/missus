"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
            price: parseInt(product.prices.price),
            regularPrice: parseInt(product.prices.regular_price),
            image: product.images[0]?.src || "",
            size: selectedSize || undefined,
            color: undefined,
            quantity: 1
        });

        // Dispatch cart-updated event for navbar
        window.dispatchEvent(new Event("cart-updated"));

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

                        {/* Payment Options */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#000", marginBottom: "8px", flexWrap: "wrap" }}>
                            <span>or 4 payments of {formatPrice(String(Math.ceil(parseInt(product.prices.price) / 4)))} with</span>
                            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <span style={{ padding: "2px 6px", border: "1px solid #ddd", fontSize: "10px", fontWeight: 600 }}>ZIP</span>
                                <span style={{ padding: "2px 6px", fontSize: "10px", fontWeight: 600, background: "#00c853", color: "#fff" }}>Afterpay</span>
                                <span style={{ padding: "2px 6px", fontSize: "10px", fontWeight: 600, background: "#ffb3d9", color: "#000" }}>Klarna</span>
                            </div>
                        </div>

                        {/* Promo Code */}
                        <p style={{ fontSize: "13px", color: "#c00", fontWeight: 600, marginBottom: "12px" }}>
                            Get ₦20 Off ₦99+ Orders! Use Code: SPRING20
                        </p>
                    </div>

                    {/* Rating & Reviews */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                            {"★★★★".split("").map((s, i) => <span key={i} style={{ color: "#ffc107", fontSize: "14px" }}>{s}</span>)}
                            <span style={{ color: "#ddd", fontSize: "14px" }}>★</span>
                        </div>
                        <Link href="#reviews" style={{ fontSize: "13px", color: "#000", textDecoration: "underline", fontWeight: 600 }}>
                            ({product.review_count || 318})
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
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600 }}>Shipping to</span>
                            <button style={{ fontSize: "14px", fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                                10001
                            </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px", fontSize: "13px" }}>
                            <span>⏰</span>
                            <div>Get it by <strong>TUE, APR 7</strong> with 1-Day Shipping</div>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "13px" }}>
                            <span>📦</span>
                            <div>
                                <div><strong>3-7 Business Days</strong></div>
                                <div style={{ color: "#666" }}>Free shipping ₦75+</div>
                                <div style={{ color: "#666" }}>Estimated Delivery: <strong>Tuesday, Apr 14</strong></div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "10px" }}>
                            <span>📦</span>
                            <Link href="/returns" style={{ fontSize: "13px", fontWeight: 600, textDecoration: "underline", color: "#000" }}>
                                30-day Returns: Store Credit
                            </Link>
                        </div>
                    </div>

                    {/* Accordions */}
                    <div>
                        {[
                            { icon: "👔", title: "Product Details", content: product.description || product.short_description },
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
                                    justifyContent: "space-between"
                                }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span>{item.icon}</span>
                                        {item.title}
                                    </span>
                                    <span>▼</span>
                                </summary>
                                <div
                                    style={{ paddingBottom: "16px", fontSize: "13px", color: "#666", lineHeight: 1.6 }}
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            </details>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <div style={{ background: "#fff", borderTop: "1px solid #e8e8e8", padding: "32px 16px" }}>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: "20px", textAlign: "center" }}>
                        YOU MAY ALSO LIKE
                    </h2>
                    <div className="grid-5">
                        {related.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
