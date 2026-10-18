import Link from "next/link";
import type { PromoBandContent } from "@/lib/homepage-content";
import { HOMEPAGE_DEFAULTS } from "@/lib/homepage-content";
import { API_ENDPOINTS } from "@/lib/config";

// Fallback images using the correct CMS media URL from env config
const FALLBACK_LEFT = `${API_ENDPOINTS.assets.categories}/Product-Photos-93.jpeg`;
const FALLBACK_RIGHT = `${API_ENDPOINTS.assets.products}/Product-Photos-Your-Story-8.png`;

// ── Marquee ───────────────────────────────────────────────────────────────────
// Truly infinite: a single long string of repeated items scrolls left/right
// inside an overflow:hidden container. No JS, pure CSS. The string is long
// enough that the end never shows before the loop restarts.

const MARQUEE_ITEMS = ["Glamour Szn", "Miss Us With The Ugly Clothes", "New Drops Weekly"];
// Repeat many times so there's no gap at the end of the translateX journey
const MARQUEE_TEXT = Array(12).fill(MARQUEE_ITEMS.join("\u00A0\u00A0\u00A0\u00A0\u2022\u00A0\u00A0\u00A0\u00A0")).join("");

function MarqueeStrip({ reverse }: { reverse?: boolean }) {
    return (
        <div
            aria-hidden="true"
            style={{ overflow: "hidden", height: "38px", display: "flex", alignItems: "center" }}
        >
            <span
                className={reverse ? "pb-marquee-right" : "pb-marquee-left"}
                style={{
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    color: "#444",
                    willChange: "transform",
                }}
            >
                {MARQUEE_TEXT}
            </span>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
    band?: PromoBandContent;
}

export default function PromoBand({ band }: Props) {
    const defaults = HOMEPAGE_DEFAULTS.promoBand;
    const b = {
        leftImg: band?.leftImg?.trim() || FALLBACK_LEFT,
        leftHref: band?.leftHref?.trim() || defaults.leftHref,
        leftAlt: band?.leftAlt?.trim() || defaults.leftAlt,
        rightImg: band?.rightImg?.trim() || FALLBACK_RIGHT,
        rightHref: band?.rightHref?.trim() || defaults.rightHref,
        rightAlt: band?.rightAlt?.trim() || defaults.rightAlt,
    };

    return (
        <section aria-label="Promotions" style={{ background: "#f7f4f1", paddingTop: "40px", paddingBottom: "40px" }}>
            <style>{`
                /* ── Keyframes ── */
                @keyframes pb-left {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                @keyframes pb-right {
                    from { transform: translateX(-50%); }
                    to   { transform: translateX(0); }
                }
                .pb-marquee-left  { animation: pb-left  36s linear infinite; }
                .pb-marquee-right { animation: pb-right 36s linear infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .pb-marquee-left,
                    .pb-marquee-right { animation-play-state: paused !important; }
                }
                .pb-strip:hover .pb-marquee-left,
                .pb-strip:hover .pb-marquee-right { animation-play-state: paused; }

                /* ── Grid ── */
                .pb-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 2%;
                    padding: 0 4%;
                    margin: 10px 0;
                }

                /* ── Cards ── */
                .pb-card {
                    position: relative;
                    display: block;
                    overflow: hidden;
                    text-decoration: none;
                    cursor: pointer;
                    background: #e8e5e0;
                }
                .pb-card-left  { aspect-ratio: 2 / 1; }
                .pb-card-right { aspect-ratio: 1 / 1; }

                .pb-card-img {
                    transition: transform 0.4s ease !important;
                }
                .pb-card:hover .pb-card-img {
                    transform: scale(1.04) !important;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .pb-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .pb-card-left,
                    .pb-card-right {
                        aspect-ratio: 16 / 10;
                    }
                    .pb-marquee-left,
                    .pb-marquee-right {
                        font-size: 12px;
                    }
                }
            `}</style>

            {/* Top strip */}
            <div className="pb-strip" style={{ padding: "0 4%" }}>
                <MarqueeStrip />
            </div>

            {/* Cards */}
            <div className="pb-grid">

                {/* Left — wider (2:1) */}
                <Link href={b.leftHref} className="pb-card pb-card-left" aria-label={b.leftAlt}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={b.leftImg}
                        alt={b.leftAlt}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center 20%",
                            transition: "transform 0.4s ease",
                            display: "block",
                        }}
                        className="pb-card-img"
                    />
                </Link>

                {/* Right — narrower (1:1) */}
                <Link href={b.rightHref} className="pb-card pb-card-right" aria-label={b.rightAlt}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={b.rightImg}
                        alt={b.rightAlt}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center top",
                            transition: "transform 0.4s ease",
                            display: "block",
                        }}
                        className="pb-card-img"
                    />
                </Link>

            </div>

            {/* Bottom strip — opposite direction */}
            <div className="pb-strip" style={{ padding: "0 4%" }}>
                <MarqueeStrip reverse />
            </div>

        </section>
    );
}
