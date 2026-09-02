"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart, removeFromCart, updateQuantity } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";
import type { Cart } from "@/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });

    const refresh = useCallback(() => setCart(getCart()), []);

    useEffect(() => {
        refresh();
        window.addEventListener("cart-updated", refresh);
        return () => window.removeEventListener("cart-updated", refresh);
    }, [refresh]);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
                    zIndex: 299,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "auto" : "none",
                    transition: "opacity .3s ease",
                }}
            />

            {/* Drawer */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Shopping bag"
                style={{
                    position: "fixed", top: 0, right: 0, bottom: 0,
                    width: "min(420px, 100vw)",
                    background: "#fff",
                    zIndex: 300,
                    display: "flex", flexDirection: "column",
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform .32s cubic-bezier(.4,0,.2,1)",
                    boxShadow: "-4px 0 32px rgba(0,0,0,.12)",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #e8e8e8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>
                            Your Bag
                        </h2>
                        {cart.items.length > 0 && (
                            <span style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, borderRadius: "99px", padding: "1px 8px" }}>
                                {cart.items.reduce((s, i) => s + i.quantity, 0)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close bag"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", color: "#000" }}
                        onFocus={(e) => (e.currentTarget.style.outline = "2px solid #000")}
                        onBlur={(e) => (e.currentTarget.style.outline = "none")}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Empty state  FashionNova style */}
                {cart.items.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "#111", marginBottom: "8px" }}>
                            Your bag is empty.
                        </p>
                        <p style={{ fontSize: "13px", color: "#888", marginBottom: "28px", lineHeight: 1.5 }}>
                            Have an account? Sign in to view your bag
                        </p>
                        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                            <button
                                onClick={onClose}
                                style={{ flex: 1, background: "#111", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 16px", border: "none", cursor: "pointer" }}
                            >
                                Start Shopping
                            </button>
                            <Link
                                href="/account/login"
                                onClick={onClose}
                                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#111", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 16px", border: "1.5px solid #ddd", textDecoration: "none" }}
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Items */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
                            {cart.items.map((item) => {
                                const hasDiscount = item.regularPrice && item.regularPrice > item.price;
                                return (
                                    <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: "14px", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
                                        {/* Image */}
                                        <Link href={`/product/${item.slug}`} onClick={onClose} style={{ flexShrink: 0, width: "76px", height: "100px", background: "#f5f5f5", position: "relative", overflow: "hidden", display: "block" }}>
                                            {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="76px" />}
                                        </Link>

                                        {/* Details */}
                                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                            <div>
                                                <Link href={`/product/${item.slug}`} onClick={onClose} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "#000", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.name}
                                                </Link>
                                                {item.size && <p style={{ fontSize: "11px", color: "#767676", marginTop: "3px" }}>Size: {item.size}</p>}
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                                                    {hasDiscount && (
                                                        <span style={{ fontSize: "12px", color: "#aaa", textDecoration: "line-through" }}>
                                                            {formatPrice(item.regularPrice!)}
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: "13px", fontWeight: 700, color: hasDiscount ? "#7F0E12" : "#000" }}>
                                                        {formatPrice(item.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                                                {/* Qty stepper */}
                                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #e0e0e0", height: "30px" }}>
                                                    <button
                                                        aria-label="Decrease quantity"
                                                        onClick={() => { updateQuantity(item.productId, item.size, item.quantity - 1); refresh(); window.dispatchEvent(new Event("cart-updated")); }}
                                                        disabled={item.quantity <= 1}
                                                        style={{ width: "28px", height: "100%", border: "none", background: "#fff", cursor: item.quantity <= 1 ? "not-allowed" : "pointer", opacity: item.quantity <= 1 ? 0.3 : 1, fontSize: "14px" }}
                                                    >-</button>
                                                    <span style={{ width: "28px", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700 }}>{item.quantity}</span>
                                                    <button
                                                        aria-label="Increase quantity"
                                                        onClick={() => { updateQuantity(item.productId, item.size, item.quantity + 1); refresh(); window.dispatchEvent(new Event("cart-updated")); }}
                                                        disabled={item.quantity >= 10}
                                                        style={{ width: "28px", height: "100%", border: "none", background: "#fff", cursor: item.quantity >= 10 ? "not-allowed" : "pointer", opacity: item.quantity >= 10 ? 0.3 : 1, fontSize: "14px" }}
                                                    >+</button>
                                                </div>
                                                {/* Remove */}
                                                <button
                                                    aria-label={`Remove ${item.name}`}
                                                    onClick={() => { removeFromCart(item.productId, item.size); refresh(); window.dispatchEvent(new Event("cart-updated")); }}
                                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#aaa", textDecoration: "underline", fontFamily: "'Barlow', sans-serif", padding: 0 }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#7F0E12")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                                                >Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: "1.5px solid #000", padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Subtotal</span>
                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 900 }}>
                                    {formatPrice(cart.subtotal)}
                                </span>
                            </div>
                            <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "16px", textAlign: "center" }}>
                                Shipping calculated at checkout
                            </p>
                            <Link
                                href="/checkout"
                                onClick={onClose}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", padding: "16px", textDecoration: "none", marginBottom: "10px" }}
                            >
                                Checkout  {formatPrice(cart.subtotal)}
                            </Link>
                            <Link
                                href="/cart"
                                onClick={onClose}
                                style={{ display: "block", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", textDecoration: "underline" }}
                            >
                                View Full Bag
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
