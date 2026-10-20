"use client";

import { useEffect, useState } from "react";

const PHRASES = ["birthday dress", "club outfit", "black dress", "matching sets"];

export function useSearchPlaceholder(active = true) {
    const [text, setText] = useState(PHRASES[0]);

    useEffect(() => {
        if (!active) return;

        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let timer: ReturnType<typeof setTimeout>;
        let index = 0;
        let length = PHRASES[0].length;
        let deleting = true;

        function tick() {
            const phrase = PHRASES[index];
            length += deleting ? -1 : 1;
            setText(phrase.slice(0, length));

            let delay = deleting ? 45 : 95;
            if (length === 0) {
                deleting = false;
                index = (index + 1) % PHRASES.length;
                delay = 350;
            } else if (length === phrase.length) {
                deleting = true;
                delay = 2000;
            }
            timer = setTimeout(tick, delay);
        }

        function restart() {
            clearTimeout(timer);
            index = 0;
            length = PHRASES[0].length;
            deleting = true;
            setText(PHRASES[0]);
            if (!motion.matches && !document.hidden) timer = setTimeout(tick, 2000);
        }

        restart();
        motion.addEventListener("change", restart);
        document.addEventListener("visibilitychange", restart);
        return () => {
            clearTimeout(timer);
            motion.removeEventListener("change", restart);
            document.removeEventListener("visibilitychange", restart);
        };
    }, [active]);

    return `Search ${text}`;
}
