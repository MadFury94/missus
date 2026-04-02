"use client";
import { useState } from "react";
import Link from "next/link";
import { ANNOUNCEMENT } from "@/lib/config";

export default function AnnouncementBar() {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;
    return (
        <div style={{ background: "#000", color: "#fff", textAlign: "center", padding: "9px 40px", fontSize: "12px", fontWeight: 500, letterSpacing: ".04em", position: "relative" }}>
            <span>{ANNOUNCEMENT}</span>
            <Link href="/sale" style={{ color: "#fff", textDecoration: "underline", marginLeft: "6px" }}>SHOP SALE →</Link>
            <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "8px" }}>
                <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "16px", lineHeight: 1, padding: "0 4px", cursor: "pointer" }}>✕</button>
            </div>
        </div>
    );
}
