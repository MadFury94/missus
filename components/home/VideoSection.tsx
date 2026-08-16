"use client";
import Link from "next/link";
import { useRef, useEffect } from "react";

export default function VideoSection() {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Auto-play when the section scrolls into view
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => { });
                } else {
                    video.pause();
                }
            },
            { threshold: 0.25 }
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    return (
        <div style={{ position: "relative", width: "100%", overflow: "hidden", background: "#000" }}>
            {/* Video — full width, auto-play muted */}
            <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none"
                poster="https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-93.jpeg"
                style={{
                    display: "block",
                    width: "100%",
                    maxHeight: "600px",
                    objectFit: "cover",
                }}
            >
                <source
                    src="https://res.cloudinary.com/dqwfjxn8g/video/upload/q_auto/f_auto/v1775315538/dc9bd786acf346d0a6447d038c87492e_fhimrw.mp4"
                    type="video/mp4"
                />
            </video>

            {/* Overlay — subtle darkening + text */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.1) 60%, transparent 100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "clamp(28px,5vw,60px)",
                    zIndex: 2,
                }}
            >
                <div>
                    <p style={{
                        fontFamily: "var(--font-barlow-condensed)",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: ".3em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: "10px",
                    }}>
                        MissusDeals
                    </p>
                    <h2 style={{
                        fontFamily: "var(--font-barlow-condensed)",
                        fontSize: "clamp(48px,7vw,100px)",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        color: "#fff",
                        lineHeight: 0.9,
                        letterSpacing: "-.01em",
                        marginBottom: "20px",
                    }}>
                        Up to<br />60% Off.
                    </h2>
                    <p style={{
                        fontSize: "14px",
                        color: "rgba(255,255,255,.7)",
                        fontWeight: 300,
                        marginBottom: "24px",
                        maxWidth: "400px",
                        lineHeight: 1.65,
                    }}>
                        Prices as marked. While stocks last. Don&apos;t sleep on it.
                    </p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <Link
                            href="/sale"
                            style={{
                                fontFamily: "var(--font-barlow-condensed)",
                                fontWeight: 700,
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                                background: "#e8002d",
                                color: "#fff",
                                padding: "13px 28px",
                                fontSize: "13px",
                                textDecoration: "none",
                                display: "inline-block",
                            }}
                        >
                            Shop Sale
                        </Link>
                        <Link
                            href="/shop"
                            style={{
                                fontFamily: "var(--font-barlow-condensed)",
                                fontWeight: 700,
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                                background: "rgba(255,255,255,.12)",
                                color: "#fff",
                                padding: "13px 28px",
                                fontSize: "13px",
                                border: "1.5px solid rgba(255,255,255,.5)",
                                textDecoration: "none",
                                display: "inline-block",
                                backdropFilter: "blur(4px)",
                            }}
                        >
                            Shop All
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
