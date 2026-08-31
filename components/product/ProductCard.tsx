"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "@/lib/woocommerce";
import { formatPrice, getDiscount, getProductImage, getSizes, toNaira } from "@/lib/woocommerce";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

// CSS colour name → hex. Falls back to the name itself (browsers handle many CSS named colours).
function colourNameToHex(name: string): string {
    const n = name.toLowerCase().trim();
    const MAP: Record<string, string> = {
        white: "#fff",
        black: "#111",
        red: "#630D13",
        blue: "#0066cc",
        "navy blue": "#001f5b",
        navy: "#001f5b",
        green: "#00a651",
        yellow: "#ffd700",
        pink: "#ff69b4",
        "hot pink": "#ff1493",
        "baby pink": "#f4b8c8",
        brown: "#8b4513",
        tan: "#d2b48c",
        camel: "#c19a6b",
        gray: "#808080",
        grey: "#808080",
        "light grey": "#d3d3d3",
        "charcoal grey": "#36454f",
        orange: "#ff7a00",
        purple: "#800080",
        lavender: "#967bb6",
        nude: "#e8c9a0",
        beige: "#f5f0e8",
        cream: "#fffdd0",
        ivory: "#fffff0",
        off_white: "#faf9f6",
        "off-white": "#faf9f6",
        coral: "#ff6b6b",
        burgundy: "#800020",
        wine: "#722f37",
        maroon: "#800000",
        teal: "#008080",
        mint: "#98ff98",
        "sage green": "#8b9e77",
        khaki: "#c3b091",
        gold: "#ffd700",
        silver: "#c0c0c0",
        rose: "#e75480",
        "rose gold": "#b76e79",
        olive: "#808000",
        rust: "#b7410e",
        mustard: "#ffdb58",
    };
    return MAP[n] ?? n; // pass unknown names directly — browser will resolve known CSS colours
}

