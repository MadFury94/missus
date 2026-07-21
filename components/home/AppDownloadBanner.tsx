import Image from "next/image";

const APP_IMGS = [
    "https://missusoutfits.com/wp-content/uploads/2026/03/Lexi-Pu-Leather-Top.jpg",
    "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-90.jpeg",
];

export default function AppDownloadBanner() {
    return (
        <div className="app-grid" style={{ background: "#000", padding: "40px 20px" }}>
            <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: .95, letterSpacing: "-.01em", marginBottom: "16px" }}>
                    FOLLOW<br />THE IT<br />GIRLS
                </h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,.6)", marginBottom: "24px", fontWeight: 300, lineHeight: 1.7 }}>
                    New drops, styling inspo and behind-the-scenes content — follow us for daily fashion that hits different.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <a
                        href="https://instagram.com/missusoutfits"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ border: "1.5px solid rgba(255,255,255,.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textDecoration: "none" }}
                    >
                        <div>
                            <div style={{ fontSize: "9px", color: "rgba(255,255,255,.6)", letterSpacing: ".1em", textTransform: "uppercase" }}>Follow us on</div>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: ".04em" }}>Instagram</div>
                        </div>
                    </a>
                    <a
                        href="https://tiktok.com/@missusoutfits"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ border: "1.5px solid rgba(255,255,255,.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textDecoration: "none" }}
                    >
                        <div>
                            <div style={{ fontSize: "9px", color: "rgba(255,255,255,.6)", letterSpacing: ".1em", textTransform: "uppercase" }}>Watch us on</div>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: ".04em" }}>TikTok</div>
                        </div>
                    </a>
                </div>
            </div>

            {/* Real product images as phone mockups */}
            <div className="app-phones">
                {APP_IMGS.map((src, i) => (
                    <div key={i} style={{ aspectRatio: "9/16", position: "relative", overflow: "hidden", border: "1px solid #333", borderRadius: "12px", marginTop: i === 1 ? "24px" : 0 }}>
                        <Image src={src} alt="Missus App" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="20vw" />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 70%, rgba(0,0,0,.6) 100%)" }} />
                        <div style={{ position: "absolute", bottom: "12px", left: 0, right: 0, textAlign: "center" }}>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>
                                {i === 0 ? "New Drops Daily" : "Shop Now"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
