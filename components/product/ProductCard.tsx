"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { StoreProduct } from "@/lib/woocommerce";
import { formatPrice, getDiscount, getProductImage, getSizes } from "@/lib/woocommerce";

export default function ProductCard({ product }: { product: StoreProduct }) {
    const [hovered, setHovered] = useState(false);

    const isNew = product.tags?.some((t) => t.slug === "new" || t.slug === "whats-new");
    const isDeal = product.on_sale;
    const discount = getDiscount(product.prices.regular_price, product.prices.sale_price);
    const sizes = getSizes(product);
    const img1 = getProductImage(product, 0);
    const img2 = getProductImage(product, 1);

    const badgeLabel = isDeal && discount ? `${discount}% OFF` : isDeal ? "DEAL" : isNew ? "NEW" : null;
    const badgeBg = isDeal ? "#e8002d" : "#000";

    const priceNaira = formatPrice(product.prices.price);
    const regularNaira = formatPrice(product.prices.regular_price);
    const isOnSale = product.on_sale && product.prices.sale_price !== product.prices.regular_price;

    return (
        <div
            style={{ cursor: "pointer", position: "relative", background: "#fff" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Link href={`/product/${product.slug}`} style={{ display: "block", position: "relative", aspectRatio: "2/3", overflow: "hidden", background: "#f0ece8" }}>
                {img1 ? (
                    <>
                        <Image
                            src={img1}
                            alt={product.name}
                            fill
                            style={{ objectFit: "cover", objectPosition: "top", opacity: hovered && img2 ? 0 : 1, transition: "opacity .3s" }}
                            sizes="(max-width: 640px) 50vw, 20vw"
                        />
                        {img2 && (
                            <Image
                                src={img2}
                                alt={product.name}
                                fill
                                style={{ objectFit: "cover", objectPosition: "top", opacity: hovered ? 1 : 0, transition: "opacity .3s" }}
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

                <button
                    onClick={(e) => e.preventDefault()}
                    style={{ position: "absolute", top: "8px", right: "8px", width: "30px", height: "30px", background: "rgba(255,255,255,.85)", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity .2s", zIndex: 2, cursor: "pointer" }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </button>

                <button
                    onClick={(e) => e.preventDefault()}
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "center", padding: "10px", opacity: hovered ? 1 : 0, transition: "opacity .2s", zIndex: 2, border: "none", width: "100%", cursor: "pointer" }}>
                    Add to Bag
                </button>
            </Link>

            <div style={{ padding: "7px 0 10px" }}>
                <p style={{ fontSize: "12px", fontWeight: 400, color: "#111", lineHeight: 1.35, marginBottom: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {product.name}
                </p>

                {/* Promo Text */}
                <p style={{ fontSize: "11px", color: "#666", marginBottom: "6px" }}>
                    Get ₦20 Off ₦99+ Orders! Use Code: <span style={{ fontWeight: 600, color: "#000" }}>SPRING20</span>
                </p>

                <p style={{ fontSize: "12px", fontWeight: 700, color: "#000" }}>
                    {isOnSale && (
                        <span style={{ color: "#767676", fontWeight: 400, textDecoration: "line-through", marginRight: "4px" }}>{regularNaira}</span>
                    )}
                    <span style={{ color: isOnSale ? "#e8002d" : "#000" }}>{priceNaira}</span>
                </p>

                {/* Color Swatches */}
                {product.attributes && product.attributes.find(a => a.name.toLowerCase() === 'color')?.terms && (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "6px" }}>
                        {product.attributes.find(a => a.name.toLowerCase() === 'color')!.terms.slice(0, 5).map((color, i) => (
                            <div
                                key={i}
                                style={{
                                    width: "16px",
                                    height: "16px",
                                    borderRadius: "50%",
                                    border: "1px solid #ddd",
                                    background: color.name.toLowerCase() === 'white' ? '#fff' :
                                        color.name.toLowerCase() === 'black' ? '#000' :
                                            color.name.toLowerCase() === 'red' ? '#e8002d' :
                                                color.name.toLowerCase() === 'blue' ? '#0066cc' :
                                                    color.name.toLowerCase() === 'green' ? '#00a651' :
                                                        color.name.toLowerCase() === 'yellow' ? '#ffd700' :
                                                            color.name.toLowerCase() === 'pink' ? '#ff69b4' :
                                                                color.name.toLowerCase() === 'brown' ? '#8b4513' :
                                                                    color.name.toLowerCase() === 'gray' || color.name.toLowerCase() === 'grey' ? '#808080' :
                                                                        '#ccc',
                                    cursor: "pointer"
                                }}
                                title={color.name}
                            />
                        ))}
                        {product.attributes.find(a => a.name.toLowerCase() === 'color')!.terms.length > 5 && (
                            <span style={{ fontSize: "11px", color: "#666", fontWeight: 600 }}>
                                +{product.attributes.find(a => a.name.toLowerCase() === 'color')!.terms.length - 5}
                            </span>
                        )}
                    </div>
                )}

                {sizes.length > 0 && (
                    <div style={{ display: "flex", gap: "3px", marginTop: "5px", flexWrap: "wrap" }}>
                        {sizes.slice(0, 5).map((s) => (
                            <span key={s} style={{ fontSize: "10px", fontWeight: 500, border: "1px solid #e0e0e0", padding: "2px 5px", color: "#555" }}>{s}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
