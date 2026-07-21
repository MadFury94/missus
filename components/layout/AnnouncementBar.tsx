"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ANNOUNCEMENT } from "@/lib/config";

const STORAGE_KEY = "missus_announcement_dismissed";
// Change this version string whenever you want the bar to reappear (e.g. new promotion)
const VERSION = "v1";

export default function AnnouncementBar() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (dismissed !== VERSION) setVisible(true);
    }, []);

    function dismiss() {
        localStorage.setItem(STORAGE_KEY, VERSION);
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div role="banner" style={{ background: "#000", color: "#fff", textAlign: "center", padding: "9px 40px", fontSize: "12px", fontWeight: 500, letterSpacing: ".04em", position: "relative" }}>
            <span>{ANNOUNCEMENT}</span>
            <Link href="/sale" style={{ color: "#fff", textDecoration: "underline", marginLeft: "6px" }}>
                SHOP SALE →
            </Link>
            <button
                onClick={dismiss}
                aria-label="Dismiss announcement"
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#fff", fontSize: "16px", lineHeight: 1, padding: "4px 6px", cursor: "pointer", opacity: 0.7 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                onFocus={(e) => (e.currentTarget.style.outline = "2px solid #fff")}
                onBlur={(e) => (e.currentTarget.style.outline = "none")}
            >
                ✕
            </button>
        </div>
    );
}
