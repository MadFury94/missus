import Link from "next/link";
import { getCategoryImageUrl } from "@/lib/api-helpers";

/**
 * Two-panel promo section.
 *
 * Structure (top to bottom):
 *   1. Scrolling marquee strip  ← sits between CategoryGrid above and the cards
 *   2. Padded card row          ← left card wider (3fr), right narrower (2fr),
 *                                  SAME HEIGHT, rounded corners, image-only
 *
 * No text is injected onto the cards — text/overlays live inside the images.
 */
export default function WideBanner() {
    const CARD_HEIGHT = 360; // px — both cards share this exact height on desktop
    const CARD_HEIGHT_MOBILE = 220; // px — on mobile cards stack and use this height

    const marqueeText = "Shop into style  ·  Express your love  ·  Treat yourself  ·  New drops weekly  ·  Find your look  ·  Shop into style  ·  Express your love  ·  Treat yourself  ·  New drops weekly  ·  Find your look  ·  ";

    return (
        <section aria-label="Promotions">

            {/* ── Marquee strip (separator between CategoryGrid and cards) ── */}
            <div style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                padding: "11px 0",
                background: "#fff",
                borderTop: "1px solid #ebebeb",
                borderBottom: "1px solid #ebebeb",
            }}>
                <span
                    aria-hidden="true"
                    style={{
                        display: "inline-block",
                        animation: "wb-marquee 30s linear infinite",
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        fontSize: "10px",
                        letterSpacing: ".16em",
                        textTransform: "uppercase",
                        color: "#aaa",
                        paddingLeft: "100%",
                    }}
                >
                    {marqueeText}
                </span>
            </div>

            {/* ── Cards container ── */}
            <div style={{
                background: "#f5f3f0",
                padding: "16px",
            }}>
                <div
                    className="wb-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "3fr 2fr",
                        gap: "10px",
                        maxWidth: "1400px",
                        margin: "0 auto",
                        /* height is set on children so both stretch equally */
                    }}
                >
                    {/* Left card — wider */}
                    <Link
                        href="/sale"
                        className="wb-card"
                        style={{
                            display: "block",
                            borderRadius: "10px",
                            overflow: "hidden",
                            textDecoration: "none",
                            position: "relative",
                            height: `${CARD_HEIGHT}px`,
                            background: "#e0ddd8",
                            flexShrink: 0,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={getCategoryImageUrl("Product-Photos-93.jpeg")}
                            alt="Sale promotion"
                            className="wb-img"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center 20%",
                                display: "block",
                                transition: "transform .5s ease",
                            }}
                        />
                    </Link>

                    {/* Right card — narrower, same height */}
                    <Link
                        href="/new-in"
                        className="wb-card"
                        style={{
                            display: "block",
                            borderRadius: "10px",
                            overflow: "hidden",
                            textDecoration: "none",
                            position: "relative",
                            height: `${CARD_HEIGHT}px`,
                            background: "#e8e5e0",
                            flexShrink: 0,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={getCategoryImageUrl("Product-Photos-Your-Story-8.png")}
                            alt="New arrivals promotion"
                            className="wb-img"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center top",
                                display: "block",
                                transition: "transform .5s ease",
                            }}
                        />
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes wb-marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                .wb-card:hover .wb-img {
                    transform: scale(1.03);
                }
                @media (max-width: 640px) {
                    .wb-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .wb-card {
                        height: ${CARD_HEIGHT_MOBILE}px !important;
                    }
                }
            `}</style>
        </section>
    );
}
