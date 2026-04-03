"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Cart } from "@/types";
import { getCart, updateQuantity, removeFromCart } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import PromoCodeInput from "@/components/cart/PromoCodeInput";
import CartUpsell from "@/components/cart/CartUpsell";
import ExpressCheckout from "@/components/cart/ExpressCheckout";

export default function CartPage() {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });

    useEffect(() => {
        setCart(getCart());
    }, []);

    function handleQty(productId: number, size: string | undefined, delta: number) {
        const item = cart.items.find(i => i.productId === productId && i.size === size);
        if (!item) return;
        const newQty = Math.max(1, Math.min(10, item.quantity + delta));
        const updated = updateQuantity(productId, size, newQty);
        setCart(updated);
        window.dispatchEvent(new Event("cart-updated"));
    }

    function handleRemove(productId: number, size?: string) {
        const updated = removeFromCart(productId, size);
        setCart(updated);
        window.dispatchEvent(new Event("cart-updated"));
    }

    const remaining = FREE_SHIPPING_THRESHOLD - cart.subtotal;
    const discount = 12000;

    if (cart.items.length === 0) {
        return (
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
                <svg style={{ width: "80px", height: "80px", stroke: "#e0e0e0", fill: "none", strokeWidth: 1, margin: "0 auto 20px", display: "block" }} viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "28px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#ccc", marginBottom: "8px" }}>
                    Your Bag is Empty
                </h2>
                <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "24px" }}>Looks like you haven&apos;t added anything yet.</p>
                <Link href="/shop" style={{ display: "inline-block", background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 32px", textDecoration: "none" }}>
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "var(--font-barlow)", fontSize: "14px", background: "#fff" }}>
            {/* Free Gift Bar */}
            {remaining > 0 && (
                <div style={{ background: "linear-gradient(90deg, #000 0%, #1a1a1a 100%)", padding: "14px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "36px", height: "36px", background: "#e8002d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg style={{ width: "20px", height: "20px", stroke: "#fff", fill: "none", strokeWidth: 1.8 }} viewBox="0 0 24 24">
                            <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" />
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", lineHeight: 1.3, margin: 0 }}>
                            Add {formatPrice(remaining)} more for FREE SHIPPING
                        </p>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", fontWeight: 300 }}>
                            Orders ₦150,000+ ship free nationwide
                        </span>
                    </div>
                </div>
            )}

            {/* Main Cart */}
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 60px" }}>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".02em", marginBottom: "28px", color: "#000" }}>
                    YOUR BAG
                </h1>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "40px", alignItems: "start" }}>
                    {/* Left - Cart Items */}
                    <div>
                        {/* Header */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "20px", paddingBottom: "10px", borderBottom: "1.5px solid #000", marginBottom: 0 }}>
                            <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#000" }}>Product</span>
                            <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#000" }}>Quantity</span>
                            <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#000", textAlign: "right" }}>Price</span>
                        </div>

                        {/* Items */}
                        {cart.items.map((item) => (
                            <div key={`${item.productId}-${item.size}`} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "16px", padding: "20px 0", borderBottom: "1px solid #e8e8e8", position: "relative" }}>
                                <Link href={`/product/${item.slug}`} style={{ width: "90px", height: "120px", background: "#f0ece8", position: "relative", overflow: "hidden", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "9px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(0,0,0,.2)", textAlign: "center", padding: "8px", lineHeight: 1.5, textDecoration: "none" }}>
                                    {item.name}
                                </Link>

                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                                        <div>
                                            <Link href={`/product/${item.slug}`} style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "15px", fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: "#000", lineHeight: 1.2, cursor: "pointer", transition: "color .15s", textDecoration: "none" }}>
                                                {item.name}
                                            </Link>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "8px" }}>
                                                {item.size && <p style={{ fontSize: "12px", color: "#767676", margin: 0 }}><strong style={{ color: "#000", fontWeight: 600 }}>Size:</strong> {item.size}</p>}
                                                {item.color && <p style={{ fontSize: "12px", color: "#767676", margin: 0 }}><strong style={{ color: "#000", fontWeight: 600 }}>Color:</strong> {item.color}</p>}
                                            </div>
                                        </div>

                                        <div style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 700, color: "#000", whiteSpace: "nowrap" }}>
                                            {item.regularPrice > item.price && (
                                                <span style={{ fontSize: "13px", color: "#aaa", textDecoration: "line-through", fontWeight: 400, display: "block", textAlign: "right" }}>
                                                    {formatPrice(item.regularPrice * item.quantity)}
                                                </span>
                                            )}
                                            <span style={{ color: item.regularPrice > item.price ? "#e8002d" : "#000" }}>
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", height: "34px", width: "fit-content" }}>
                                            <button onClick={() => handleQty(item.productId, item.size, -1)} style={{ width: "32px", height: "100%", border: "none", background: "#fff", fontSize: "16px", fontWeight: 300, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", transition: "background .15s" }}>−</button>
                                            <input readOnly value={item.quantity} style={{ width: "36px", textAlign: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "14px", fontWeight: 700, border: "none", outline: "none", background: "#fff", color: "#000" }} />
                                            <button onClick={() => handleQty(item.productId, item.size, 1)} style={{ width: "32px", height: "100%", border: "none", background: "#fff", fontSize: "16px", fontWeight: 300, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", transition: "background .15s" }}>+</button>
                                        </div>

                                        <button onClick={() => handleRemove(item.productId, item.size)} style={{ fontSize: "12px", color: "#767676", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-barlow)", transition: "color .15s", padding: 0 }}>
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {item.regularPrice > item.price && (
                                    <span style={{ position: "absolute", top: "20px", right: 0, background: "#e8002d", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "9px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px" }}>
                                        SALE
                                    </span>
                                )}
                            </div>
                        ))}

                        {/* Continue Shopping */}
                        <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "none", marginTop: "20px", borderBottom: "1.5px solid #000", paddingBottom: "1px", transition: "opacity .15s", cursor: "pointer" }}>
                            <svg style={{ width: "14px", height: "14px", stroke: "currentColor", fill: "none", strokeWidth: 2.5 }} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                            Continue Shopping
                        </Link>

                        {/* Promo Code Input */}
                        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e8e8e8" }}>
                            <PromoCodeInput />
                        </div>

                        {/* You May Also Like - Upsell */}
                        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e8e8e8" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <h3 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "20px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", margin: 0 }}>
                                    You May Also Like
                                </h3>
                                <Link href="/shop" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "underline", color: "#000", cursor: "pointer" }}>
                                    View All →
                                </Link>
                            </div>
                            <CartUpsell products={[
                                { id: 1, name: "Lorraine Pant Set", slug: "lorraine-pant-set", price: 59000, regularPrice: 75000, colors: ["#000", "#fff", "#8b7355"] },
                                { id: 2, name: "Robin Halter Top", slug: "robin-halter-top", price: 22000, colors: ["#556b2f", "#000"] },
                                { id: 3, name: "Silk Midi Dress", slug: "silk-midi-dress", price: 48000, regularPrice: 62000 },
                                { id: 4, name: "Linen Blazer", slug: "linen-blazer", price: 67000 }
                            ]} />
                        </div>
                    </div>

                    {/* Right - Order Summary */}
                    <div style={{ background: "#fff", border: "1.5px solid #000", position: "sticky", top: "80px" }}>
                        <div style={{ background: "#000", padding: "16px 20px" }}>
                            <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#fff", margin: 0 }}>
                                Order Summary
                            </h2>
                        </div>

                        <div style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <span style={{ fontSize: "13px", color: "#555", fontWeight: 400 }}>Subtotal ({cart.items.length} items)</span>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#000", textAlign: "right" }}>{formatPrice(cart.subtotal)}</span>
                            </div>

                            {discount > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                                    <span style={{ fontSize: "13px", color: "#e8002d" }}>Discount</span>
                                    <span style={{ fontSize: "13px", color: "#e8002d" }}>−{formatPrice(discount)}</span>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <span style={{ fontSize: "13px", color: "#555", fontWeight: 400 }}>Shipping</span>
                                <span style={{ fontSize: "12px", color: "#767676", fontWeight: 400, textAlign: "right" }}>
                                    {cart.subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : "Calculated at checkout"}
                                </span>
                            </div>

                            {discount > 0 && (
                                <div style={{ background: "#f0faf4", border: "1px solid #c8e6d4", padding: "10px 14px", margin: "12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <svg style={{ width: "16px", height: "16px", stroke: "#007a3d", fill: "none", strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span style={{ fontSize: "12px", color: "#007a3d", fontWeight: 600 }}>
                                        You&apos;re saving {formatPrice(discount)} on this order!
                                    </span>
                                </div>
                            )}

                            <div style={{ height: "1px", background: "#000", margin: "12px 0" }}></div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
                                <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>Total</span>
                                <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "24px", fontWeight: 900, color: "#000" }}>{formatPrice(cart.total - discount)}</span>
                            </div>
                            <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px", textAlign: "right", margin: "4px 0 0 0" }}>Taxes included where applicable</p>

                            <Link
                                href="/checkout"
                                style={{ width: "100%", height: "52px", background: "#000", color: "#fff", border: "none", fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", transition: "background .2s", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none" }}
                            >
                                <svg style={{ width: "18px", height: "18px", stroke: "#fff", fill: "none", strokeWidth: 1.8 }} viewBox="0 0 24 24">
                                    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                                <div>
                                    PROCEED TO CHECKOUT
                                    <span style={{ fontSize: "11px", fontWeight: 400, opacity: .7, letterSpacing: ".06em", display: "block", marginTop: "2px" }}>
                                        Secure · Encrypted · Fast
                                    </span>
                                </div>
                            </Link>

                            <Link href="/shop" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "none", marginTop: "12px", borderBottom: "1.5px solid #000", paddingBottom: "1px", width: "fit-content", marginLeft: "auto", marginRight: "auto", cursor: "pointer", transition: "opacity .15s" }}>
                                Continue Shopping
                            </Link>

                            {/* Express Checkout */}
                            <ExpressCheckout />

                            {/* Delivery Estimates */}
                            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e8e8e8" }}>
                                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", marginBottom: "10px" }}>
                                    Delivery Estimates
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                    <svg style={{ width: "14px", height: "14px", stroke: "#007a3d", fill: "none", strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                                        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    <span style={{ fontSize: "12px", color: "#555" }}>Lagos: 2-3 business days</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <svg style={{ width: "14px", height: "14px", stroke: "#767676", fill: "none", strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                                        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    <span style={{ fontSize: "12px", color: "#555" }}>Other States: 4-7 business days</span>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e8e8e8" }}>
                                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", marginBottom: "10px" }}>
                                    We Accept
                                </p>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {["VISA", "MASTERCARD", "VERVE", "PAYSTACK", "BANK TRANSFER"].map((method) => (
                                        <div key={method} style={{ border: "1px solid #e0e0e0", padding: "4px 8px", fontSize: "9px", fontFamily: "var(--font-barlow-condensed)", fontWeight: 700, letterSpacing: ".06em", color: "#767676", background: "#fafafa" }}>
                                            {method}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
