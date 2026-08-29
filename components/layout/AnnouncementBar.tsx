"use client";
import { useState } from "react";
import Link from "next/link";

const SLIDES = [
    { text: "FREE SHIPPING ON ORDERS ₦150,000+", href: "/shipping" },
    { text: "NEW ARRIVALS EVERY WEEK — SHOP NOW", href: "/new-in" },
    { text: "PAY ON DELIVERY AVAILABLE NATIONWIDE", href: "/shipping" },
    { text: "SALE — UP TO 60% OFF SITEWIDE", href: "/sale" },
];

export default function AnnouncementBar({ text, onDismiss }: { text?: string; onDismiss?: () => void }) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;

    const slides = text
        ? text.split("|").map((t) => ({ text: t.trim(), href: "/sale" }))
        : SLIDES;

    // Triple the items so the scroll loops seamlessly
    const items = [...slides, ...slides, ...slides];
    const duration = slides.length * 6; // seconds — adjust speed here

    return (
        <div
            role="banner"
            style={{
                background: "#000",
                color: "#fff",
                height: "34px",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <style>{`
                @keyframes annScroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-33.333%); }
                }
                .ann-track {
                    display: flex;
                    white-space: nowrap;
                    animation: annScroll ${duration}s linear infinite;
                    width: max-content;
                }
                .ann-track:hover { animation-play-state: paused; }
            `}</style>

            <div className="ann-track">
                {items.map((slide, i) => (
                    <Link
                        key={i}
                        href={slide.href}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "20px",
                            padding: "0 32px",
                            color: "#fff",
                            textDecoration: "none",
                            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                            fontSize: "11px",
                            fontWeight: 400,
                            letterSpacing: ".14em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                        }}
                    >
                        {slide.text}
                        <span style={{ width: "3px", height: "3px", background: "rgba(255,255,255,.35)", borderRadius: "50%", display: "inline-block" }} aria-hidden="true" />
                    </Link>
                ))}
            </div>

            {/* Dismiss */}
            <button
                onClick={() => { setDismissed(true); onDismiss?.(); }}
                aria-label="Dismiss announcement"
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.45)", fontSize: "14px", lineHeight: 1, padding: "4px 6px", cursor: "pointer", transition: "color .15s", zIndex: 2 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.45)")}
            >
                ✕
            </button>
        </div>
    );
}
