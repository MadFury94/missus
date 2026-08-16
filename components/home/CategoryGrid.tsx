import Link from "next/link";
import Image from "next/image";

// FashionNova layout: 1 tall card left (spans 2 rows) + 2×2 grid right = 5 cards total
// Only categories with real product images
const FEATURE = {
    label: "Dresses",
    href: "/category/dresses",
    img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-8.png",
};

const GRID = [
    {
        label: "Matching Sets",
        href: "/category/matching-sets",
        img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png",
    },
    {
        label: "Bottoms",
        href: "/category/bottoms",
        img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-22.png",
    },
    {
        label: "Tops",
        href: "/category/tops",
        img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-17.png",
    },
    {
        label: "New Arrivals",
        href: "/new-in",
        img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg",
    },
];

const labelStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "14px",
    left: "16px",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "16px",
    fontWeight: 800,
    letterSpacing: ".04em",
    textTransform: "uppercase",
    color: "#fff",
    zIndex: 2,
    textShadow: "0 1px 6px rgba(0,0,0,.4)",
};

const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,.52) 0%, transparent 55%)",
    zIndex: 1,
};

export default function CategoryGrid() {
    return (
        <section style={{ padding: "0 0 0" }}>
            {/* Section heading */}
            <div style={{ padding: "36px 20px 16px" }}>
                <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: "#000",
                }}>
                    Shop By Category
                </h2>
            </div>

            {/* Grid — matches FashionNova exactly */}
            <div className="shopcat-grid">

                {/* Feature card — tall, spans 2 rows */}
                <Link href={FEATURE.href} className="shopcat-feature" style={{ position: "relative", overflow: "hidden", display: "block", textDecoration: "none", height: "100%" }}>
                    <Image
                        src={FEATURE.img}
                        alt={FEATURE.label}
                        fill
                        style={{ objectFit: "cover", objectPosition: "top center" }}
                        sizes="(max-width: 768px) 100vw, 35vw"
                        priority
                    />
                    <div style={overlayStyle} />
                    <span style={labelStyle}>{FEATURE.label}</span>
                </Link>

                {/* 4 smaller cards — 2 rows × 2 cols */}
                {GRID.map((cat) => (
                    <Link
                        key={cat.label}
                        href={cat.href}
                        className="shopcat-card"
                        style={{ position: "relative", overflow: "hidden", display: "block", textDecoration: "none", height: "100%" }}
                    >
                        <Image
                            src={cat.img}
                            alt={cat.label}
                            fill
                            style={{ objectFit: "cover", objectPosition: "top center" }}
                            sizes="(max-width: 768px) 50vw, 22vw"
                        />
                        <div style={overlayStyle} />
                        <span style={{ ...labelStyle, fontSize: "14px" }}>{cat.label}</span>
                    </Link>
                ))}
            </div>

            <style>{`
                .shopcat-grid {
                    display: grid;
                    /* Feature ~35% wide, two equal columns fill the rest */
                    grid-template-columns: 1.6fr 1fr 1fr;
                    /* 2 equal rows */
                    grid-template-rows: repeat(2, 280px);
                    gap: 4px;
                    padding: 0 20px 32px;
                    /* Stretch children to fill their cells */
                    align-items: stretch;
                }
                .shopcat-feature {
                    grid-column: 1;
                    grid-row: 1 / span 2;
                    /* Must be 100% tall to give next/image fill something to measure */
                    height: 100%;
                    min-height: 560px;
                }
                .shopcat-card {
                    grid-column: auto;
                    grid-row: auto;
                    height: 100%;
                    min-height: 280px;
                }
                /* Hover zoom */
                .shopcat-feature img,
                .shopcat-card img {
                    transition: transform .4s ease;
                }
                .shopcat-feature:hover img,
                .shopcat-card:hover img {
                    transform: scale(1.04);
                }
                /* Mobile: 2 columns, feature full-width on top */
                @media (max-width: 768px) {
                    .shopcat-grid {
                        grid-template-columns: 1fr 1fr;
                        grid-template-rows: 260px repeat(2, 180px);
                        padding: 0 12px 24px;
                    }
                    .shopcat-feature {
                        grid-column: 1 / span 2;
                        grid-row: 1;
                        min-height: 260px;
                    }
                    .shopcat-card {
                        min-height: 180px;
                    }
                }
            `}</style>
        </section>
    );
}
