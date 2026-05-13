"use client";

import { useState } from "react";

export default function PromoCodeInput() {
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState(false);

    const handleApply = () => {
        if (code.trim()) {
            setApplied(true);
        }
    };

    return (
        <div style={{ display: "flex", gap: 0 }}>
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={applied}
                placeholder="Enter promo / discount code"
                style={{
                    flex: 1,
                    border: "1.5px solid #000",
                    borderRight: "none",
                    padding: "0 14px",
                    height: "44px",
                    fontFamily: "var(--font-barlow)",
                    fontSize: "13px",
                    outline: "none",
                    background: applied ? "#f5f5f5" : "#fff",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    color: "#000",
                }}
            />
            <button
                onClick={handleApply}
                disabled={!code.trim() || applied}
                style={{
                    background: applied ? "#007a3d" : "#000",
                    color: "#fff",
                    border: "none",
                    height: "44px",
                    padding: "0 22px",
                    fontFamily: "var(--font-barlow-condensed)",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    cursor: !code.trim() || applied ? "not-allowed" : "pointer",
                    transition: "background .2s",
                    whiteSpace: "nowrap",
                    opacity: !code.trim() || applied ? 0.6 : 1,
                }}
            >
                {applied ? "✓ Applied" : "Apply"}
            </button>
        </div>
    );
}
