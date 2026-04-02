"use client";
import { useEffect, useState } from "react";

export default function CountdownTimer({ targetHours = 8 }: { targetHours?: number }) {
    const [time, setTime] = useState({ h: targetHours, m: 34, s: 21 });

    useEffect(() => {
        const end = Date.now() + (targetHours * 3600 + 34 * 60 + 21) * 1000;
        const tick = () => {
            const diff = Math.max(0, end - Date.now());
            setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetHours]);

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            {[{ val: time.h, label: "Hours" }, { val: time.m, label: "Mins" }, { val: time.s, label: "Secs" }].map(({ val, label }) => (
                <div key={label} style={{ textAlign: "center", background: "rgba(0,0,0,.3)", padding: "12px 20px", minWidth: "70px" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{pad(val)}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginTop: "2px" }}>{label}</div>
                </div>
            ))}
        </div>
    );
}
