"use client";
import { useState, useEffect } from "react";

interface Props {
    items?: string[];
}

const DEFAULT_ITEMS = [
    "Miss Us With The Ugly Clothes",
    "New Drops Weekly",
    "It-Girl Approved",
    "Shop Dresses · Tops · Sets",
    "Lagos Same Day Delivery",
];

export default function MarqueeStrip({ items = DEFAULT_ITEMS }: Props) {
    const [current, setCurrent] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setOpacity(0);
            setTimeout(() => {
                // Swap text while invisible
                setCurrent((i) => (i + 1) % items.length);
                // Fade back in
                setOpacity(1);
            }, 500);
        }, 3500);
        return () => clearInterval(interval);
    }, [items.length]);

    return (
        <div style={{ background: "#000", padding: "10px 0", textAlign: "center" }}>
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.85)",
                    opacity,
                    transition: "opacity 0.5s ease",
                }}
            >
                <span style={{ width: "4px", height: "4px", background: "rgba(255,255,255,.4)", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} aria-hidden="true" />
                {items[current]}
                <span style={{ width: "4px", height: "4px", background: "rgba(255,255,255,.4)", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} aria-hidden="true" />
            </span>
        </div>
    );
}
