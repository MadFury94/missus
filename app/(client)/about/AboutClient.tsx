"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function useInView(threshold?: number) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold: threshold || 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, inView };
}

export default function AboutClient() {
    const hero = useInView(0.2);
    const mission = useInView(0.3);
    const values = useInView(0.3);
    const team = useInView(0.3);

    return (
        <div style={{ background: "#fff" }}>
            {/* Hero Section */}
            <div
                ref={hero.ref}
                style={{
                    background: "#000",
                    padding: "80px 20px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    opacity: hero.inView ? 1 : 0,
                    transform: hero.inView ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease"
                }}
            >
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <h1 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(48px, 8vw, 72px)",
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: "24px",
                        letterSpacing: "-0.02em"
                    }}>
                        About Missus
                    </h1>
                    <p style={{
                        fontSize: "18px",
                        color: "rgba(255,255,255,0.8)",
                        lineHeight: 1.6,
                        maxWidth: "600px",
                        margin: "0 auto"
                    }}>
                        Nigeria's premier destination for contemporary women's fashion.
                        We're redefining style with curated collections that empower women
                        to express their unique personality.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div
                ref={mission.ref}
                style={{
                    padding: "100px 20px",
                    opacity: mission.inView ? 1 : 0,
                    transform: mission.inView ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease"
                }}
            >
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
                        <div>
                            <div style={{
                                width: "60px",
                                height: "4px",
                                background: "#000",
                                marginBottom: "32px"
                            }} />
                            <h2 style={{
                                fontFamily: "var(--font-display, 'Cormorant', serif)",
                                fontSize: "clamp(36px, 5vw, 48px)",
                                fontWeight: 600,
                                color: "#000",
                                marginBottom: "32px",
                                letterSpacing: "-0.01em"
                            }}>
                                Our Mission
                            </h2>
                            <p style={{
                                fontSize: "16px",
                                color: "#555",
                                lineHeight: 1.8,
                                marginBottom: "24px"
                            }}>
                                To democratize high-quality fashion by making contemporary,
                                well-designed pieces accessible to the modern Nigerian woman.
                                We believe every woman deserves to feel confident and stylish.
                            </p>
                            <p style={{
                                fontSize: "16px",
                                color: "#555",
                                lineHeight: 1.8
                            }}>
                                Our carefully curated collections blend international trends
                                with African sensibilities, creating pieces that are both
                                globally relevant and locally authentic.
                            </p>
                        </div>
                        <div style={{ position: "relative", height: "500px", background: "#f8f9fa" }}>
                            {/* Placeholder for mission image */}
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#888",
                                fontSize: "14px"
                            }}>
                                Mission Image Placeholder
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div
                ref={values.ref}
                style={{
                    background: "#f8f9fa",
                    padding: "100px 20px",
                    opacity: values.inView ? 1 : 0,
                    transform: values.inView ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease"
                }}
            >
                <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(36px, 5vw, 48px)",
                        fontWeight: 600,
                        color: "#000",
                        marginBottom: "64px"
                    }}>
                        Our Values
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px" }}>
                        {[
                            {
                                title: "Quality First",
                                description: "Every piece is carefully selected and quality-checked before reaching you."
                            },
                            {
                                title: "Customer-Centric",
                                description: "Your satisfaction drives everything we do, from curation to customer service."
                            },
                            {
                                title: "Empowerment",
                                description: "Fashion should make you feel confident, powerful, and authentically you."
                            }
                        ].map((value, index) => (
                            <div key={index} style={{ textAlign: "left" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#000",
                                    borderRadius: "50%",
                                    marginBottom: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <span style={{ color: "#fff", fontSize: "20px", fontWeight: 600 }}>
                                        {index + 1}
                                    </span>
                                </div>
                                <h3 style={{
                                    fontSize: "24px",
                                    fontWeight: 600,
                                    color: "#000",
                                    marginBottom: "16px"
                                }}>
                                    {value.title}
                                </h3>
                                <p style={{
                                    fontSize: "16px",
                                    color: "#555",
                                    lineHeight: 1.6
                                }}>
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div style={{ padding: "100px 20px", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h2 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(36px, 5vw, 48px)",
                        fontWeight: 600,
                        color: "#000",
                        marginBottom: "24px"
                    }}>
                        Ready to Discover Your Style?
                    </h2>
                    <p style={{
                        fontSize: "16px",
                        color: "#555",
                        lineHeight: 1.6,
                        marginBottom: "40px"
                    }}>
                        Explore our curated collections and find pieces that speak to your unique style.
                    </p>
                    <Link
                        href="/shop"
                        style={{
                            display: "inline-block",
                            padding: "16px 40px",
                            background: "#000",
                            color: "#fff",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            transition: "all 0.3s ease"
                        }}
                    >
                        Shop Collection
                    </Link>
                </div>
            </div>
        </div>
    );
}