import Link from "next/link";
import Image from "next/image";

export default function SaleBanner() {
    return (
        <Link href="/sale" style={{ display: "block", textDecoration: "none" }}>
            <div style={{ position: "relative", background: "#000", overflow: "hidden", minHeight: "200px", display: "flex", alignItems: "center" }}>
                {/* Background texture */}
                <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }} />

                {/* Red accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: "#e8002d" }} />

                <div style={{ position: "relative", zIndex: 2, padding: "40px 48px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
                    {/* Left: text */}
                    <div>
                        <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#e8002d", marginBottom: "8px" }}>
                            Limited Time · MissusDeals
                        </p>
                        <div style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(52px, 8vw, 96px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-.01em" }}>
                            <span style={{ color: "#fff", display: "block" }}>UP TO 60%</span>
                            <span style={{ color: "#e8002d", display: "block" }}>OFF SITEWIDE</span>
                        </div>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", marginTop: "12px", fontWeight: 300 }}>
                            Prices as marked. While stocks last. Don&apos;t sleep on it.
                        </p>
                    </div>

                    {/* Right: CTA + product pills */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {[
                                { src: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-94.jpeg", label: "Tops" },
                                { src: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-1.jpeg", label: "Dresses" },
                                { src: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-22.png", label: "Bottoms" },
                            ].map((pill) => (
                                <div key={pill.label} style={{ width: "72px", height: "110px", borderRadius: "60px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,.15)", position: "relative", flexShrink: 0 }}>
                                    <Image src={pill.src} alt={pill.label} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="72px" />
                                </div>
                            ))}
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e8002d", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "13px 32px", fontSize: "13px" }}>
                            Shop Sale Now →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
