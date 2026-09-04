"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

export default function AboutPage() {
    const hero = useInView(0.05);
    const gifSec = useInView(0.1);
    const founder = useInView(0.1);
    const quote = useInView(0.2);
    const mission = useInView(0.1);
    const values = useInView(0.1);
    const grid = useInView(0.1);

    return (
        <>
            <style>{`
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-48px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(48px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(32px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .sl { opacity: 0; }
                .sr { opacity: 0; }
                .fu { opacity: 0; }
                .sl.on { animation: slideInLeft  .7s cubic-bezier(.22,1,.36,1) forwards; }
                .sr.on { animation: slideInRight .7s cubic-bezier(.22,1,.36,1) forwards; }
                .fu.on { animation: fadeUp       .7s cubic-bezier(.22,1,.36,1) forwards; }
                .d1 { animation-delay: .1s !important; }
                .d2 { animation-delay: .22s !important; }
                .d3 { animation-delay: .36s !important; }

                .a-split {
                    display: grid;
                    grid-template-columns: 45% 55%;
                    min-height: 90vh;
                }
                .a-split-rev {
                    display: grid;
                    grid-template-columns: 55% 45%;
                    min-height: 520px;
                }
                .a-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 0 clamp(32px,5vw,64px) clamp(52px,7vh,88px);
                }
                .a-text-mid {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: clamp(48px,6vw,88px) clamp(32px,5vw,64px);
                }
                .a-img { position: relative; overflow: hidden; background: #e8e8e8; }
                .a-3col {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    height: 420px;
                }

                @media (max-width: 768px) {
                    .a-split, .a-split-rev { grid-template-columns: 1fr; min-height: auto; }
                    .a-split-rev .a-img { order: -1; min-height: 360px; }
                    .a-split .a-img { min-height: 60vw; }
                    .a-text { padding: 36px 24px 48px; }
                    .a-text-mid { padding: 40px 24px; }
                    .a-3col { grid-template-columns: 1fr; height: auto; }
                    .a-3col > div { height: 260px; }
                }
            `}</style>

            <div style={{ background: "#fff", overflow: "hidden" }}>

                {/* 1. HERO */}
                <div ref={hero.ref} className="a-split" style={{ background: "#fff" }}>
                    <div className={`a-text sl${hero.inView ? " on" : ""}`}>
                        <h1 style={{
                            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                            fontSize: "clamp(18px, 1.8vw, 26px)",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            color: "#000",
                            lineHeight: 1.2,
                            letterSpacing: ".04em",
                            marginBottom: "20px",
                        }}>
                            Welcome To Our World
                        </h1>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.85, maxWidth: "340px" }}>
                            Founded in Lagos, Missus has redefined fashion for the modern Nigerian woman, crafting pieces that celebrate confidence, style, and effortless sophistication. Every silhouette is designed to make an impact, ensuring that for every moment and every occasion, you will always be best dressed, guaranteed.
                        </p>
                    </div>
                    <div className={`a-img sr${hero.inView ? " on" : ""}`}>
                        <img
                            src="/missus.home.png"
                            alt="Missus"
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                        />
                    </div>
                </div>

                {/* 2. WEBP FULL-BLEED with text overlay */}
                <div ref={gifSec.ref} style={{ position: "relative", height: "420px", overflow: "hidden", background: "#111" }}>
                    <img
                        src="/missus-fashion-about-us.webp"
                        alt=""
                        aria-hidden="true"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", filter: "brightness(.42)" }}
                    />
                    <div className={`fu${gifSec.inView ? " on" : ""}`} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
                        <p style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(22px, 4vw, 42px)", fontWeight: 700, textTransform: "uppercase", color: "#fff", letterSpacing: ".04em", lineHeight: 1.3 }}>
                            Made in Lagos<br />Worn by the World
                        </p>
                    </div>
                </div>

                {/* 3. FOUNDER */}
                <div ref={founder.ref} className="a-split" style={{ background: "#fff" }}>
                    <div className={`a-text-mid sl${founder.inView ? " on" : ""}`}>
                        <h2 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, textTransform: "uppercase", color: "#000", marginBottom: "28px" }}>
                            From Our Founder:
                        </h2>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.95, marginBottom: "16px" }}>
                            Missus began as a simple idea: to create pieces that make Nigerian women feel confident and truly themselves. What started as a small project has grown into a community of women who inspire us every day.
                        </p>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.95, marginBottom: "16px" }}>
                            We built Missus from the ground up with one goal in mind: to design timeless, statement-making pieces for the modern Nigerian woman. Her shape, her climate, her lifestyle.
                        </p>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.95, marginBottom: "32px" }}>
                            At the heart of everything we do is our customer. Every collection, every campaign, and every decision is driven by the women who wear our pieces.
                        </p>
                        <p style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "28px", fontStyle: "italic", color: "#000" }}>
                            Missus
                        </p>
                    </div>
                    <div className={`a-img sr${founder.inView ? " on" : ""}`} style={{ minHeight: "560px" }}>
                        <Image
                            src="https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png"
                            alt="Missus founder"
                            fill
                            style={{ objectFit: "cover", objectPosition: "top center" }}
                            sizes="(max-width: 768px) 100vw, 55vw"
                        />
                    </div>
                </div>

                {/* 4. QUOTE */}
                <div ref={quote.ref} style={{ padding: "80px 24px", textAlign: "center", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
                    <p
                        className={`fu${quote.inView ? " on" : ""}`}
                        style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(20px, 3.5vw, 40px)", fontWeight: 700, textTransform: "uppercase", color: "#000", lineHeight: 1.25, maxWidth: "680px", margin: "0 auto", letterSpacing: ".02em" }}
                    >
                        &ldquo;Our clothes won&apos;t change the world but the women who wear them will&rdquo;
                    </p>
                </div>

                {/* 5. MISSION */}
                <div ref={mission.ref} className="a-split-rev" style={{ background: "#fff" }}>
                    <div className={`a-img sl${mission.inView ? " on" : ""}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "480px" }}>
                        <div style={{ position: "relative", overflow: "hidden" }}>
                            <Image src="https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-17.png" alt="" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="25vw" />
                        </div>
                        <div style={{ position: "relative", overflow: "hidden", borderLeft: "3px solid #fff" }}>
                            <Image src="https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-22.png" alt="" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="25vw" />
                        </div>
                    </div>
                    <div className={`a-text-mid sr${mission.inView ? " on" : ""}`}>
                        <h2 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, textTransform: "uppercase", color: "#000", marginBottom: "24px" }}>
                            Our Mission
                        </h2>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.95, marginBottom: "18px" }}>
                            To celebrate and empower Nigerian women to look and feel exceptional. This drives everything we do, from the pieces we curate to the speed we ship them to your door.
                        </p>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.95 }}>
                            At Missus, we create more than just garments. We create presence. The moment you step into a Missus piece, every occasion becomes a statement of you.
                        </p>
                    </div>
                </div>

                {/* 6. VALUES */}
                <div ref={values.ref} className="a-split" style={{ background: "#fff", alignItems: "center" }}>
                    <div className={`a-text-mid sl${values.inView ? " on" : ""}`}>
                        <h2 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, textTransform: "uppercase", color: "#000", marginBottom: "8px" }}>Our Values</h2>
                        <div style={{ width: "40px", height: "2px", background: "#000", marginBottom: "32px" }} />
                        {[
                            { title: "Affordability", body: "Trend-forward pieces that do not require a second mortgage. Real prices for real women." },
                            { title: "Speed", body: "Lagos same-day delivery. Nationwide in 2 to 5 days. Because fashion waits for no one." },
                            { title: "Community", body: "Built by Nigerian women, for Nigerian women. Every voice shapes what we create next." },
                        ].map((v, i) => (
                            <div key={v.title} className={`fu${values.inView ? ` on d${i + 1}` : ""}`} style={{ marginBottom: "28px" }}>
                                <h3 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "20px", fontWeight: 700, textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>{v.title}</h3>
                                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8 }}>{v.body}</p>
                            </div>
                        ))}
                    </div>
                    <div className={`a-img sr${values.inView ? " on" : ""}`} style={{ minHeight: "560px" }}>
                        <Image src="https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-8.png" alt="" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="(max-width: 768px) 100vw, 55vw" />
                    </div>
                </div>

                {/* 7. 3-COL IMAGE GRID */}
                <div ref={grid.ref} className="a-3col">
                    {[
                        "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-96.jpeg",
                        "https://missusoutfits.com/wp-content/uploads/2026/03/Leila-Halter-Mini-Dress.jpg",
                        "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg",
                    ].map((src, i) => (
                        <div key={i} className={`a-img sl${grid.inView ? ` on d${i}` : ""}`}>
                            <Image src={src} alt="" fill style={{ objectFit: "cover", objectPosition: "top center" }} sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                    ))}
                </div>

                {/* 8. CTA */}
                <div style={{ padding: "80px 24px", textAlign: "center" }}>
                    <h2 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, textTransform: "uppercase", marginBottom: "16px", color: "#000" }}>
                        Ready to Shop?
                    </h2>
                    <p style={{ fontSize: "14px", color: "#888", marginBottom: "36px", lineHeight: 1.7 }}>
                        New drops every week. Free shipping on orders over 150,000.
                    </p>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", padding: "15px 40px", textDecoration: "none", borderRadius: "999px" }}>
                            Shop Now
                        </Link>
                        <Link href="/contact" style={{ background: "#fff", color: "#000", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", padding: "15px 40px", textDecoration: "none", border: "1.5px solid #000", borderRadius: "999px" }}>
                            Get in Touch
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
}
