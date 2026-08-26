"use client";
import Link from "next/link";

export default function AnnouncementBar({ text }: { text?: string }) {
    const message = text ?? "FREE SHIPPING ON ORDERS ₦150,000+  |  NEW ARRIVALS EVERY WEEK  |  PAY ON DELIVERY AVAILABLE";
    return (
        <div role="banner" style={{ background: "#000", color: "#fff", textAlign: "center", padding: "9px 40px", fontSize: "12px", fontWeight: 500, letterSpacing: ".04em" }}>
            <span>{message}</span>
            <Link href="/sale" style={{ color: "#fff", textDecoration: "underline", marginLeft: "6px" }}>
                SHOP SALE →
            </Link>
        </div>
    );
}
