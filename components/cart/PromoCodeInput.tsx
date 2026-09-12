"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CartItem } from "@/types";

interface PromoCodeInputProps {
    subtotal: number;
    cartItems?: CartItem[];
    onPromoApplied?: (code: string, discount: number) => void;
    onPromoRemoved?: () => void;
}

export default function PromoCodeInput({ subtotal, cartItems, onPromoApplied, onPromoRemoved }: PromoCodeInputProps) {
    const [code, setCode] = useState("");
    const [appliedCode, setAppliedCode] = useState("");
    const [appliedLabel, setAppliedLabel] = useState("");
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleApply = async () => {
        if (!code.trim()) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/promo/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: code.trim(),
                    subtotal: subtotal,
                    cart: cartItems || []
                })
            });

            const result = await response.json();

            if (result.valid) {
                setAppliedCode(result.code);
                setAppliedLabel(result.label);
                setDiscount(result.discount);
                setCode("");
                setError("");
                onPromoApplied?.(result.code, result.discount);
            } else {
                setError(result.error || "Invalid discount code");
            }
        } catch (err) {
            setError("Unable to validate code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setAppliedCode("");
        setAppliedLabel("");
        setDiscount(0);
        setError("");
        setCode("");
        onPromoRemoved?.();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleApply();
        }
    };

    if (appliedCode) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: error ? "8px" : "0"
            }}>
                <div>
                    <span style={{ fontSize: "13px", color: "#0369a1", fontWeight: 600 }}>
                        ✓ {appliedCode} applied
                    </span>
                    <br />
                    <span style={{ fontSize: "12px", color: "#0369a1" }} className="currency-display">
                        {appliedLabel} • Saves <span className="currency-symbol">₦{discount.toLocaleString("en-NG")}</span>
                    </span>
                </div>
                <button
                    onClick={handleRemove}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#0369a1",
                        padding: "4px"
                    }}
                    aria-label="Remove discount code"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", gap: 0 }}>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter promo / discount code"
                    disabled={loading}
                    style={{
                        flex: 1,
                        border: "1.5px solid #000",
                        borderRight: "none",
                        padding: "0 14px",
                        height: "44px",
                        fontFamily: "var(--font-barlow)",
                        fontSize: "13px",
                        outline: "none",
                        background: loading ? "#f5f5f5" : "#fff",
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                        color: "#000",
                        borderRadius: "999px 0 0 999px",
                    }}
                />
                <button
                    onClick={handleApply}
                    disabled={!code.trim() || loading}
                    style={{
                        background: "#000",
                        color: "#fff",
                        border: "none",
                        borderRadius: "0 999px 999px 0",
                        height: "44px",
                        padding: "0 22px",
                        fontFamily: "var(--font-barlow-condensed)",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        cursor: (!code.trim() || loading) ? "not-allowed" : "pointer",
                        transition: "background .2s",
                        whiteSpace: "nowrap",
                        opacity: (!code.trim() || loading) ? 0.6 : 1,
                    }}
                >
                    {loading ? "..." : "Apply"}
                </button>
            </div>
            {error && (
                <p style={{
                    fontSize: "12px",
                    color: "#dc2626",
                    marginTop: "8px",
                    fontFamily: "var(--font-barlow)"
                }}>
                    {error}
                </p>
            )}
        </div>
    );
}
