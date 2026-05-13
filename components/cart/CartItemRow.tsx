"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/woocommerce";
import type { CartItem } from "@/types";

interface Props {
    item: CartItem;
    onUpdateQty: (productId: number, size: string | undefined, delta: number) => void;
    onRemove: (productId: number, size?: string) => void;
}

export default function CartItemRow({ item, onUpdateQty, onRemove }: Props) {
    const [removing, setRemoving] = useState(false);

    function handleRemove() {
        setRemoving(true);
        setTimeout(() => onRemove(item.productId, item.size), 280);
    }

    const lineTotal = item.price * item.quantity;
    const hasDiscount = item.regularPrice && item.regularPrice > item.price;

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr",
            gap: "16px",
            padding: removing ? "0" : "20px 0",
            borderBottom: removing ? "none" : "1px solid #e8e8e8",
            position: "relative",
            opacity: removing ? 0 : 1,
            transform: removing ? "translateX(20px)" : "none",
            maxHeight: removing ? "0" : "500px",
            overflow: removing ? "hidden" : "visible",
            transition: "opacity .28s ease, transform .28s ease, max-height .3s ease .28s, padding .3s ease .28s",
        }}>
            {/* Image */}
            <Link href={`/product/${item.slug}`} style={{ display: "block", width: "90px", height: "120px", background: "#f0ece8", position: "relative", overflow: "hidden", flexShrink: 0, cursor: "pointer", textDecoration: "none" }}>
                {item.image ? (
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="90px" />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "9px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(0,0,0,.2)", textAlign: "center", padding: "8px", lineHeight: 1.5 }}>
                        {item.name}
                    </div>
                )}
            </Link>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* Top: name + price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div>
                        <Link href={`/product/${item.slug}`} style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "15px", fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "#000", lineHeight: 1.2, cursor: "pointer", textDecoration: "none", display: "block" }}>
                            {item.name}
                        </Link>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "8px" }}>
                            {item.size && (
                                <p style={{ fontSize: "12px", color: "#767676" }}>
                                    <strong style={{ color: "#000", fontWeight: 600 }}>Size:</strong> {item.size}
                                </p>
                            )}
                            {item.color && (
                                <p style={{ fontSize: "12px", color: "#767676" }}>
                                    <strong style={{ color: "#000", fontWeight: 600 }}>Color:</strong> {item.color}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {hasDiscount && (
                            <span style={{ display: "block", fontSize: "13px", color: "#aaa", textDecoration: "line-through", fontWeight: 400 }}>
                                {formatPrice(item.regularPrice! * item.quantity)}
                            </span>
                        )}
                        <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 700, color: hasDiscount ? "#e8002d" : "#000" }}>
                            {formatPrice(lineTotal)}
                        </span>
                    </div>
                </div>

                {/* Bottom: qty + actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
                    {/* Qty control */}
                    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", height: "34px" }}>
                        <button
                            onClick={() => onUpdateQty(item.productId, item.size, -1)}
                            disabled={item.quantity <= 1}
                            style={{ width: "32px", height: "100%", border: "none", background: "#fff", fontSize: "16px", fontWeight: 300, cursor: item.quantity <= 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", opacity: item.quantity <= 1 ? 0.3 : 1 }}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span style={{ width: "36px", textAlign: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "14px", fontWeight: 700, color: "#000", userSelect: "none" }}>
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQty(item.productId, item.size, 1)}
                            disabled={item.quantity >= 10}
                            style={{ width: "32px", height: "100%", border: "none", background: "#fff", fontSize: "16px", fontWeight: 300, cursor: item.quantity >= 10 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", opacity: item.quantity >= 10 ? 0.3 : 1 }}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={handleRemove}
                        style={{ fontSize: "12px", color: "#767676", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-barlow)", padding: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e8002d")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#767676")}
                    >
                        Remove
                    </button>

                    <button
                        style={{ fontSize: "12px", color: "#767676", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-barlow)", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#767676")}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        Save for Later
                    </button>
                </div>
            </div>

            {/* SALE badge */}
            {hasDiscount && (
                <span style={{ position: "absolute", top: "20px", right: 0, background: "#e8002d", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "9px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px" }}>
                    SALE
                </span>
            )}
        </div>
    );
}