export default function ProductCard({ product }: { product: StoreProduct }) {
    const router = useRouter();
    const [hovered, setHovered] = useState(false);
    const [isWished, setIsWished] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        setIsWished(isInWishlist(product.id));
    }, [product.id]);

    const isNew = product.tags?.some((t) => t.slug === "new" || t.slug === "whats-new");
    const isDeal = product.on_sale;
    const discount = getDiscount(product.prices.regular_price, product.prices.sale_price);
    const sizes = getSizes(product);
    const img1 = getProductImage(product, 0);
    const img2 = getProductImage(product, 1);

    const badgeLabel = isDeal && discount ? `${discount}% OFF` : isDeal ? "DEAL" : isNew ? "NEW" : null;
    const badgeBg = isDeal ? "#630D13" : "#000";

    const { convert } = useCurrency();
    const priceNaira = convert(parseInt(product.prices.price));
    const regularNaira = convert(parseInt(product.prices.regular_price));
    const isOnSale = product.on_sale && product.prices.sale_price !== product.prices.regular_price;

    const colourAttr = product.attributes?.find(
        (a) => a.name.toLowerCase() === "color" || a.name.toLowerCase() === "colour"
    );
    const colourTerms = colourAttr?.terms ?? [];

    const handleAddToBag = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (sizes.length > 0) {
            router.push(`/product/${product.slug}`);
            return;
        }
        setAdding(true);
        addToCart({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: toNaira(product.prices.price),
            regularPrice: isOnSale ? toNaira(product.prices.regular_price) : toNaira(product.prices.price),
            quantity: 1,
            image: img1,
            size: undefined,
            color: undefined,
        });
        window.dispatchEvent(new Event("cart-updated"));
        window.dispatchEvent(new Event("open-cart-drawer"));
        setTimeout(() => setAdding(false), 1000);
    };

    return (
        <div
            style={{ cursor: "pointer", position: "relative", background: "#fff" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Link
                href={`/product/${product.slug}`}
                aria-label={product.name}
                style={{ display: "block", position: "relative", aspectRatio: "2/3", overflow: "hidden", background: "#f5f5f5" }}
            >
                {img1 ? (
                    <>
                        <Image
                            src={img1}
                            alt={product.name}
                            fill
                            style={{ objectFit: "cover", objectPosition: "top center", opacity: hovered && img2 ? 0 : 1, transition: "opacity .3s" }}
                            sizes="(max-width: 640px) 50vw, 20vw"
                        />
                        {img2 && (
                            <Image
                                src={img2}
                                alt=""
                                aria-hidden="true"
                                fill
                                style={{ objectFit: "cover", objectPosition: "top center", opacity: hovered ? 1 : 0, transition: "opacity .3s" }}
                                sizes="(max-width: 640px) 50vw, 20vw"
                            />
                        )}
                    </>
                ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(0,0,0,.25)", textAlign: "center", padding: "0 12px", lineHeight: 1.5 }}>
                        {product.name}
                    </div>
                )}

                {badgeLabel && (
                    <span style={{ position: "absolute", top: "8px", left: "8px", background: badgeBg, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "3px 8px", zIndex: 2 }}>
                        {badgeLabel}
                    </span>
                )}

                {/* Wishlist button */}
                <button
                    aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newState = toggleWishlist({
                            productId: product.id,
                            name: product.name,
                            price: toNaira(product.prices.price),
                            image: img1,
                            slug: product.slug,
                        });
                        setIsWished(newState);
                    }}
                    style={{
                        position: "absolute", top: "8px", right: "8px",
                        width: "30px", height: "30px",
                        background: "rgba(255,255,255,.85)", border: "none", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: hovered ? 1 : 0,
                        transition: "opacity .2s",
                        zIndex: 2, cursor: "pointer",
                    }}
                    className="product-wishlist-btn"
                    onFocus={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.outline = "2px solid #000"; }}
                    onBlur={(e) => { e.currentTarget.style.outline = "none"; if (!hovered) e.currentTarget.style.opacity = "0"; }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={isWished ? "#630D13" : "none"} stroke={isWished ? "#630D13" : "#000"} strokeWidth="1.8" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {/* Floating bag button — bottom right, FashionNova style */}
                <button
                    aria-label={`Add ${product.name} to bag`}
                    onClick={handleAddToBag}
                    disabled={adding}
                    className="product-quick-add"
                    style={{
                        position: "absolute", bottom: "10px", right: "10px",
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: adding ? "#2d7a2d" : "#fff",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", zIndex: 3,
                        opacity: hovered ? 1 : 0,
                        transition: "opacity .2s ease, background .2s ease",
                    }}
                >
                    {adding ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#111" aria-hidden="true">
                            <path d="M19.5 8.25H16.5V7.75C16.5 6.55653 16.0259 5.41193 15.182 4.56802C14.3381 3.72411 13.1935 3.25 12 3.25C10.8065 3.25 9.66193 3.72411 8.81802 4.56802C7.97411 5.41193 7.5 6.55653 7.5 7.75V8.25H4.5C4.16848 8.25 3.85054 8.3817 3.61612 8.61612C3.3817 8.85054 3.25 9.16848 3.25 9.5V18C3.25 18.7293 3.53973 19.4288 4.05546 19.9445C4.57118 20.4603 5.27065 20.75 6 20.75H18C18.7293 20.75 19.4288 20.4603 19.9445 19.9445C20.4603 19.4288 20.75 18.7293 20.75 18V9.5C20.75 9.16848 20.6183 8.85054 20.3839 8.61612C20.1495 8.3817 19.8315 8.25 19.5 8.25ZM9 7.75C9 6.95435 9.31607 6.19129 9.87868 5.62868C10.4413 5.06607 11.2044 4.75 12 4.75C12.7956 4.75 13.5587 5.06607 14.1213 5.62868C14.6839 6.19129 15 6.95435 15 7.75V8.25H9V7.75ZM19.25 18C19.25 18.3315 19.1183 18.6495 18.8839 18.8839C18.6495 19.1183 18.3315 19.25 18 19.25H6C5.66848 19.25 5.35054 19.1183 5.11612 18.8839C4.8817 18.6495 4.75 18.3315 4.75 18V9.75H7.5V12C7.5 12.1989 7.57902 12.3897 7.71967 12.5303C7.86032 12.671 8.05109 12.75 8.25 12.75C8.44891 12.75 8.63968 12.671 8.78033 12.5303C8.92098 12.3897 9 12.1989 9 12V9.75H15V12C15 12.1989 15.079 12.3897 15.2197 12.5303C15.3603 12.671 15.5511 12.75 15.75 12.75C15.9489 12.75 16.1397 12.671 16.2803 12.5303C16.421 12.3897 16.5 12.1989 16.5 12V9.75H19.25V18Z" />
                        </svg>
                    )}
                </button>
            </Link>

            {/* Product info */}
            <div className="product-card-info" style={{ padding: "8px 8px 12px" }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#111", lineHeight: 1.4, marginBottom: "5px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textAlign: "left" }}>
                    {product.name}
                </p>

                <p style={{ fontSize: "14px", fontWeight: 700, color: "#000", textAlign: "left", marginBottom: "4px" }}>
                    {isOnSale && (
                        <span style={{ color: "#999", fontWeight: 400, textDecoration: "line-through", marginRight: "6px", fontSize: "12px" }}>{regularNaira}</span>
                    )}
                    <span style={{ color: isOnSale ? "#630D13" : "#000" }}>{priceNaira}</span>
                </p>

                {/* Colour swatches */}
                {colourTerms.length > 0 && (
                    <div style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "4px" }}>
                        {colourTerms.slice(0, 5).map((colour) => {
                            const hex = colourNameToHex(colour.name);
                            const isLight = ["#fff", "#fffff0", "#fffdd0", "#faf9f6"].includes(hex.toLowerCase());
                            return (
                                <button
                                    key={colour.id}
                                    title={colour.name}
                                    aria-label={`View ${colour.name} colour`}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/product/${product.slug}`); }}
                                    style={{
                                        width: "14px", height: "14px", borderRadius: "50%",
                                        border: `1.5px solid ${isLight ? "#ccc" : "transparent"}`,
                                        background: hex,
                                        cursor: "pointer", padding: 0, flexShrink: 0,
                                    }}
                                />
                            );
                        })}
                        {colourTerms.length > 5 && (
                            <span style={{ fontSize: "11px", color: "#666", fontWeight: 600 }}>+{colourTerms.length - 5}</span>
                        )}
                    </div>
                )}

                {/* Size pills — hidden on mobile */}
                {sizes.length > 0 && (
                    <div className="product-sizes" style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                        {sizes.slice(0, 4).map((s) => (
                            <span
                                key={s}
                                style={{ fontSize: "11px", fontWeight: 500, border: "1px solid #e0e0e0", padding: "3px 7px", color: "#777", background: "#fff" }}
                            >
                                {s}
                            </span>
                        ))}
                        {sizes.length > 4 && <span style={{ fontSize: "11px", color: "#aaa", alignSelf: "center" }}>+{sizes.length - 4}</span>}
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .product-wishlist-btn { opacity: 1 !important; }
                    .product-sizes { display: none !important; }
                    .product-card-info { padding: 6px 6px 10px !important; }
                    .product-card-info p:first-child { font-size: 12px !important; margin-bottom: 3px !important; -webkit-line-clamp: 1 !important; }
                    .product-card-info p:nth-child(2) { font-size: 13px !important; }
                    .product-quick-add { opacity: 1 !important; }
                }
            `}</style>
        </div>
    );
}
