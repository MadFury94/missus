import Image from "next/image";
import Link from "next/link";

// Real Missus product images
const LEFT_IMG = "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg";
const RIGHT_IMG = "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-90.jpeg";

export default function HeroBanner() {
    return (
        <div style={{ position: "relative", background: "#111", minHeight: "520px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
            {/* Split background with real product images */}
            <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "55% 45%" }}>
                <div style={{ position: "relative", overflow: "hidden" }}>
                    <Image src={LEFT_IMG} alt="Spring Collection" fill style={{ objectFit: "cover", objectPosition: "top center" }} loading="eager" preload sizes="55vw" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(0,0,0,.4) 100%)" }} />
                </div>
                <div style={{ position: "relative", overflow: "hidden" }}>
                    <Image src={RIGHT_IMG} alt="New Arrivals" fill style={{ objectFit: "cover", objectPosition: "top center" }} loading="eager" sizes="45vw" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 60%, rgba(0,0,0,.4) 100%)" }} />
                </div>
            </div>

            {/* Dark overlay for text readability */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.15) 55%,transparent 100%)", zIndex: 2 }} />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 3, padding: "40px 40px 50px", width: "100%" }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7F0E12", marginBottom: "10px" }}>
                    Spring / Summer 2026
                </p>
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(60px,8vw,110px)", fontWeight: 900, letterSpacing: "-.01em", textTransform: "uppercase", color: "#fff", lineHeight: .9, marginBottom: "16px" }}>
                    Dress Like<br /><span style={{ color: "#7F0E12" }}>Her.</span>
                </h1>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,.75)", fontWeight: 300, marginBottom: "28px", maxWidth: "420px", lineHeight: 1.6 }}>
                    Trend-forward, affordable fashion for the modern Nigerian girl. From Lagos to Abuja  we deliver style to your door.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "#000", color: "#fff", padding: "13px 28px", fontSize: "13px" }}>
                        Shop Women
                    </Link>
                    <Link href="/category/whats-new" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: "#fff", color: "#000", padding: "13px 28px", fontSize: "13px", border: "1.5px solid #000" }}>
                        What&apos;s New
                    </Link>
                </div>
            </div>

            {/* Sale badge */}
            <div style={{ position: "absolute", top: "30px", right: "30px", zIndex: 3, background: "#7F0E12", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", padding: "12px 20px", textAlign: "center", lineHeight: 1.3 }}>
                UP TO<br /><span style={{ fontSize: "22px" }}>60%</span><br />OFF SALE
            </div>
        </div>
    );
}
