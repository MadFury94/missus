"use client";
import { useEffect, useState, useRef } from "react";

interface Props {
    /**
     * A fixed ISO datetime string to count down to, e.g. "2026-08-01T00:00:00Z".
     * If omitted, falls back to a rolling 24-hour window that persists in localStorage
     * so it doesn't reset on refresh.
     */
    targetDate?: string;
    /** Legacy prop — ignored if targetDate is provided */
    targetHours?: number;
}

const STORAGE_KEY = "missus_sale_end";

function getSaleEnd(targetDate?: string): number {
    if (targetDate) return new Date(targetDate).getTime();

    // Persist a rolling 24-hour window so refreshes don't reset the timer
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const end = parseInt(stored, 10);
            if (end > Date.now()) return end;
        }
        const end = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, String(end));
        return end;
    }

    return Date.now() + 24 * 60 * 60 * 1000;
}

export default function CountdownTimer({ targetDate }: Props) {
    const endRef = useRef<number>(0);
    const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        endRef.current = getSaleEnd(targetDate);
        setMounted(true);

        const tick = () => {
            const diff = Math.max(0, endRef.current - Date.now());
            setTime({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    const pad = (n: number) => String(n).padStart(2, "0");

    // Avoid SSR/hydration mismatch — render static placeholders server-side
    if (!mounted) {
        return (
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }} aria-label="Sale countdown timer">
                {["Hours", "Mins", "Secs"].map((label) => (
                    <div key={label} style={{ textAlign: "center", background: "rgba(0,0,0,.3)", padding: "12px 20px", minWidth: "70px" }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>--</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginTop: "2px" }}>{label}</div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }} role="timer" aria-label="Sale ends in" aria-live="off">
            {[{ val: time.h, label: "Hours" }, { val: time.m, label: "Mins" }, { val: time.s, label: "Secs" }].map(({ val, label }) => (
                <div key={label} style={{ textAlign: "center", background: "rgba(0,0,0,.3)", padding: "12px 20px", minWidth: "70px" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                        {pad(val)}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginTop: "2px" }}>
                        {label}
                    </div>
                </div>
            ))}
        </div>
    );
}
