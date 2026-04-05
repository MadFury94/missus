"use client";
import { useRef, useEffect } from "react";

export default function VideoHero() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay failed, user interaction required
            });
        }
    }, []);

    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "80vh",
            minHeight: "400px",
            maxHeight: "800px",
            overflow: "hidden",
            background: "#000"
        }}>
            {/* Video Background */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                onCanPlay={(e) => e.currentTarget.play()}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center"
                }}
            >
                <source
                    src="https://res.cloudinary.com/dqwfjxn8g/video/upload/q_auto/f_auto/v1775315538/dc9bd786acf346d0a6447d038c87492e_fhimrw.mp4"
                    type="video/mp4"
                />
            </video>

            {/* Subtle overlay for depth */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)",
                pointerEvents: "none"
            }} />
        </div>
    );
}
