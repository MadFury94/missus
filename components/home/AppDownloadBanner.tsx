"use client";
import Image from "next/image";

const APP_IMGS = [
    "/missus_circle.WEBP",
    "/missus_circle2.WEBP",
];

export default function AppDownloadBanner() {
    return (
        <>
            <style>{`
                /* Override globals — show phones on mobile */
                @media (max-width: 768px) {
                    .app-phones {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }
                    .app-grid {
                        padding: 32px 16px 16px !important;
                        gap: 24px !important;
                    }
                }
            `}</style>

            <div className="app-grid" style={{ background: "#000", padding: "40px 20px" }}>
                <div>
                    <h2 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 700, textTransform: "uppercase", color: "#fff", lineHeight: .95, letterSpacing: "-.01em", marginBottom: "16px" }}>
                        Follow<br />The IT<br />Girls
                    </h2>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,.6)", marginBottom: "24px", fontWeight: 300, lineHeight: 1.7 }}>
                        New drops, styling inspo and behind-the-scenes content — follow us for daily fashion that hits different.
                    </p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <a
                            href="https://instagram.com/missusoutfits"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ border: "1.5px solid rgba(255,255,255,.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textDecoration: "none", transition: "border-color .2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.8)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.3)")}
                        >
                            <div>
                                <div style={{ fontSize: "9px", color: "rgba(255,255,255,.5)", letterSpacing: ".1em", textTransform: "uppercase" }}>Follow us on</div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: ".04em" }}>Instagram</div>
                            </div>
                        </a>
                        <a
                            href="https://tiktok.com/@missusoutfits"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ border: "1.5px solid rgba(255,255,255,.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textDecoration: "none", transition: "border-color .2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.8)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.3)")}
                        >
                            <div>
                                <div style={{ fontSize: "9px", color: "rgba(255,255,255,.5)", letterSpacing: ".1em", textTransform: "uppercase" }}>Watch us on</div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: ".04em" }}>TikTok</div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Product images as phone-style cards */}
                <div className="app-phones">
                    {APP_IMGS.map((src, i) => (
                        <div key={i} style={{ aspectRatio: "9/16", position: "relative", overflow: "hidden", border: "1px solid #333", borderRadius: "12px", marginTop: i === 1 ? "24px" : 0 }}>
                            <Image src={src} alt="Missus" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="(max-width: 768px) 45vw, 20vw" />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 70%, rgba(0,0,0,.6) 100%)" }} />
                            <div style={{ position: "absolute", bottom: "12px", left: 0, right: 0, textAlign: "center" }}>
                                <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>
                                    {i === 0 ? "New Drops Daily" : "Shop Now"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
