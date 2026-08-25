"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
    type: "image";
    src: string;
    alt?: string;
    label?: string;
    heading: string;
    sub: string;
    cta: { label: string; href: string };
    cta2?: { label: string; href: string };
}

const SLIDES: Slide[] = [
    {
        type: "image",
        src: "/missus.home.png",
        alt: "Missus Collection",
        label: "The Edit",
        heading: "Made for\nHer.",
        sub: "Trend-forward, affordable fashion for the modern Nigerian girl.",
        cta: { label: "Shop Now", href: "/shop" },
        cta2: { label: "What's New", href: "/category/whats-new" },
    },
    {
        type: "image",
        src: "/missus-hero.png",
        alt: "Spring Collection",
        label: "Spring / Summer 2026",
        heading: "Dress Like\nHer.",
        sub: "Trend-forward, affordable fashion for the modern Nigerian girl. From Lagos to Abuja — we deliver style to your door.",
        cta: { label: "Shop Women", href: "/shop" },
        cta2: { label: "What's New", href: "/category/whats-new" },
    },
    {
        type: "image",
        src: "/missus2.png",
        alt: "New Arrivals",
        label: "New Drops",
        heading: "Fresh\nFits.",
        sub: "New arrivals every week. Be the first to wear what everyone else will be talking about.",
        cta: { label: "Shop New In", href: "/new-in" },
        cta2: { label: "View Sale", href: "/sale" },
    },

];

const INTERVAL = 5000;

export default function HeroSlideshow() {
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goTo = useCallback((idx: number) => {
        if (transitioning) return;
        setTransitioning(true);
        setTimeout(() => {
            setCurrent(idx);
            setTransitioning(false);
        }, 400);
    }, [transitioning]);

    const next = useCallback(() => {
        goTo((current + 1) % SLIDES.length);
    }, [current, goTo]);

    useEffect(() => {
        if (paused) return;
        timerRef.current = setTimeout(next, INTERVAL);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [current, paused, next]);

    const slide = SLIDES[current];

    return (
        <div
            style={{ position: "relative", width: "100%", height: "clamp(480px, 85vh, 860px)", overflow: "hidden", background: "#111" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Slides */}
            {SLIDES.map((s, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: i === current ? (transitioning ? 0 : 1) : 0,
                        transition: "opacity .45s ease",
                        pointerEvents: i === current ? "auto" : "none",
                    }}
                >
                    <Image
                        src={s.src}
                        alt={s.alt || s.heading}
                        fill
                        style={{ objectFit: "cover", objectPosition: "center 20%" }}
                        sizes="100vw"
                        loading={i === 0 ? "eager" : "lazy"}
                        priority={i === 0}
                    />
                </div>
            ))}

            {/* Gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.2) 55%, transparent 100%)", zIndex: 2 }} />

            {/* Content */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, padding: "clamp(28px,5vw,60px) clamp(20px,5vw,60px) clamp(60px,8vw,90px)" }}>
                {slide.label && (
                    <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "10px" }}>
                        {slide.label}
                    </p>
                )}
                <h1
                    key={current}
                    style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(56px,9vw,120px)", fontWeight: 900, letterSpacing: "-.01em", textTransform: "uppercase", color: "#fff", lineHeight: 0.88, marginBottom: "16px", whiteSpace: "pre-line", animation: "heroFadeUp .5s ease forwards" }}
                >
                    {slide.heading.split("\n").map((line, i) => (
                        <span key={i} style={{ display: "block" }}>{line}</span>
                    ))}
                </h1>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,.75)", fontWeight: 300, marginBottom: "28px", maxWidth: "440px", lineHeight: 1.65 }}>
                    {slide.sub}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link href={slide.cta.href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow-condensed)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "#000", color: "#fff", padding: "13px 28px", fontSize: "13px", textDecoration: "none" }}>
                        {slide.cta.label}
                    </Link>
                    {slide.cta2 && (
                        <Link href={slide.cta2.href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow-condensed)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "rgba(255,255,255,.12)", color: "#fff", padding: "13px 28px", fontSize: "13px", border: "1.5px solid rgba(255,255,255,.5)", textDecoration: "none", backdropFilter: "blur(4px)" }}>
                            {slide.cta2.label}
                        </Link>
                    )}
                </div>
            </div>

            {/* Dot indicators */}
            <div style={{ position: "absolute", bottom: "24px", right: "clamp(20px,5vw,60px)", zIndex: 4, display: "flex", gap: "8px", alignItems: "center" }}>
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        style={{ width: i === current ? "28px" : "8px", height: "8px", borderRadius: "4px", background: i === current ? "#fff" : "rgba(255,255,255,.4)", border: "none", cursor: "pointer", padding: 0, transition: "all .3s ease" }}
                    />
                ))}
            </div>

            {/* Prev / Next arrows */}
            {[
                { dir: -1, label: "Previous", side: "left" },
                { dir: 1, label: "Next", side: "right" },
            ].map(({ dir, label, side }) => (
                <button
                    key={side}
                    onClick={() => goTo((current + dir + SLIDES.length) % SLIDES.length)}
                    aria-label={label}
                    style={{ position: "absolute", top: "50%", [side]: "16px", transform: "translateY(-50%)", zIndex: 4, background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", transition: "background .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.65)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.35)")}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {dir === -1 ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
                    </svg>
                </button>
            ))}

            {/* Sale badge */}
            <div style={{ position: "absolute", top: "24px", right: "clamp(20px,5vw,60px)", zIndex: 4, background: "#e8002d", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", padding: "12px 20px", textAlign: "center", lineHeight: 1.3 }}>
                UP TO<br /><span style={{ fontSize: "22px" }}>60%</span><br />OFF SALE
            </div>

            <style>{`
                @keyframes heroFadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
