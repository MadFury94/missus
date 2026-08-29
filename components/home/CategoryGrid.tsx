import Link from "next/link";
import Image from "next/image";

// 5 categories total — matches FashionNova's layout exactly
// Desktop: 1 tall feature left (spans 2 rows) + 2×2 grid right
// Mobile:  feature full-width top, then 2+2 in two rows below

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

const overlay: React.CSSProperties = {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,.52) 0%, transparent 55%)",
    zIndex: 1,
};

function CatCard({ cat, className, sizes }: {
    cat: { label: string; href: string; img: string };
    className: string;
    sizes: string;
}) {
    return (
        <Link href={cat.href} className={`shopcat-card-base ${className}`}
            style={{ position: "relative", overflow: "hidden", display: "block", textDecoration: "none" }}>
            <Image
                src={cat.img} alt={cat.label} fill
                style={{ objectFit: "cover", objectPosition: "top center" }}
                sizes={sizes}
                className="cat-img"
            />
            <div style={overlay} />
            <span style={{
                position: "absolute", bottom: "14px", left: "16px", zIndex: 2,
                fontFamily: "var(--font-display, 'Cormorant', serif)",
                fontSize: "15px", fontWeight: 600, letterSpacing: ".06em",
                textTransform: "uppercase", color: "#fff",
                textShadow: "0 1px 8px rgba(0,0,0,.5)",
            }}>
                {cat.label}
            </span>
        </Link>
    );
}

export default function CategoryGrid() {
    return (
        <section style={{ padding: "0 0 32px" }}>
            <div style={{ padding: "36px 20px 16px" }}>
                <h2 style={{
                    fontFamily: "var(--font-display, 'Cormorant', serif)",
                    fontSize: "clamp(22px, 3vw, 28px)",
                    fontWeight: 600, letterSpacing: ".02em",
                    textTransform: "uppercase", color: "#000",
                }}>
                    Shop By Category
                </h2>
            </div>

            <div className="shopcat-grid">
                {/* Feature — tall left card */}
                <CatCard cat={FEATURE} className="shopcat-feature" sizes="(max-width: 768px) 100vw, 38vw" />

                {/* 4 right-side cards */}
                {GRID.map((cat, i) => (
                    <CatCard key={cat.label} cat={cat} className={`shopcat-right shopcat-right-${i}`}
                        sizes="(max-width: 768px) 50vw, 31vw" />
                ))}
            </div>

            <style>{`
                /* ── Desktop: FashionNova 3-col layout ──────────────────── */
                /*
                    Col 1 (1.4fr): feature — spans 2 rows
                    Col 2 (1fr):   cards 0 and 2
                    Col 3 (1fr):   cards 1 and 3
                */
                .shopcat-grid {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr 1fr;
                    grid-template-rows: repeat(2, 300px);
                    gap: 4px;
                    padding: 0 20px;
                }
                .shopcat-feature {
                    grid-column: 1;
                    grid-row: 1 / span 2;
                }
                /* Right cards fill their cells */
                .shopcat-right   { min-height: 0; }

                /* Hover zoom */
                .shopcat-card-base:hover .cat-img { transform: scale(1.04); }
                .cat-img { transition: transform .45s ease; }

                /* ── Mobile layout ─────────────────────────────────────── */
                /*
                    Col 1 (left):  Cat 1 tall — spans rows 1+2
                    Col 2 (right): Cat 2 top, Cat 3 bottom (stacked)
                    Row 3:         Cat 4 left + Cat 5 right (equal)
                */
                @media (max-width: 768px) {
                    .shopcat-grid {
                        grid-template-columns: 1fr 1fr;
                        grid-template-rows: auto;
                        gap: 3px;
                        padding: 0;
                    }
                    /* Cat 1: tall, left column, spans 2 rows */
                    .shopcat-feature {
                        grid-column: 1;
                        grid-row: 1 / span 2;
                        min-height: 380px;
                    }
                    /* Cat 2 & Cat 3: stacked in right column */
                    .shopcat-right-0,
                    .shopcat-right-1 {
                        grid-column: 2;
                        min-height: 187px;
                    }
                    /* Cat 4 & Cat 5: full-width 2-col row underneath */
                    .shopcat-right-2,
                    .shopcat-right-3 {
                        grid-column: auto;
                        min-height: 180px;
                    }
                }
            `}</style>
        </section>
    );
}
