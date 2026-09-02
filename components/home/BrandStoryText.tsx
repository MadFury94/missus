"use client";
import Link from "next/link";

export default function BrandStoryText() {
    return (
        <div style={{
            background: "#fff",
            padding: "clamp(60px, 10vw, 80px) 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
        }}>
            <div style={{
                maxWidth: "800px",
                margin: "0 auto"
            }}>
                {/* Small Eyebrow */}
                <p style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".25em",
                    textTransform: "uppercase",
                    color: "#7F0E12",
                    marginBottom: "20px"
                }}>
                    Our Story
                </p>

                {/* Main Heading */}
                <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(32px, 5vw, 56px)",
                    fontWeight: 400,
                    lineHeight: 1.3,
                    color: "#000",
                    marginBottom: "24px",
                    fontStyle: "italic"
                }}>
                    Where Style Meets Confidence
                </h2>

                {/* Body Text */}
                <p style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "16px",
                    lineHeight: 1.8,
                    color: "#666",
                    marginBottom: "16px"
                }}>
                    At Missus, we believe every woman deserves to feel powerful, beautiful, and unapologetically herself.
                    Our curated collections blend timeless elegance with contemporary edge, designed for the modern woman
                    who refuses to compromise on style or quality.
                </p>

                <p style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "16px",
                    lineHeight: 1.8,
                    color: "#666",
                    marginBottom: "40px"
                }}>
                    From runway-inspired pieces to everyday essentials, each item is thoughtfully selected to empower
                    your wardrobe and elevate your confidence.
                </p>

                {/* CTA Buttons */}
                <div style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    <Link
                        href="/shop"
                        style={{
                            background: "#000",
                            color: "#fff",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "14px",
                            fontWeight: 700,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            padding: "16px 40px",
                            textDecoration: "none",
                            display: "inline-block",
                            transition: "all .3s",
                            border: "2px solid #000"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#000";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#000";
                            e.currentTarget.style.color = "#fff";
                        }}
                    >
                        Explore Collection
                    </Link>

                    <Link
                        href="/category/new-arrivals"
                        style={{
                            background: "#fff",
                            color: "#000",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "14px",
                            fontWeight: 700,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            padding: "16px 40px",
                            textDecoration: "none",
                            display: "inline-block",
                            transition: "all .3s",
                            border: "2px solid #000"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#000";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#000";
                        }}
                    >
                        New Arrivals
                    </Link>
                </div>
            </div>

            {/* Decorative Element */}
            <div style={{
                marginTop: "60px",
                width: "60px",
                height: "1px",
                background: "linear-gradient(to right, transparent, #7F0E12, transparent)"
            }} />
        </div>
    );
}
