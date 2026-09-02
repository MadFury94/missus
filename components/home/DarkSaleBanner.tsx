import Link from "next/link";
import Image from "next/image";

export default function DarkSaleBanner() {
    return (
        <Link href="/sale" style={{ display: "block" }}>
            <div style={{ position: "relative", textAlign: "center", padding: "48px 20px", cursor: "pointer", overflow: "hidden", minHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Background */}
                <Image
                    src="https://missusoutfits.com/wp-content/uploads/2026/02/CFA10BC2-194D-40E4-AA22-207DB5DE17BA.jpg"
                    alt="Sale"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center 30%" }}
                    sizes="100vw"
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)" }} />

                {/* Ghost text */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "200px", fontWeight: 900, color: "rgba(255,255,255,.03)", letterSpacing: "-.05em", overflow: "hidden", userSelect: "none" }}>
                    SALE
                </div>

                <div style={{ position: "relative", zIndex: 2 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7F0E12", marginBottom: "10px" }}>
                        Limited Time Offer
                    </p>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(48px,8vw,100px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: .9, letterSpacing: "-.02em" }}>
                        UP TO 60%<br /><span style={{ color: "#7F0E12" }}>OFF SITEWIDE</span>
                    </h2>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", marginTop: "12px" }}>
                        MissusDeals  prices as marked. While stocks last.
                    </p>
                    <button style={{ marginTop: "24px", background: "#7F0E12", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: "none", cursor: "pointer", padding: "15px 40px", fontSize: "14px" }}>
                        Shop Sale Now
                    </button>
                </div>
            </div>
        </Link>
    );
}
