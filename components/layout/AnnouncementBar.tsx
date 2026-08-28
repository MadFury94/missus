"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const SLIDES = [
    { text: "FREE SHIPPING ON ORDERS ₦150,000+", href: "/shipping" },
    { text: "NEW ARRIVALS EVERY WEEK — SHOP NOW", href: "/new-in" },
    { text: "PAY ON DELIVERY AVAILABLE NATIONWIDE", href: "/shipping" },
    { text: "SALE — UP TO 60% OFF SITEWIDE", href: "/sale" },
];

export default function AnnouncementBar({ text, onDismiss }: { text?: string; onDismiss?: () => void }) {
    const [current, setCurrent] = useState(0);
    const [show, setShow] = useState(true);

    const slides = text
        ? text.split("|").map((t) => ({ text: t.trim(), href: "/sale" }))
        : SLIDES;

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setShow(false);
            setTimeout(() => {
                setCurrent((i) => (i + 1) % slides.length);
                setShow(true);
            }, 350);
        }, 3500);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div
            role="banner"
            style={{
                background: "#000", color: "#fff",
                textAlign: "center",
                padding: "8px 40px",
                fontSize: "11px", fontWeight: 400, letterSpacing: ".12em",
                position: "relative", overflow: "hidden",
                height: "34px", display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <style>{`
                @keyframes annFade {
                    from { opacity: 0; transform: translateY(3px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .ann-slide { transition: opacity .35s ease, transform .35s ease; display: inline; }
                .ann-slide.in  { opacity: 1; transform: translateY(0); animation: annFade .35s ease forwards; }
                .ann-slide.out { opacity: 0; transform: translateY(-3px); }
            `}</style>

            <span className={`ann-slide ${show ? "in" : "out"}`}>
                <Link href={slides[current].href} style={{ color: "#fff", textDecoration: "none", letterSpacing: ".12em" }}>
                    {slides[current].text}
                </Link>
            </span>

            {/* Dot indicators — passive */}
            <div style={{ display: "inline-flex", gap: "4px", alignItems: "center", marginLeft: "10px" }}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { setCurrent(i); setShow(true); }}
                        aria-label={`Announcement ${i + 1}`}
                        style={{ width: i === current ? "12px" : "4px", height: "4px", borderRadius: "2px", background: i === current ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.2)", border: "none", padding: 0, cursor: "pointer", transition: "all .3s ease" }}
                    />
                ))}
            </div>

            {/* Dismiss */}
            <button
                onClick={onDismiss}
                aria-label="Dismiss announcement"
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,.45)", fontSize: "14px", lineHeight: 1, padding: "4px 6px", cursor: "pointer", transition: "color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.45)")}
            >
                ✕
            </button>
        </div>
    );
}
