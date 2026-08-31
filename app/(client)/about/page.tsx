import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "About Us — Missus",
    description: "Missus is a Lagos-based women's fashion brand delivering trend-forward, affordable style to the modern Nigerian woman.",
};

export default function AboutPage() {
    return (
        <div style={{ background: "#fff" }}>

            {/* Hero */}
            <div style={{ background: "#000", padding: "80px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#630D13", marginBottom: "12px" }}>
                    Our Story
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9, letterSpacing: "-.01em" }}>
                    Built for<br /><span style={{ color: "#630D13" }}>Her.</span>
                </h1>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,.6)", fontWeight: 300, marginTop: "20px", maxWidth: "520px", margin: "20px auto 0", lineHeight: 1.7 }}>
                    Missus started with one idea — that Nigerian women deserve fashion that actually fits their lives, their bodies, and their budget.
                </p>
            </div>

            {/* Story section */}
            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>
                <div className="about-story-grid">
                    <div>
                        <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "32px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "16px" }}>
                            Where It Started
                        </h2>
                        <p style={{ fontSize: "14px", color: "#444", lineHeight: 1.8, marginBottom: "14px" }}>
                            Missus was born in Lagos out of frustration. Our founder kept seeing the same problem — international fashion brands charging outrageous prices for shipping, slow delivery, and clothes that didn&apos;t fit Nigerian body types.
                        </p>
                        <p style={{ fontSize: "14px", color: "#444", lineHeight: 1.8 }}>
                            So we built something different. A brand that moves at the speed of trends, ships same-day in Lagos, and actually listens to what Nigerian women want to wear.
                        </p>
                    </div>
                    <div style={{ background: "#f5f5f5", aspectRatio: "3/4", position: "relative", overflow: "hidden" }}>
                        <Image
                            src="https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-8.png"
                            alt="Missus fashion"
                            fill
                            style={{ objectFit: "cover", objectPosition: "top" }}
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                    </div>
                </div>
            </div>

            {/* Values */}
            <div style={{ background: "#f5f5f5", padding: "64px 24px" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "32px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", textAlign: "center", marginBottom: "40px" }}>
                        What We Stand For
                    </h2>
                    <div className="about-values-grid">
                        {[
                            {
                                icon: "✦",
                                title: "Affordable Style",
                                body: "Trend-forward pieces that don't require a second mortgage. We keep prices real so you can keep your wardrobe fresh.",
                            },
                            {
                                icon: "⚡",
                                title: "Fast Delivery",
                                body: "Lagos orders delivered in 1–2 hours. Nationwide in 1–3 days. Because waiting a week for a fit is not it.",
                            },
                            {
                                icon: "♡",
                                title: "Made for You",
                                body: "Every piece is chosen with the Nigerian woman in mind — her shape, her climate, her lifestyle, her moment.",
                            },
                        ].map((v) => (
                            <div key={v.title} style={{ background: "#fff", padding: "28px 24px", borderTop: "3px solid #000" }}>
                                <div style={{ fontSize: "24px", marginBottom: "12px" }}>{v.icon}</div>
                                <h3 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px" }}>
                                    {v.title}
                                </h3>
                                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.7 }}>{v.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div style={{ padding: "64px 24px", textAlign: "center" }}>
                <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".02em", marginBottom: "16px" }}>
                    Ready to Shop?
                </h2>
                <p style={{ fontSize: "14px", color: "#555", marginBottom: "28px" }}>
                    New drops every week. Free shipping on orders ₦150,000+.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "14px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 36px", textDecoration: "none" }}>
                        Shop Now
                    </Link>
                    <Link href="/contact" style={{ background: "#fff", color: "#000", fontFamily: "var(--font-barlow-condensed)", fontSize: "14px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 36px", textDecoration: "none", border: "1.5px solid #000" }}>
                        Get in Touch
                    </Link>
                </div>
            </div>
        </div>
    );
}
