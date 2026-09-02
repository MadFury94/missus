"use client";
import Link from "next/link";
import Image from "next/image";

export default function CategoryHeroImage() {
    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "85vh",
            maxHeight: "900px",
            minHeight: "500px",
            overflow: "hidden",
            background: "#000"
        }}>
            {/* Full-Width HD Background Image - Show Full Image */}
            <Image
                src="/missus-hero.png"
                alt="Missus Fashion Collection"
                fill
                loading="eager"
                preload
                quality={100}
                style={{
                    objectFit: "cover", // Cover to fill space
                    objectPosition: "center top" // Show from top to get full outfit and head
                }}
                sizes="100vw"
            />

            {/* Subtle Overlay for Text Readability */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)",
                zIndex: 1,
                pointerEvents: "none"
            }} />

            {/* Large Text Overlay - Fashion Nova Style */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "0 20px",
                color: "#fff"
            }}>
                {/* Small Text Above */}
                <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(16px, 2vw, 24px)",
                    fontWeight: 600,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                    textShadow: "0 2px 20px rgba(0,0,0,0.5)"
                }}>
                    UP TO
                </p>

                {/* Large Main Text */}
                <h1 style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(60px, 12vw, 140px)",
                    fontWeight: 900,
                    letterSpacing: ".02em",
                    textTransform: "uppercase",
                    lineHeight: 0.9,
                    marginBottom: "20px",
                    textShadow: "0 4px 30px rgba(0,0,0,0.6)",
                    maxWidth: "1200px"
                }}>
                    90% OFF SITEWIDE
                </h1>

                {/* Shop Now Link */}
                <Link
                    href="/shop"
                    style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "clamp(18px, 2.5vw, 28px)",
                        fontWeight: 600,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        color: "#fff",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "8px",
                        textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                        transition: "all 0.3s"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(8px)";
                        e.currentTarget.style.textShadow = "0 4px 30px rgba(255,255,255,0.8)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.textShadow = "0 2px 20px rgba(0,0,0,0.5)";
                    }}
                >
                    Shop Now
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>

                {/* Small Disclaimer Text */}
                <p style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "clamp(10px, 1.2vw, 13px)",
                    fontWeight: 400,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginTop: "24px",
                    opacity: 0.9,
                    textShadow: "0 1px 10px rgba(0,0,0,0.5)"
                }}>
                    PRICES AS MARKED. T&CS APPLY
                </p>
            </div>

            {/* Shop Now Button (Bottom) */}
            <div style={{
                position: "absolute",
                bottom: "60px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 3
            }}>
                <Link
                    href="/shop"
                    style={{
                        background: "#fff",
                        color: "#000",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "16px",
                        fontWeight: 700,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        padding: "16px 48px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all .3s",
                        textDecoration: "none",
                        display: "inline-block",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#7F0E12";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 6px 30px rgba(232,0,45,0.5)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                    }}
                >
                    SHOP NOW
                </Link>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    div[style*="bottom: 60px"] {
                        bottom: 40px;
                    }
                }
            `}</style>
        </div>
    );
}
