"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
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
        src: "/Desktop view 1.jpg",
        alt: "Missus Collection",
        label: "The Edit",
        heading: "Made for\nHer.",
        sub: "Trend-forward, affordable fashion for the modern Nigerian girl.",
        cta: { label: "Shop Now", href: "/shop" },
        cta2: { label: "What's New", href: "/category/whats-new" },
    },
    {
        src: "/Desktop view 3.WEBP",
        alt: "New Collection",
        label: "New Drops",
        heading: "Dress Like\nHer.",
        sub: "New arrivals every week. Be the first to wear what everyone else will be talking about.",
        cta: { label: "Shop New In", href: "/new-in" },
        cta2: { label: "View Sale", href: "/sale" },
    },
    {
        src: "/Desktop view 2.WEBP",
        alt: "New Collection",
        label: "New Drops",
        heading: "Dress Like\nHer.",
        sub: "New arrivals every week. Be the first to wear what everyone else will be talking about.",
        cta: { label: "Shop New In", href: "/new-in" },
        cta2: { label: "View Sale", href: "/sale" },
    },
];

const INTERVAL = 5000;

export default function HeroSlideshow({ slides = SLIDES }: { slides?: Slide[] }) {
    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState<number | null>(null);
    const [sliding, setSliding] = useState(false);
    const [direction, setDirection] = useState<"left" | "right">("left");
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goTo = useCallback((idx: number, dir?: "left" | "right") => {
        if (sliding || idx === current) return;
        const resolvedDir = dir ?? (idx > current ? "left" : "right");
        setDirection(resolvedDir);
        setPrev(current);
        setCurrent(idx);
        setSliding(true);
        setTimeout(() => {
            setPrev(null);
            setSliding(false);
        }, 600);
    }, [sliding, current]);

    const next = useCallback(() => {
        goTo((current + 1) % slides.length, "left");
    }, [current, goTo, slides.length]);

    useEffect(() => {
        if (paused) return;
        timerRef.current = setTimeout(next, INTERVAL);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [current, paused, next]);

    return (
        <div
            className="hero-slideshow"
            style={{ position: "relative", width: "100%", height: "100svh", overflow: "hidden", background: "#111" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <style>{`
                .hero-slideshow {
                    height: 100svh;
                    height: 100dvh;
                }
                @supports not (height: 100svh) {
                    .hero-slideshow { height: 100vh; }
                }
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); }
                    to   { transform: translateX(0); }
                }
                @keyframes slideInFromLeft {
                    from { transform: translateX(-100%); }
                    to   { transform: translateX(0); }
                }
                @keyframes slideOutToLeft {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-100%); }
                }
                @keyframes slideOutToRight {
                    from { transform: translateX(0); }
                    to   { transform: translateX(100%); }
                }
                @keyframes heroFadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .hero-content {
                    animation: heroFadeUp .6s ease forwards;
                }
            `}</style>

            {/* ── Background images only — these slide ── */}
            {slides.map((s, i) => {
                const isCurrent = i === current;
                const isPrev = i === prev;
                if (!isCurrent && !isPrev) return null;

                let animName = "none";
                if (sliding) {
                    if (isCurrent) animName = direction === "left" ? "slideInFromRight" : "slideInFromLeft";
                    if (isPrev) animName = direction === "left" ? "slideOutToLeft" : "slideOutToRight";
                }

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: isCurrent ? 1 : 0,
                            animation: animName !== "none"
                                ? `${animName} 0.6s cubic-bezier(0.77,0,0.18,1) forwards`
                                : "none",
                        }}
                    >
                        <Image
                            src={s.src}
                            alt={s.alt || ""}
                            fill
                            style={{ objectFit: "cover", objectPosition: "center top" }}
                            sizes="(max-width: 768px) 100vw, 100vw"
                            loading={i === 0 ? "eager" : "lazy"}
                            priority={i === 0}
                        />
                    </div>
                );
            })}

            {/* ── Gradient — even scrim so centered text always reads ── */}
            <div style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.42)",
                zIndex: 2, pointerEvents: "none",
            }} />

            {/* ── Text content — centered ── */}
            <div
                key={current}
                className="hero-content"
                style={{
                    position: "absolute", inset: 0, zIndex: 3,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    textAlign: "center",
                    padding: "clamp(20px, 5vw, 60px)",
                }}
            >
                {slides[current].label && (
                    <p style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "12px", fontWeight: 500, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "14px" }}>
                        {slides[current].label}
                    </p>
                )}
                <h1 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(56px,9vw,120px)", fontWeight: 700, letterSpacing: "-.01em", textTransform: "uppercase", color: "#fff", lineHeight: 0.88, marginBottom: "20px", whiteSpace: "pre-line" }}>
                    {slides[current].heading.split("\n").map((line, i) => (
                        <span key={i} style={{ display: "block" }}>{line}</span>
                    ))}
                </h1>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,.75)", fontWeight: 300, marginBottom: "32px", maxWidth: "480px", lineHeight: 1.65 }}>
                    {slides[current].sub}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                    <Link href={slides[current].cta.href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", background: "#000", color: "#fff", padding: "13px 28px", fontSize: "12px", textDecoration: "none" }}>
                        {slides[current].cta.label}
                    </Link>
                    {slides[current].cta2 && (
                        <Link href={slides[current].cta2!.href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", background: "rgba(255,255,255,.12)", color: "#fff", padding: "13px 28px", fontSize: "12px", border: "1.5px solid rgba(255,255,255,.5)", textDecoration: "none", backdropFilter: "blur(4px)" }}>
                            {slides[current].cta2!.label}
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Dot indicators ── */}
            <div style={{ position: "absolute", bottom: "24px", right: "clamp(20px,5vw,60px)", zIndex: 4, display: "flex", gap: "8px", alignItems: "center" }}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i, i > current ? "left" : "right")}
                        aria-label={`Go to slide ${i + 1}`}
                        style={{ width: i === current ? "28px" : "8px", height: "8px", borderRadius: "4px", background: i === current ? "#fff" : "rgba(255,255,255,.4)", border: "none", cursor: "pointer", padding: 0, transition: "all .3s ease" }}
                    />
                ))}
            </div>
        </div>
    );
}
