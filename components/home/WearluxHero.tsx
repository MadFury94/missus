"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
    { image: "/wearlux/hero-editorial-photo.png", title: "STYLE,\nREDEFINED.", sub: "Contemporary menswear designed for the modern man." },
    { image: "/wearlux/hero.png", title: "RESORT\nESSENTIALS.", sub: "Lightweight knitwear made for sunlit days and slow evenings." },
    { image: "/wearlux/hero2.png", title: "LIGHT\nLAYERS.", sub: "Relaxed tailoring for every sunlit occasion." },
    { image: "/wearlux/hero3-wearlux.png", title: "THE\nWEARLUX EDIT.", sub: "Statement pieces with an effortless point of view." },
];

export default function WearluxHero() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const next = useCallback(() => setActive(value => (value + 1) % slides.length), []);
    useEffect(() => { if (paused) return; const timer = window.setInterval(next, 5000); return () => window.clearInterval(timer); }, [next, paused]);

    return <section className="wearlux-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-label="Wearlux featured collection">
        {slides.map((slide, index) => <div key={slide.image} className={`wearlux-hero-slide${index === active ? " is-active" : ""}`} aria-hidden={index !== active}>
            <Image src={slide.image} alt="Wearlux menswear editorial" fill priority={index === 0} sizes="100vw" />
        </div>)}
        <div className="wearlux-hero-overlay" />
        <div className="wearlux-hero-copy">
            <p className="wearlux-eyebrow">WEARLUX</p>
            <h1>{slides[active].title.split("\n").map(line => <span key={line}>{line}</span>)}</h1>
            <p className="wearlux-hero-sub">{slides[active].sub}</p>
            <div className="wearlux-hero-actions"><Link href="/new-in">Shop New Arrivals</Link><Link href="/shop">Explore Collection</Link></div>
        </div>
        <button className="wearlux-hero-arrow left" onClick={() => setActive(value => (value - 1 + slides.length) % slides.length)} aria-label="Previous slide">‹</button>
        <button className="wearlux-hero-arrow right" onClick={next} aria-label="Next slide">›</button>
        <div className="wearlux-hero-dots" role="tablist" aria-label="Hero slides">{slides.map((slide, index) => <button key={slide.image} className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} aria-selected={index === active} role="tab" />)}</div>
    </section>;
}
