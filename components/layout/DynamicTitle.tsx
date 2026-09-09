"use client";
import { useEffect, useState } from "react";

// Dynamic title messages that will rotate
const TITLE_MESSAGES = [
    "MISSUS",
    "🔥 Hurry, sizes are selling fast!",
    "✨ New arrivals just dropped",
    "⚡ Free shipping nationwide",
    "💎 Premium fashion for you",
    "🎯 Trending styles inside",
    "🛍️ Shop the latest looks",
    "⭐ Customer favorites",
    "🔥 Limited time offers",
    "✨ Your style awaits",
    "💫 Fashion that fits you",
    "🌟 Bestsellers inside",
    "🎀 Elegant & affordable",
    "💖 New collections daily",
    "🛒 Cart filling up fast!"
];

interface DynamicTitleProps {
    prefix?: string; // e.g., "Checkout - " or "Shop - "
    interval?: number; // Milliseconds between title changes
    enabled?: boolean; // Whether to enable dynamic titles
}

export default function DynamicTitle({
    prefix = "",
    interval = 3000,
    enabled = true
}: DynamicTitleProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!enabled) {
            // Set static title if dynamic titles are disabled
            document.title = `${prefix}MISSUS`;
            return;
        }

        // Set initial title
        document.title = `${prefix}${TITLE_MESSAGES[0]}`;

        const titleInterval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const newIndex = (prevIndex + 1) % TITLE_MESSAGES.length;
                document.title = `${prefix}${TITLE_MESSAGES[newIndex]}`;
                return newIndex;
            });
        }, interval);

        return () => {
            clearInterval(titleInterval);
        };
    }, [prefix, interval, enabled]);

    // This component doesn't render anything, it just manages the title
    return null;
}

// Hook for easy use in pages
export function useDynamicTitle(prefix?: string, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        let currentIndex = 0;

        const updateTitle = () => {
            document.title = `${prefix || ""}${TITLE_MESSAGES[currentIndex]}`;
            currentIndex = (currentIndex + 1) % TITLE_MESSAGES.length;
        };

        // Set initial title
        updateTitle();

        const interval = setInterval(updateTitle, 3000);

        return () => clearInterval(interval);
    }, [prefix, enabled]);
}