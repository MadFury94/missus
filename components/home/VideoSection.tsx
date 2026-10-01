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
                preload="metadata"
                width={1280}
                height={720}
                aria-label="Missus collection video"
                style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    aspectRatio: "16 / 9",
                    objectFit: "contain",
                }}
            >
                <source
                    src="/missus-video.MP4"
                    type="video/mp4"
                />
                Your browser does not support video playback.
            </video>
        </div>
    );
}
