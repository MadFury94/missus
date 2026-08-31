"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/woocommerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

const PAY_ICONS = ["VISA", "MASTERCARD", "PAYSTACK", "FLUTTERWAVE", "OPAY"];
const EXPRESS = ["PAYSTACK", "OPAY", "KUDA"];

interface Props {
    subtotal: number;
    discount: number;
    total: number;
    itemCount: number;
    promoCode?: string;
    promoDiscount?: number;
}

export default function OrderSummary({ subtotal, discount, total, itemCount, promoCode, promoDiscount = 0 }: Props) {
    const isShippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;

    return (
        <div style={{ border: "1.5px solid #000", position: "sticky", top: "80px", background: "#fff" }}>
            {/* Header */}
            <div style={{ background: "#000", padding: "16px 20px" }}>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#fff", margin: 0 }}>
                    Order Summary
                </h2>
            </div>

            <div style={{ padding: "20px" }}>
                {/* Line items */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>
                            Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#000" }}>
                            {formatPrice(subtotal)}
                        </span>
                    </div>

                    {discount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                            <span style={{ fontSize: "13px", color: "#555" }}>Discount</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#630D13" }}>
                                −{formatPrice(discount)}
                            </span>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>Shipping</span>
                        <span style={{ fontSize: isShippingFree ? "13px" : "12px", fontWeight: isShippingFree ? 700 : 400, color: isShippingFree ? "#007a3d" : "#767676" }}>
                            {isShippingFree ? "FREE" : "Calculated at checkout"}
                        </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                        <span style={{ fontSize: "13px", color: "#555" }}>Promo Code</span>
                        <span style={{ fontSize: "12px", color: "#767676" }}>
                            {promoCode && promoDiscount > 0 ? `−${formatPrice(promoDiscount)}` : "—"}
                        </span>
                    </div>
                </div>

                {/* Savings callout */}
                {discount > 0 && (
                    <div style={{ background: "#f0faf4", border: "1px solid #c8e6d4", padding: "10px 14px", margin: "12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007a3d" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: "12px", color: "#007a3d", fontWeight: 600 }}>
                            You&apos;re saving {formatPrice(discount)} on this order!
                        </span>
                    </div>
                )}

                {/* Divider */}
                <div style={{ height: "1px", background: "#000", margin: "12px 0" }} />

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
                    <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>
                        Total
                    </span>
                    <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "24px", fontWeight: 900, color: "#000" }}>
                        {formatPrice(total)}
                    </span>
                </div>
                <p style={{ fontSize: "11px", color: "#aaa", textAlign: "right", marginTop: "4px" }}>
                    Taxes included where applicable
                </p>

                {/* Checkout CTA */}
                <Link
                    href="/checkout"
                    style={{ width: "100%", height: "52px", background: "#000", color: "#fff", border: "none", fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", transition: "background .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <div>
                        PROCEED TO CHECKOUT
                        <span style={{ fontSize: "11px", fontWeight: 400, opacity: 0.7, letterSpacing: ".06em", display: "block", marginTop: "2px" }}>
                            Secure · Encrypted · Fast
                        </span>
                    </div>
                </Link>

                {/* Continue shopping */}
                <Link
                    href="/shop"
                    style={{ display: "block", textAlign: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "none", marginTop: "12px", borderBottom: "1.5px solid #000", paddingBottom: "1px", width: "fit-content", marginLeft: "auto", marginRight: "auto", transition: "opacity .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                    Continue Shopping
                </Link>

                {/* Express checkout */}
                <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e8e8e8" }}>
                    <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "10px", position: "relative" }}>
                        <span style={{ position: "relative", zIndex: 1, background: "#fff", padding: "0 8px" }}>— Express Checkout —</span>
                        <span style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "1px", background: "#e0e0e0", transform: "translateY(-50%)", zIndex: 0 }} />
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {EXPRESS.map((name) => (
                            <button
                                key={name}
                                style={{ flex: 1, height: "44px", border: "1.5px solid #e0e0e0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", transition: "all .15s", color: "#555" }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#555"; }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Delivery estimate */}
                <div style={{ background: "#f5f5f5", padding: "12px 14px", marginTop: "14px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <div style={{ fontSize: "12px", color: "#333", lineHeight: 1.55 }}>
                        <p><strong style={{ fontWeight: 600, color: "#000" }}>Lagos:</strong> Estimated delivery in 1–2 hours</p>
                        <p><strong style={{ fontWeight: 600, color: "#000" }}>Nationwide:</strong> 1–3 business days</p>
                    </div>
                </div>

                {/* Payment methods */}
                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #e8e8e8" }}>
                    <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginBottom: "8px", letterSpacing: ".04em" }}>
                        We Accept
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                        {PAY_ICONS.map((icon) => (
                            <span key={icon} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: "3px", padding: "4px 10px", fontFamily: "var(--font-barlow-condensed)", fontSize: "9px", fontWeight: 700, letterSpacing: ".08em", color: "#555" }}>
                                {icon}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
