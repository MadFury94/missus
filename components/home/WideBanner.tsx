import Link from "next/link";
import Image from "next/image";

export default function WideBanner() {
    return (
        <Link href="/sale" style={{ display: "block" }}>
            <div style={{ position: "relative", minHeight: "220px", display: "flex", alignItems: "center", overflow: "hidden", cursor: "pointer" }}>
                {/* Background product image */}
                <Image
                    src="https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-93.jpeg"
                    alt="Sale"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center 20%" }}
                    sizes="100vw"
                />
                {/* Dark overlay */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.72)" }} />
                {/* Pattern */}
                <div style={{ position: "absolute", inset: 0, opacity: .04, backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }} />

                <div style={{ position: "relative", zIndex: 2, padding: "36px 40px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                    <div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".25em", textTransform: "uppercase", color: "#e8002d", marginBottom: "6px" }}>Limited Time</p>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: .95, letterSpacing: "-.01em" }}>
                            UP TO<br />60% OFF
                        </h2>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,.6)", marginTop: "8px", fontWeight: 300 }}>MissusDeals — prices as marked. Don&apos;t sleep on it.</p>
                        <button style={{ marginTop: "16px", background: "#e8002d", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", padding: "11px 24px", fontSize: "12px" }}>
                            Shop Sale Now
                        </button>
                    </div>
                    {/* Product preview pills */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {[
                            { src: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-94.jpeg", label: "Tops" },
                            { src: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-1.jpeg", label: "Dresses" },
                            { src: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-22.png", label: "Bottoms" },
                        ].map((pill) => (
                            <div key={pill.label} style={{ width: "80px", height: "130px", borderRadius: "60px", overflow: "hidden", border: "1.5px solid rgba(255,255,255,.2)", position: "relative", flexShrink: 0 }}>
                                <Image src={pill.src} alt={pill.label} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="80px" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
