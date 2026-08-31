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
            <div style={{
                minHeight: "60vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center",
            }}>
                <div style={{
                    width: "72px", height: "72px", borderRadius: "50%",
                    background: "#007a3d",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "24px",
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h1 style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(28px, 5vw, 42px)",
                    fontWeight: 900, textTransform: "uppercase",
                    letterSpacing: ".04em", marginBottom: "12px", color: "#000",
                }}>
                    Order Confirmed!
                </h1>

                <p style={{ fontSize: "15px", color: "#555", marginBottom: "8px", maxWidth: "420px", lineHeight: 1.6 }}>
                    Your payment was successful. We&apos;ll send you a confirmation email shortly.
                </p>

                {ref && (
                    <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "32px", fontFamily: "monospace" }}>
                        Reference: {ref}
                    </p>
                )}

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                    <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 32px", textDecoration: "none" }}>
                        Continue Shopping
                    </Link>
                    <Link href="/account" style={{ background: "#fff", color: "#000", border: "1.5px solid #000", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 32px", textDecoration: "none" }}>
                        Track My Order
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center",
        }}>
            <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "#630D13",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "24px",
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </div>

            <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(28px, 5vw, 42px)",
                fontWeight: 900, textTransform: "uppercase",
                letterSpacing: ".04em", marginBottom: "12px", color: "#000",
            }}>
                Payment Failed
            </h1>

            <p style={{ fontSize: "15px", color: "#555", marginBottom: "32px", maxWidth: "420px", lineHeight: 1.6 }}>
                Your payment could not be verified. Your card was not charged. Please try again or contact us if the issue persists.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/checkout" style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 32px", textDecoration: "none" }}>
                    Try Again
                </Link>
                <Link href="/contact" style={{ background: "#fff", color: "#000", border: "1.5px solid #000", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 32px", textDecoration: "none" }}>
                    Contact Support
                </Link>
            </div>
        </div>
    );
}
