import Link from "next/link";
import Image from "next/image";

export default function GiftShopBanner() {
    return (
        <Link
            href="/category/gift-shop"
            style={{ display: "block", textDecoration: "none" }}
        >
            <div style={{
                position: "relative",
                width: "100%",
                minHeight: "340px",
                background: "linear-gradient(110deg, #0a0a0a 0%, #1a1a1a 55%, #2a1a0a 100%)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
            }}>
                {/* Subtle warm texture overlay */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at 70% 50%, rgba(212,160,60,0.08) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />

                {/* Gold accent line — left edge */}
                <div style={{
                    position: "absolute", left: 0, top: "15%", bottom: "15%",
                    width: "3px",
                    background: "linear-gradient(to bottom, transparent, #c9923a, transparent)",
                }} />

                {/* Text content */}
                <div style={{
                    position: "relative", zIndex: 2,
                    padding: "clamp(32px, 5vw, 72px)",
                    maxWidth: "520px",
                }}>
                    <p style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(10px, 1vw, 12px)",
                        fontWeight: 500,
                        letterSpacing: ".35em",
                        textTransform: "uppercase",
                        color: "#c9923a",
                        marginBottom: "14px",
                    }}>
                        Curated Picks
                    </p>
                    <h2 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(52px, 7vw, 96px)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#fff",
                        lineHeight: 0.88,
                        letterSpacing: "-.02em",
                        marginBottom: "28px",
                    }}>
                        Gift<br />Shop
                    </h2>
                    <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: ".18em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.6)",
                        borderBottom: "1px solid rgba(201,146,58,0.5)",
                        paddingBottom: "3px",
                        transition: "color .2s",
                    }}>
                        Shop Now →
                    </span>
                </div>

                {/* Gift image — positioned as a design element, right-anchored */}
                <div style={{
                    position: "absolute",
                    right: "clamp(-20px, 2vw, 40px)",
                    bottom: 0,
                    height: "95%",
                    aspectRatio: "1/1",
                    pointerEvents: "none",
                }}>
                    <Image
                        src="/missus-giftbox.png"
                        alt=""
                        fill
                        style={{ objectFit: "contain", objectPosition: "bottom right" }}
                        sizes="(max-width: 768px) 60vw, 40vw"
                        priority
                        aria-hidden="true"
                    />
                </div>

                {/* Fade-in from left — keeps gifts from bleeding into text on small screens */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, #0a0a0a 0%, #0a0a0a 28%, transparent 55%)",
                    pointerEvents: "none",
                    zIndex: 1,
                }} />
            </div>
        </Link>
    );
}
