import Link from "next/link";
import Image from "next/image";

export default function GiftShopBanner() {
    return (
        <Link
            href="/category/gift-shop"
            style={{ display: "block", position: "relative", width: "100%", overflow: "hidden" }}
        >
            {/* Full-bleed image — same proportions as FashionNova formal shop banner */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/6", minHeight: "260px", maxHeight: "480px" }}>
                <Image
                    src="https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg"
                    alt="Gift Shop"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center 20%" }}
                    sizes="100vw"
                    priority
                />
                {/* Dark scrim — stronger on left side so text pops */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to right, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.32) 60%, transparent 100%)",
                }} />

                {/* Text overlay */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    padding: "clamp(24px,5vw,60px)",
                    zIndex: 2,
                }}>
                    <div>
                        <p style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "clamp(10px,1.2vw,13px)",
                            fontWeight: 700,
                            letterSpacing: ".28em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.7)",
                            marginBottom: "10px",
                        }}>
                            Curated Picks
                        </p>
                        <h2 style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "clamp(36px,6vw,80px)",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            color: "#fff",
                            lineHeight: 0.9,
                            letterSpacing: "-.01em",
                            marginBottom: "20px",
                        }}>
                            GIFT<br />SHOP
                        </h2>
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "clamp(11px,1.2vw,13px)",
                            fontWeight: 700,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            color: "#fff",
                            borderBottom: "1.5px solid rgba(255,255,255,0.7)",
                            paddingBottom: "2px",
                            gap: "6px",
                        }}>
                            SHOP NOW →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
