"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/woocommerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

interface Props {
    total: number;
}

export default function CartUnlockBar({ total }: Props) {
    const remaining = FREE_SHIPPING_THRESHOLD - total;
    const isUnlocked = total >= FREE_SHIPPING_THRESHOLD;
    const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

    return (
        <>
            {/* Progress unlock bar */}
            <div style={{ background: "#fff", borderBottom: "2px solid #000", padding: "10px 24px", fontSize: "13px", fontWeight: 500, color: "#000" }}>
                {isUnlocked ? (
                    <span>🎉 You&apos;ve unlocked <strong>FREE SHIPPING!</strong> Enjoy.</span>
                ) : (
                    <span>
                        Spend <strong>{formatPrice(remaining)}</strong> more to unlock <strong>FREE SHIPPING!</strong>{" "}
                        <Link href="/shop" style={{ fontWeight: 700, textDecoration: "underline", color: "#000" }}>
                            Shop New →
                        </Link>
                    </span>
                )}
                <div style={{ height: "3px", background: "#e0e0e0", marginTop: "8px", borderRadius: 0 }}>
                    <div style={{ height: "100%", background: "#000", width: `${progress}%`, transition: "width .4s ease" }} />
                </div>
            </div>

            {/* Free gift / shipping promo banner */}
            <div style={{ background: "linear-gradient(90deg,#000 0%,#1a1a1a 100%)", padding: "14px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", background: "#e8002d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                        <polyline points="20 12 20 22 4 22 4 12" />
                        <rect x="2" y="7" width="20" height="5" />
                        <line x1="12" y1="22" x2="12" y2="7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                    </svg>
                </div>
                <div>
                    {isUnlocked ? (
                        <>
                            <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", lineHeight: 1.3 }}>
                                Free shipping unlocked! 🎉
                            </p>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", fontWeight: 300 }}>
                                Your order ships free nationwide
                            </span>
                        </>
                    ) : (
                        <>
                            <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", lineHeight: 1.3 }}>
                                Add {formatPrice(remaining)} more for FREE SHIPPING
                            </p>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", fontWeight: 300 }}>
                                Orders ₦150,000+ ship free nationwide
                            </span>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
