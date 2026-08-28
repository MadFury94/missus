"use client";
import { useState } from "react";
import Link from "next/link";

export default function AnnouncementBar({ text }: { text?: string }) {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;

    const message = text ?? "FREE SHIPPING ON ORDERS ₦150,000+  |  NEW ARRIVALS EVERY WEEK  |  PAY ON DELIVERY AVAILABLE";

    return (
        <div role="banner" style={{ background: "#000", color: "#fff", textAlign: "center", padding: "9px 40px", fontSize: "12px", fontWeight: 500, letterSpacing: ".04em", position: "relative" }}>
            <span>{message}</span>
            <Link href="/sale" style={{ color: "#fff", textDecoration: "underline", marginLeft: "6px" }}>
                SHOP SALE →
            </Link>
            <button
                onClick={() => setVisible(false)}
                aria-label="Dismiss announcement"
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.6)", fontSize: "16px", lineHeight: 1, padding: "4px 6px", cursor: "pointer", transition: "color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.6)")}
            >
                ✕
            </button>
        </div>
    );
}
