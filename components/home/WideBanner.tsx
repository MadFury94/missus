import Link from "next/link";
import Image from "next/image";

export default function WideBanner() {
    return (
        <Link href="/sale" style={{ display: "block", textDecoration: "none" }}>
            <div style={{
                position: "relative",
                width: "100%",
                height: "clamp(130px, 18vw, 200px)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
                gap: "10px",
            }}>
                {/* Background product image */}
                <Image
                    src="https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-93.jpeg"
                    alt=""
                    fill
                    style={{ objectFit: "cover", objectPosition: "center 20%" }}
                    sizes="100vw"
                    aria-hidden="true"
                />

                {/* Dark overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.35) 100%)", pointerEvents: "none" }} />

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
                }}>
                    Shop Now
                </span>
            </div>
        </Link>
    );
}
