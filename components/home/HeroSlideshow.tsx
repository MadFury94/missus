"use client";
import { useState, useEffect, useRef, useCallback, TouchEvent } from "react";
import Link from "next/link";

interface Slide {
    src: string;
    alt: string;
    label: string;
    heading: string;
    sub: string;
    cta: { label: string; href: string };
    cta2?: { label: string; href: string };
    // where to focus the image — default "center 20%"
    position?: string;
}

const SLIDES: Slide[] = [
    {
        src: "/missus.home.png",
        alt: "Missus Collection",
        label: "The Edit",
        heading: "Made for\nHer.",
        sub: "Trend-forward, affordable fashion for the modern Nigerian girl.",
        cta: { label: "Shop Now", href: "/shop" },
        cta2: { label: "What's New", href: "/category/whats-new" },
        position: "center center",
    },
    {
        src: "/missus2.png",
        alt: "Spring Collection",
        label: "Spring / Summer 2026",
        heading: "Dress Like\nHer.",
        sub: "Trend-forward, affordable fashion for the modern Nigerian girl.",
        cta: { label: "Shop Women", href: "/shop" },
        cta2: { label: "What's New", href: "/category/whats-new" },
        position: "center 15%",
    },

];

const INTERVAL = 5000;

export default function HeroSlideshow() {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const touchStartX = useRef<number | null>(null);

    const goTo = useCallback((idx: number) => {
        setCurrent(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
    }, []);

    const next = useCallback(() => goTo(current + 1), [current, goTo]);

    // Auto-advance
    useEffect(() => {
        if (paused) return;
        timerRef.current = setTimeout(next, INTERVAL);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [current, paused, next]);

    // Touch swipe
    function onTouchStart(e: TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
    }
    function onTouchEnd(e: TouchEvent) {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
        touchStartX.current = null;
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100svh",
                overflow: "hidden",
                background: "#111",
                // Pull up behind the transparent navbar
                marginTop: "calc(-1 * var(--navbar-total-h, 0px))",
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* ── Slide track — physical translate, no fade ── */}
            <div
                style={{
                    display: "flex",
                    width: `${SLIDES.length * 100}%`,
                    height: "100%",
                    transform: `translateX(-${(current * 100) / SLIDES.length}%)`,
                    transition: "transform .55s cubic-bezier(.77,0,.175,1)",
                    willChange: "transform",
                }}
            >
                {SLIDES.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            width: `${100 / SLIDES.length}%`,
                            height: "100%",
                            position: "relative",
                            flexShrink: 0,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={s.src}
                            alt={s.alt}
                            loading={i === 0 ? "eager" : "lazy"}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: s.position ?? "center 20%",
                                display: "block",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* ── Gradient — strong at bottom for text legibility ── */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 2,
                background: [
                    "linear-gradient(to bottom, rgba(0,0,0,.45) 0%, transparent 30%)",   // top — covers transparent navbar area
                    "linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.1) 50%, transparent 100%)", // bottom — text
                ].join(", "),
                pointerEvents: "none",
            }} />

            {/* ── Slide content — keyed so it re-animates on change ── */}
            <div
                key={current}
                style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    zIndex: 3,
                    padding: "clamp(32px,6vw,80px) clamp(20px,6vw,72px) clamp(72px,9vw,110px)",
                    animation: "heroUp .5s cubic-bezier(.25,.46,.45,.94) forwards",
                }}
            >
                {SLIDES[current].label && (
                    <p style={{
                        fontFamily: "var(--font-barlow-condensed)",
                        fontSize: "11px", fontWeight: 700,
                        letterSpacing: ".32em", textTransform: "uppercase",
                        color: "rgba(255,255,255,.65)",
                        marginBottom: "10px",
                    }}>
                        {SLIDES[current].label}
                    </p>
                )}

                <h1 style={{
                    fontFamily: "var(--font-barlow-condensed)",
                    fontSize: "clamp(64px, 10vw, 128px)",
                    fontWeight: 900,
                    letterSpacing: "-.01em",
                    textTransform: "uppercase",
                    color: "#fff",
                    lineHeight: 0.88,
                    marginBottom: "18px",
                    whiteSpace: "pre-line",
                }}>
                    {SLIDES[current].heading}
                </h1>

                <p style={{
                    fontSize: "clamp(13px, 1.6vw, 15px)",
                    color: "rgba(255,255,255,.78)",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    marginBottom: "32px",
                    maxWidth: "460px",
                }}>
                    {SLIDES[current].sub}
                </p>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <Link
                        href={SLIDES[current].cta.href}
                        style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-barlow-condensed)", fontWeight: 700,
                            letterSpacing: ".12em", textTransform: "uppercase",
                            background: "#fff", color: "#000",
                            padding: "14px 36px", fontSize: "13px",
                            textDecoration: "none",
                            transition: "background .2s, color .2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#e8002d"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                    >
                        {SLIDES[current].cta.label}
                    </Link>
                    {SLIDES[current].cta2 && (
                        <Link
                            href={SLIDES[current].cta2!.href}
                            style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "var(--font-barlow-condensed)", fontWeight: 700,
                                letterSpacing: ".12em", textTransform: "uppercase",
                                background: "transparent", color: "#fff",
                                padding: "13px 32px", fontSize: "13px",
                                border: "1.5px solid rgba(255,255,255,.55)",
                                textDecoration: "none",
                                backdropFilter: "blur(4px)",
                                transition: "border-color .2s, background .2s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.12)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.55)"; e.currentTarget.style.background = "transparent"; }}
                        >
                            {SLIDES[current].cta2!.label}
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Dot indicators — bottom centre ── */}
            <div style={{
                position: "absolute",
                bottom: "28px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 4,
                display: "flex",
                gap: "8px",
                alignItems: "center",
            }}>
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        style={{
                            width: i === current ? "28px" : "7px",
                            height: "7px",
                            borderRadius: "4px",
                            background: i === current ? "#fff" : "rgba(255,255,255,.38)",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            transition: "width .3s ease, background .3s ease",
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes heroUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
