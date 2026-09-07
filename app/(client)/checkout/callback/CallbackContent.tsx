"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clearCart } from "@/lib/cart";

export default function CallbackContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const ref = searchParams.get("ref");
    const [cleared, setCleared] = useState(false);

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
                    @keyframes checkDraw {
                        from { stroke-dashoffset: 50; }
                        to   { stroke-dashoffset: 0; }
                    }
                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .confirm-content > * {
                        animation: fadeUp .5s ease forwards;
                        opacity: 0;
                    }
                    .confirm-content > *:nth-child(1) { animation-delay: .1s; }
                    .confirm-content > *:nth-child(2) { animation-delay: .2s; }
                    .confirm-content > *:nth-child(3) { animation-delay: .3s; }
                    .confirm-content > *:nth-child(4) { animation-delay: .4s; }
                    .confirm-content > *:nth-child(5) { animation-delay: .5s; }
                    .confirm-btn:hover { opacity: .85; }
                `}</style>

                <div style={{
                    minHeight: "70vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px 24px 80px",
                    background: "#fafafa",
                }}>
                    <div className="confirm-content" style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

                        {/* Animated check */}
                        <div style={{
                            width: "80px", height: "80px",
                            borderRadius: "50%",
                            background: "#000",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "28px",
                            flexShrink: 0,
                        }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline
                                    points="20 6 9 17 4 12"
                                    style={{
                                        strokeDasharray: 50,
                                        strokeDashoffset: 0,
                                        animation: "checkDraw .5s ease .3s both",
                                    }}
                                />
                            </svg>
                        </div>

                        {/* Heading */}
                        <div style={{ marginBottom: "28px" }}>
                            <p style={{
                                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                fontSize: "11px", fontWeight: 700, letterSpacing: ".2em",
                                textTransform: "uppercase", color: "#888", marginBottom: "10px",
                            }}>
                                Order Confirmed
                            </p>
                            <h1 style={{
                                fontFamily: "var(--font-display, 'Cormorant', serif)",
                                fontSize: "clamp(32px, 6vw, 48px)",
                                fontWeight: 600, lineHeight: 1.05,
                                letterSpacing: "-.01em", color: "#000",
                                marginBottom: "14px",
                            }}>
                                Thank you<br />for your order.
                            </h1>
                            <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7, maxWidth: "360px" }}>
                                Your payment was successful. A confirmation email with your order details is on its way.
                            </p>
                        </div>

                        {/* Reference */}
                        {ref && (
                            <div style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                padding: "14px 24px",
                                marginBottom: "32px",
                                width: "100%",
                            }}>
                                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#aaa", marginBottom: "4px" }}>
                                    Payment Reference
                                </p>
                                <p style={{ fontFamily: "monospace", fontSize: "14px", color: "#000", letterSpacing: ".06em", fontWeight: 600 }}>
                                    {ref}
                                </p>
                            </div>
                        )}

                        {/* What's next */}
                        <div style={{
                            width: "100%",
                            background: "#fff",
                            border: "1px solid #e8e8e8",
                            padding: "24px",
                            marginBottom: "32px",
                            textAlign: "left",
                        }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
                                What happens next
                            </p>
                            {[
                                { step: "01", text: "You'll receive a confirmation email with your order number." },
                                { step: "02", text: "We'll process and pack your order within 24 hours." },
                                { step: "03", text: "Lagos orders: same-day delivery. Nationwide: 2–5 days." },
                            ].map(({ step, text }) => (
                                <div key={step} style={{ display: "flex", gap: "14px", marginBottom: "14px", alignItems: "flex-start" }}>
                                    <span style={{
                                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                                        fontSize: "20px", fontWeight: 600, color: "#ddd",
                                        lineHeight: 1, flexShrink: 0, width: "28px",
                                    }}>{step}</span>
                                    <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6, paddingTop: "2px" }}>{text}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                            <Link
                                href="/account/orders"
                                className="confirm-btn"
                                style={{
                                    display: "block", textAlign: "center",
                                    background: "#000", color: "#fff",
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                    fontSize: "12px", fontWeight: 700,
                                    letterSpacing: ".12em", textTransform: "uppercase",
                                    padding: "16px", textDecoration: "none",
                                    borderRadius: "999px",
                                    transition: "opacity .2s",
                                }}
                            >
                                Track My Order
                            </Link>
                            <Link
                                href="/shop"
                                className="confirm-btn"
                                style={{
                                    display: "block", textAlign: "center",
                                    background: "#fff", color: "#000",
                                    border: "1.5px solid #000",
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                    fontSize: "12px", fontWeight: 700,
                                    letterSpacing: ".12em", textTransform: "uppercase",
                                    padding: "15px", textDecoration: "none",
                                    borderRadius: "999px",
                                    transition: "opacity .2s",
                                }}
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Payment failed
    return (
        <>
            <style>{`
                .fail-btn:hover { opacity: .85; }
            `}</style>
            <div style={{
                minHeight: "70vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 24px 80px",
                background: "#fafafa",
                textAlign: "center",
            }}>
                <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", alignItems: "center" }}>

                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        background: "#000",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "28px",
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>

                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#888", marginBottom: "10px" }}>
                        Payment Failed
                    </p>
                    <h1 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(28px, 5vw, 40px)",
                        fontWeight: 600, lineHeight: 1.1,
                        color: "#000", marginBottom: "16px",
                    }}>
                        Something went wrong.
                    </h1>
                    <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7, marginBottom: "36px", maxWidth: "360px" }}>
                        Your card was not charged. Please try again — if the problem persists, contact us and we&apos;ll sort it out.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                        <Link href="/checkout" className="fail-btn" style={{ display: "block", textAlign: "center", background: "#000", color: "#fff", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "16px", textDecoration: "none", borderRadius: "999px", transition: "opacity .2s" }}>
                            Try Again
                        </Link>
                        <Link href="/contact" className="fail-btn" style={{ display: "block", textAlign: "center", background: "#fff", color: "#000", border: "1.5px solid #000", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "15px", textDecoration: "none", borderRadius: "999px", transition: "opacity .2s" }}>
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
