import Link from "next/link";
import Image from "next/image";

const TREND_CARDS = [
    {
        title: "Rodeo Ready",
        href: "/category/dresses",
        img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-96.jpeg",
    },
    {
        title: "Prom Queen Energy",
        href: "/category/dresses",
        img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg",
    },
    {
        title: "Aries Behavior",
        href: "/category/matching-sets",
        img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png",
    },
    {
        title: "Wife of the Party",
        href: "/category/dresses",
        img: "https://missusoutfits.com/wp-content/uploads/2026/03/Leila-Halter-Mini-Dress.jpg",
    },
];

export default function TrendReportCards() {
    return (
        <div style={{ background: "#fff", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                {/* Section Header */}
                <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "28px",
                    fontWeight: 900,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    marginBottom: "24px",
                    color: "#000"
                }}>
                    THE TREND REPORT
                </h2>

                {/* 4 Cards Grid */}
                <div className="trend-report-cards">
                    {TREND_CARDS.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            style={{
                                position: "relative",
                                aspectRatio: "3/4",
                                overflow: "hidden",
                                background: "#f5f5f5",
                                display: "block",
                                textDecoration: "none"
                            }}
                        >
                            {/* Image */}
                            <Image
                                src={card.img}
                                alt={card.title}
                                fill
                                style={{ objectFit: "cover", objectPosition: "top center" }}
                                sizes="25vw"
                            />

                            {/* Overlay */}
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)"
                            }} />

                            {/* Text */}
                            <div style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: "20px",
                                zIndex: 2
                            }}>
                                <div style={{
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    color: "#fff",
                                    marginBottom: "8px",
                                    lineHeight: 1.2
                                }}>
                                    {card.title}
                                </div>
                                <div style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}>
                                    <span>→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
