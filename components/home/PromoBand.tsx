import Link from "next/link";
import Image from "next/image";
import { FREE_SHIPPING_THRESHOLD, CURRENCY_SYMBOL, API_ENDPOINTS } from "@/lib/config";

// ── helpers ──────────────────────────────────────────────────────────────────

const SALE_IMG = `${API_ENDPOINTS.assets.categories}/Product-Photos-93.jpeg`;
const SHIP_IMG = `${API_ENDPOINTS.assets.products}/Product-Photos-Your-Story-8.png`;

/** Format threshold without decimals, e.g. 150000 → "150,000" */
function fmtThreshold(n: number) {
    return n.toLocaleString("en-NG");
}

const THRESHOLD = `${CURRENCY_SYMBOL}${fmtThreshold(FREE_SHIPPING_THRESHOLD)}`;

// ── marquee text ─────────────────────────────────────────────────────────────

const ITEMS = ["Glamour Szn", "Miss Us With The Ugly Clothes", "New Drops Weekly"];
// Build one full loop worth of text for the seamless CSS duplicate trick
const MARQUEE_CONTENT = ITEMS.map((t) => (
    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
        {t}
        <span aria-hidden="true" style={{ display: "inline-block", width: "5em" }} />
    </span>
));

function MarqueeRow({ reverse }: { reverse?: boolean }) {
    return (
        <div
            aria-hidden="true"
            style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                height: "38px",
                display: "flex",
                alignItems: "center",
            }}
        >
            {/* Two identical spans = seamless loop */}
            {[0, 1].map((idx) => (
                <span
                    key={idx}
                    style={{
                        display: "inline-block",
                        animation: `promo-marquee-${reverse ? "right" : "left"} 34s linear infinite`,
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        color: "#444",
                        willChange: "transform",
                    }}
                    className="promo-marquee-span"
                >
                    {MARQUEE_CONTENT}
                </span>
            ))}
        </div>
    );
}

// ── main component ────────────────────────────────────────────────────────────

export default function PromoBand() {
    return (
        <section
            aria-label="Promotions"
            style={{
                background: "#f7f4f1",
                paddingTop: "40px",
                paddingBottom: "40px",
            }}
        >
            {/* ── CSS ── */}
            <style>{`
                @keyframes promo-marquee-left {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes promo-marquee-right {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .promo-marquee-span { animation-play-state: paused !important; }
                }
                .promo-marquee-row:hover .promo-marquee-span {
                    animation-play-state: paused;
                }
                /* Cards grid */
                .promo-band-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 2%;
                    padding: 0 4%;
                }
                /* Left card: 2:1 landscape */
                .promo-card-left {
                    aspect-ratio: 2 / 1;
                }
                /* Right card: 1:1 square */
                .promo-card-right {
                    aspect-ratio: 1 / 1;
                }
                .promo-card {
                    position: relative;
                    border-radius: 18px;
                    overflow: hidden;
                    display: block;
                    text-decoration: none;
                    cursor: pointer;
                }
                .promo-card-img {
                    transition: transform 0.4s ease;
                }
                .promo-card:hover .promo-card-img {
                    transform: scale(1.04);
                }
                /* Overlay */
                .promo-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.12);
                    pointer-events: none;
                }
                /* Text centering */
                .promo-text {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 20px;
                    color: #fff;
                    gap: 6px;
                }
                .promo-eyebrow {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 11px;
                    font-weight: 500;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.82);
                    margin: 0;
                }
                .promo-fine {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 11px;
                    color: rgba(255,255,255,0.65);
                    margin: 0;
                }
                .promo-sub {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 14px;
                    color: rgba(255,255,255,0.88);
                    margin: 0;
                }
                /* Sale number lockup */
                .promo-sale-lockup {
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    line-height: 1;
                    gap: 4px;
                }
                .promo-sale-num {
                    font-family: var(--font-display, 'Cormorant', serif);
                    font-size: 60px;
                    font-weight: 300;
                    color: #fff;
                    line-height: 1;
                }
                .promo-sale-stack {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    padding-top: 4px;
                    gap: 2px;
                }
                .promo-sale-pct {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 22px;
                    font-weight: 600;
                    color: #fff;
                    line-height: 1;
                }
                .promo-sale-off {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #fff;
                    line-height: 1;
                }
                /* Shipping headline */
                .promo-ship-headline {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 30px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: #fff;
                    margin: 0;
                    text-decoration-line: underline;
                    text-decoration-thickness: 1.5px;
                    text-underline-offset: 4px;
                }
                /* Marquee strip spacing */
                .promo-strip-top  { margin-bottom: 10px; }
                .promo-strip-bot  { margin-top: 10px; }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .promo-band-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .promo-card-left,
                    .promo-card-right {
                        aspect-ratio: 16 / 10;
                    }
                    .promo-sale-num  { font-size: 44px; }
                    .promo-ship-headline { font-size: 24px; }
                    .promo-sub { font-size: 12px; }
                    .promo-marquee-span { font-size: 12px; }
                }
            `}</style>

            {/* ── Top marquee ── */}
            <div className="promo-marquee-row promo-strip-top" style={{ padding: "0 4%" }}>
                <MarqueeRow />
            </div>

            {/* ── Cards ── */}
            <div className="promo-band-grid">

                {/* LEFT — Sale */}
                <Link href="/sale" className="promo-card promo-card-left" aria-label="Shop the Missus sale — up to 60% off">
                    <Image
                        src={SALE_IMG}
                        alt="Model wearing a Missus outfit from the sale collection"
                        fill
                        sizes="(max-width: 768px) 100vw, 65vw"
                        style={{ objectFit: "cover", objectPosition: "center 20%" }}
                        className="promo-card-img"
                    />
                    <div className="promo-overlay" aria-hidden="true" />
                    <div className="promo-text">
                        <p className="promo-eyebrow">Up to</p>
                        <div className="promo-sale-lockup" aria-label="60% off">
                            <span className="promo-sale-num">60</span>
                            <div className="promo-sale-stack">
                                <span className="promo-sale-pct">%</span>
                                <span className="promo-sale-off">Off</span>
                            </div>
                        </div>
                        <p className="promo-eyebrow" style={{ marginTop: "2px" }}>Sale Is Live</p>
                        <p className="promo-sub">Save big on your favourite fits</p>
                        <p className="promo-fine">*While stock lasts</p>
                    </div>
                </Link>

                {/* RIGHT — Free Shipping */}
                <Link href="/shipping" className="promo-card promo-card-right" aria-label={`Free shipping on orders over ${THRESHOLD}`}>
                    <Image
                        src={SHIP_IMG}
                        alt="Missus model in a full outfit showcasing free shipping on orders over 150,000 Naira"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: "cover", objectPosition: "center top" }}
                        className="promo-card-img"
                    />
                    <div className="promo-overlay" aria-hidden="true" />
                    <div className="promo-text">
                        <p className="promo-eyebrow">Orders {THRESHOLD}+</p>
                        <h2 className="promo-ship-headline">Free Shipping</h2>
                        <p className="promo-sub" style={{ maxWidth: "200px" }}>
                            Delivered fast from Lagos to Abuja and beyond
                        </p>
                    </div>
                </Link>

            </div>

            {/* ── Bottom marquee (scrolls right) ── */}
            <div className="promo-marquee-row promo-strip-bot" style={{ padding: "0 4%" }}>
                <MarqueeRow reverse />
            </div>

        </section>
    );
}
