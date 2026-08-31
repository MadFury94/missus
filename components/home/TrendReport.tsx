import Link from "next/link";
import Image from "next/image";

// Real Missus product images for trend cards
const TREND_CARDS = [
    {
        label: "Night Out",
        title: "Club Night\nEnergy",
        href: "/category/dresses",
        img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-96.jpeg",
    },
    {
        label: "Resort Escape",
        title: "Resort\nEscape",
        href: "/category/dresses",
        img: "https://missusoutfits.com/wp-content/uploads/2026/03/Leila-Halter-Mini-Dress.jpg",
    },
    {
        label: "Spring Sets",
        title: "Spring\nEssentials",
        href: "/category/matching-sets",
        img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png",
    },
    {
        label: "Prom Queen",
        title: "Prom Queen\nEnergy",
        href: "/category/dresses",
        img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg",
    },
];

export default function TrendReport() {
    return (
        <div style={{ padding: "24px 20px" }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "16px", borderLeft: "4px solid #630D13", paddingLeft: "12px" }}>
                THE TREND REPORT
            </h2>
            <div className="trend-grid">
                {TREND_CARDS.map((card) => (
                    <Link key={card.href + card.label} href={card.href} style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#f0ece8", cursor: "pointer", display: "block" }}>
                        <Image
                            src={card.img}
                            alt={card.label}
                            fill
                            style={{ objectFit: "cover", objectPosition: "top center" }}
                            sizes="25vw"
                        />
                        {/* Gradient overlay */}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.78) 100%)" }} />
                        {/* Text */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 14px", zIndex: 2 }}>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff", lineHeight: 1.1, marginBottom: "8px", whiteSpace: "pre-line" }}>
                                {card.title}
                            </div>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff", textDecoration: "underline" }}>
                                Shop Now →
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
