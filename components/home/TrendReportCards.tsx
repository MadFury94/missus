import Link from "next/link";
import Image from "next/image";

interface Card {
    title: string;
    href: string;
    img: string;
}

const DEFAULT_CARDS: Card[] = [
    { title: "Independence Day Ready", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-96.jpeg" },
    { title: "Sugar & Spice", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg" },
    { title: "Night Mode", href: "/category/matching-sets", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png" },
    { title: "Wife of the Party", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Leila-Halter-Mini-Dress.jpg" },
];

export default function TrendReportCards({ cards = DEFAULT_CARDS }: { cards?: Card[] }) {
    return (
        <>
            <style>{`
                /* ── Desktop: 4-column grid ── */
                .style-radar-section {
                    background: #fff;
                    padding: 48px 20px 52px;
                }
                .style-radar-header {
                    max-width: 1400px;
                    margin: 0 auto 28px;
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                }
                .style-radar-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }
                .style-radar-card {
                    position: relative;
                    aspect-ratio: 3/4;
                    overflow: hidden;
                    background: #f0ece8;
                    display: block;
                    text-decoration: none;
                }
                .style-radar-card img {
                    transition: transform .5s ease;
                }
                .style-radar-card:hover img {
                    transform: scale(1.04);
                }

                /* ── Mobile: horizontal snap scroll ── */
                @media (max-width: 768px) {
                    .style-radar-section {
                        padding: 32px 0 28px;
                    }
                    .style-radar-header {
                        padding: 0 16px;
                        margin-bottom: 16px;
                    }
                    .style-radar-grid {
                        display: flex;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                        gap: 0;
                        padding: 0 16px;
                        /* Show peek of next card */
                    }
                    .style-radar-grid::-webkit-scrollbar { display: none; }
                    .style-radar-card {
                        flex: 0 0 68vw;
                        scroll-snap-align: start;
                        aspect-ratio: 3/4;
                        margin-right: 10px;
                    }
                    .style-radar-card:last-child {
                        margin-right: 0;
                    }
                }
            `}</style>

            <section className="style-radar-section">
                <div className="style-radar-header">
                    <h2 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(22px, 3vw, 30px)",
                        fontWeight: 600,
                        letterSpacing: ".02em",
                        textTransform: "uppercase",
                        color: "#000",
                        margin: 0,
                    }}>
                        The Style Radar
                    </h2>
                    <Link href="/shop" style={{
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "#777",
                        textDecoration: "none",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: "1px",
                    }}>
                        View All →
                    </Link>
                </div>

                <div className="style-radar-grid">
                    {cards.map((card) => (
                        <Link key={card.title} href={card.href} className="style-radar-card">
                            <Image
                                src={card.img}
                                alt={card.title}
                                fill
                                style={{ objectFit: "cover", objectPosition: "top center" }}
                                sizes="(max-width: 768px) 68vw, 25vw"
                            />
                            {/* Gradient */}
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,.72) 100%)",
                            }} />
                            {/* Label */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 18px", zIndex: 2 }}>
                                <p style={{
                                    fontFamily: "var(--font-display, 'Cormorant', serif)",
                                    fontSize: "clamp(16px, 2vw, 20px)",
                                    fontWeight: 600,
                                    color: "#fff",
                                    lineHeight: 1.2,
                                    margin: 0,
                                    letterSpacing: ".01em",
                                }}>
                                    {card.title}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
