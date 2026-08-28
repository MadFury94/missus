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
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setVisible(false);
            setTimeout(() => {
                setCurrent((i) => (i + 1) % items.length);
                // Fade in
                setVisible(true);
            }, 400);
        }, 3000);
        return () => clearInterval(interval);
    }, [items.length]);

    return (
        <div style={{ background: "#000", padding: "10px 0", textAlign: "center", overflow: "hidden" }}>
            <style>{`
                @keyframes fadeItem {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .marquee-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 11px;
                    font-weight: 400;
                    letter-spacing: .18em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,.85);
                    transition: opacity .4s ease, transform .4s ease;
                }
                .marquee-item.visible {
                    opacity: 1;
                    transform: translateY(0);
                    animation: fadeItem .4s ease forwards;
                }
                .marquee-item.hidden {
                    opacity: 0;
                    transform: translateY(-4px);
                }
            `}</style>
            <span className={`marquee-item ${visible ? "visible" : "hidden"}`}>
                <span style={{ width: "4px", height: "4px", background: "rgba(255,255,255,.4)", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} aria-hidden="true" />
                {items[current]}
                <span style={{ width: "4px", height: "4px", background: "rgba(255,255,255,.4)", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} aria-hidden="true" />
            </span>
        </div>
    );
}
