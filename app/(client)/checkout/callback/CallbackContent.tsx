"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clearCart } from "@/lib/cart";

export default function CallbackContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const ref = searchParams.get("ref") || searchParams.get("reference") || searchParams.get("trxref");
    const orderNumber = searchParams.get("orderNumber");
    const name = searchParams.get("name");
    const address = searchParams.get("address");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const email = searchParams.get("email");
    const [cleared, setCleared] = useState(false);

    const firstName = name?.split(" ")[0] ?? "";
    const fullAddress = [address, city, state, "Nigeria"].filter(Boolean).join(", ");
    const mapQuery = encodeURIComponent(fullAddress);

    useEffect(() => {
        if (status === "success" && !cleared) {
            clearCart();
            window.dispatchEvent(new Event("cart-updated"));
            setCleared(true);
        }
    }, [status, cleared]);

    if (status === "success") {
        return (
            <>
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .confirm-wrap { animation: fadeIn .4s ease forwards; }
                    .confirm-grid {
                        display: grid;
                        grid-template-columns: 1fr 380px;
                        gap: 32px;
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 48px 24px 80px;
                    }
                    .confirm-map {
                        width: 100%;
                        height: 200px;
                        border: none;
                        display: block;
                    }
                    @media (max-width: 768px) {
                        .confirm-grid {
                            grid-template-columns: 1fr;
                            padding: 32px 16px 60px;
                        }
                    }
                `}</style>

                <div className="confirm-wrap" style={{ background: "#fafafa", minHeight: "70vh" }}>

                    {/* Top header strip */}
                    <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "20px 24px" }}>
                        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                {orderNumber && (
                                    <p style={{ fontSize: "11px", color: "#aaa", letterSpacing: ".06em", marginBottom: "2px" }}>
                                        Confirmation #{orderNumber}
                                    </p>
                                )}
                                <h1 style={{
                                    fontFamily: "var(--font-display, 'Cormorant', serif)",
                                    fontSize: "clamp(20px, 3vw, 26px)",
                                    fontWeight: 600, color: "#000", lineHeight: 1.1,
                                }}>
                                    {firstName ? `Thank you, ${firstName}!` : "Thank you for your order!"}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="confirm-grid">
                        {/* LEFT column */}
                        <div>
                            {/* Map */}
                            {address && (
                                <div style={{ background: "#fff", border: "1px solid #e8e8e8", marginBottom: "16px", overflow: "hidden" }}>
                                    <iframe
                                        className="confirm-map"
                                        loading="lazy"
                                        title="Delivery location"
                                        src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=14`}
                                    />
                                    <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "8px", alignItems: "center" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <p style={{ fontSize: "12px", color: "#666" }}>{fullAddress}</p>
                                    </div>
                                </div>
                            )}

                            {/* Order confirmed text */}
                            <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "16px" }}>
                                <h2 style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "6px" }}>
                                    Your order is confirmed
                                </h2>
                                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
                                    You&apos;ll receive a confirmation email with your order number shortly.
                                </p>
                            </div>

                            {/* Order details */}
                            <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "16px" }}>
                                <h2 style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", marginBottom: "16px" }}>
                                    Order details
                                </h2>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    {email && (
                                        <div>
                                            <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Contact</p>
                                            <p style={{ fontSize: "13px", color: "#333" }}>{email}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Payment</p>
                                        <p style={{ fontSize: "13px", color: "#333" }}>Paystack · Paid</p>
                                    </div>
                                    {address && (
                                        <div>
                                            <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Shipping address</p>
                                            <p style={{ fontSize: "13px", color: "#333", lineHeight: 1.5 }}>{name}<br />{address}<br />{city}, {state}</p>
                                        </div>
                                    )}
                                    {ref && (
                                        <div>
                                            <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Reference</p>
                                            <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#333", wordBreak: "break-all" }}>{ref}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CTAs */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <Link href="/account/orders" style={{
                                    display: "block", textAlign: "center",
                                    background: "#000", color: "#fff",
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                    fontSize: "12px", fontWeight: 700,
                                    letterSpacing: ".12em", textTransform: "uppercase",
                                    padding: "15px", textDecoration: "none",
                                    borderRadius: "999px",
                                }}>
                                    Track My Order
                                </Link>
                                <Link href="/shop" style={{
                                    display: "block", textAlign: "center",
                                    background: "#fff", color: "#000",
                                    border: "1.5px solid #000",
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                    fontSize: "12px", fontWeight: 700,
                                    letterSpacing: ".12em", textTransform: "uppercase",
                                    padding: "14px", textDecoration: "none",
                                    borderRadius: "999px",
                                }}>
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT column — order summary placeholder */}
                        <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "24px", height: "fit-content", position: "sticky", top: "80px" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
                                Order Summary
                            </p>
                            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                                    <span style={{ color: "#555" }}>Payment reference</span>
                                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#333", maxWidth: "140px", textAlign: "right", wordBreak: "break-all" }}>{ref}</span>
                                </div>
                                {orderNumber && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                                        <span style={{ color: "#555" }}>Order number</span>
                                        <span style={{ fontWeight: 600, color: "#000" }}>#{orderNumber}</span>
                                    </div>
                                )}
                                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "14px", marginTop: "4px" }}>
                                    <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>
                                        Full order details including items and totals have been sent to your email.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Payment failed
    return (
        <>
            <style>{`.fail-btn:hover { opacity: .85; }`}</style>
            <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px 80px", background: "#fafafa", textAlign: "center" }}>
                <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#888", marginBottom: "10px" }}>Payment Failed</p>
                    <h1 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 600, lineHeight: 1.1, color: "#000", marginBottom: "16px" }}>
                        Something went wrong.
                    </h1>
                    <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7, marginBottom: "36px", maxWidth: "360px" }}>
                        Your card was not charged. Please try again — if the problem persists, contact us and we&apos;ll sort it out.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                        <Link href="/checkout" className="fail-btn" style={{ display: "block", textAlign: "center", background: "#000", color: "#fff", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "16px", textDecoration: "none", borderRadius: "999px" }}>
                            Try Again
                        </Link>
                        <Link href="/contact" className="fail-btn" style={{ display: "block", textAlign: "center", background: "#fff", color: "#000", border: "1.5px solid #000", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "15px", textDecoration: "none", borderRadius: "999px" }}>
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
