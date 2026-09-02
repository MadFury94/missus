"use client";
import Image from "next/image";

const APP_IMGS = [
    { src: "/missus_circle.WEBP", label: "New Drops Daily" },
    { src: "/missus_circle2.WEBP", label: "Shop Now" },
];

export default function AppDownloadBanner() {
    return (
        <>
            <style>{`
                .social-section {
                    background: #000;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 480px;
                    overflow: hidden;
                }
                .social-text-col {
                    padding: clamp(40px, 6vw, 80px);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .social-images-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3px;
                    overflow: hidden;
                }
                .social-img-wrap {
                    position: relative;
                    overflow: hidden;
                    aspect-ratio: 9/16;
                }
                .social-img-wrap:nth-child(2) { margin-top: 48px; }

                .social-cta-btn {
                    border: 1.5px solid rgba(255,255,255,.3);
                    padding: 13px 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    text-decoration: none;
                    transition: border-color .2s, background .2s;
                    min-width: 130px;
                }
                .social-cta-btn:hover {
                    border-color: rgba(255,255,255,.8);
                    background: rgba(255,255,255,.06);
                }

                /* ── Mobile ── */
                @media (max-width: 768px) {
                    .social-section {
                        grid-template-columns: 1fr;
                        min-height: unset;
                    }
                    .social-text-col {
                        padding: 40px 20px 28px;
                        order: 1;
                    }
                    .social-images-col {
                        order: 2;
                        display: flex;
                        flex-direction: row;
                        gap: 10px;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                        padding: 0 20px 28px;
                        /* peek effect */
                    }
                    .social-images-col::-webkit-scrollbar { display: none; }
                    .social-img-wrap {
                        flex: 0 0 72vw;
                        scroll-snap-align: start;
                        aspect-ratio: 3/4 !important;
                        border-radius: 6px;
                        margin-top: 0 !important;
                    }
                }
            `}</style>

            <section className="social-section">

                {/* ── Text column ── */}
                <div className="social-text-col">
                    {/* Eyebrow */}
                    <p style={{
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: ".2em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,.4)",
                        marginBottom: "16px",
                    }}>
                        @missusoutfits
                    </p>

                    {/* Headline */}
                    <h2 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(44px, 5.5vw, 76px)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#fff",
                        lineHeight: 0.9,
                        letterSpacing: "-.01em",
                        marginBottom: "20px",
                    }}>
                        Follow<br />The It<br />Girls
                    </h2>

                    {/* Body */}
                    <p style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,.5)",
                        marginBottom: "32px",
                        fontWeight: 300,
                        lineHeight: 1.8,
                        maxWidth: "300px",
                    }}>
                        New drops, styling inspo and behind-the-scenes content — daily fashion that hits different.
                    </p>

                    {/* CTAs */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <a href="https://instagram.com/missusoutfits" target="_blank" rel="noopener noreferrer" className="social-cta-btn">
                            <span style={{ fontSize: "9px", color: "rgba(255,255,255,.4)", letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                                Follow us on
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: ".04em", fontFamily: "var(--font-body)" }}>
                                Instagram
                            </span>
                        </a>
                        <a href="https://tiktok.com/@missusoutfits" target="_blank" rel="noopener noreferrer" className="social-cta-btn">
                            <span style={{ fontSize: "9px", color: "rgba(255,255,255,.4)", letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                                Watch us on
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: ".04em", fontFamily: "var(--font-body)" }}>
                                TikTok
                            </span>
                        </a>
                    </div>
                </div>

                {/* ── Images column ── */}
                <div className="social-images-col">
                    {APP_IMGS.map((img, i) => (
                        <div key={i} className="social-img-wrap">
                            <Image
                                src={img.src}
                                alt={img.label}
                                fill
                                style={{ objectFit: "cover", objectPosition: "center top" }}
                                sizes="(max-width: 768px) 72vw, 25vw"
                            />
                            {/* Gradient overlay */}
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.8) 100%)",
                            }} />
                            {/* Label */}
                            <div style={{
                                position: "absolute", bottom: "16px", left: 0, right: 0,
                                textAlign: "center", zIndex: 2, padding: "0 12px",
                            }}>
                                <span style={{
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    letterSpacing: ".16em",
                                    textTransform: "uppercase",
                                    color: "#fff",
                                }}>
                                    {img.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </section>
        </>
    );
}
