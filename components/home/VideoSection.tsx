"use client";
import { useRef, useEffect } from "react";

export default function VideoSection() {
    const videoRef = useRef<HTMLVideoElement>(null);

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
        <div style={{ position: "relative", width: "100%", overflow: "hidden", background: "#000", lineHeight: 0 }}>
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
        </div>
    );
}
