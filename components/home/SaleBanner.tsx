import Link from "next/link";

export default function SaleBanner() {
    return (
        <Link href="/sale" style={{ display: "block", textDecoration: "none" }}>
            <div style={{
                position: "relative",
                width: "100%",
                height: "clamp(130px, 18vw, 200px)",
                background: "#111",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
                gap: "10px",
            }}>
                {/* Subtle full-bleed texture */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.018) 0px, rgba(255,255,255,.018) 1px, transparent 1px, transparent 12px)",
                    pointerEvents: "none",
                }} />

                {/* Headline */}
                <p style={{
                    fontFamily: "var(--font-display, 'Cormorant', serif)",
                    fontSize: "clamp(28px, 5.5vw, 58px)",
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    color: "#fff",
                    lineHeight: 1,
                    position: "relative",
                    zIndex: 1,
                    margin: 0,
                }}>
                    Up to 60% Off Sale
                </p>

                {/* CTA */}
                <span style={{
                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.55)",
                    borderBottom: "1px solid rgba(255,255,255,.3)",
                    paddingBottom: "2px",
                    position: "relative",
                    zIndex: 1,
                    transition: "color .2s",
                }}>
                    Shop Now
                </span>
            </div>
        </Link>
    );
}
