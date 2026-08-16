import Link from "next/link";
import Image from "next/image";

// FashionNova layout: 1 large feature card on the left spanning all rows,
// 3 columns × 4 rows of smaller category cards on the right.
// We have: Dresses (feature), then Matching Sets, Tops, Bottoms, Athleisure, Gift Shop,
// Shoes, Accessories — 12 total slots (3×4).
const FEATURE = {
    label: "Dresses",
    sub: "Shop Dresses →",
    href: "/category/dresses",
    img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-8.png",
};

const GRID_CARDS = [
    { label: "Matching Sets", href: "/category/matching-sets", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png" },
    { label: "Bottoms", href: "/category/bottoms", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-22.png" },
    { label: "Jeans", href: "/category/bottoms", img: null },
    { label: "Tops", href: "/category/tops", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-17.png" },
    { label: "Shoes", href: "/category/shoes", img: null },
    { label: "Accessories", href: "/category/accessories", img: null },
    { label: "Athleisure", href: "/category/athleisure-loungewear", img: null },
    { label: "Lingerie", href: "/category/lingerie", img: null },
    { label: "Gift Shop", href: "/category/gift-shop", img: null },
    { label: "New Arrivals", href: "/new-in", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg" },
    { label: "Sale", href: "/sale", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-93.jpeg" },
    { label: "Shop All", href: "/shop", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-90.jpeg" },
];

export default function CategoryGrid() {
    return (
        <section style={{ padding: "40px 20px 48px" }}>
            <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: "#000",
                marginBottom: "20px",
            }}>
                Shop By Category
            </h2>

            <div className="cat-fn-grid">
                {/* Feature card — spans all 4 rows on the left */}
                <Link
                    href={FEATURE.href}
                    className="cat-fn-feature"
                    style={{ position: "relative", overflow: "hidden", display: "block", textDecoration: "none" }}
                >
                    <div style={{ width: "100%", height: "100%", minHeight: "520px", position: "relative", background: "#1a1a2e" }}>
                        {FEATURE.img && (
                            <Image
                                src={FEATURE.img}
                                alt={FEATURE.label}
                                fill
                                style={{ objectFit: "cover", objectPosition: "top center" }}
                                sizes="(max-width: 768px) 100vw, 30vw"
                                priority
                            />
                        )}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 18px", zIndex: 2 }}>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "6px" }}>
                                {FEATURE.label}
                            </span>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", textDecoration: "underline" }}>
                                {FEATURE.sub}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* 3×4 grid of smaller cards */}
                {GRID_CARDS.map((cat) => (
                    <Link
                        key={cat.href + cat.label}
                        href={cat.href}
                        className="cat-fn-card"
                        style={{ position: "relative", overflow: "hidden", display: "block", textDecoration: "none" }}
                    >
                        <div style={{ width: "100%", height: "100%", minHeight: "120px", position: "relative", background: "#1a1a1a" }}>
                            {cat.img ? (
                                <Image
                                    src={cat.img}
                                    alt={cat.label}
                                    fill
                                    style={{ objectFit: "cover", objectPosition: "top center" }}
                                    sizes="(max-width: 768px) 50vw, 18vw"
                                />
                            ) : (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a1a2e,#2a2a3e)" }}>
                                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "48px", fontWeight: 900, color: "rgba(255,255,255,.06)", textTransform: "uppercase" }}>
                                        {cat.label.slice(0, 2)}
                                    </span>
                                </div>
                            )}
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 55%)" }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px", zIndex: 2 }}>
                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff" }}>
                                    {cat.label}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
