"use client";
import { useState } from "react";
import Link from "next/link";

interface GiftCardResult {
    code: string;
    balance: number;
    face_value?: number;
    initial_balance?: number;
    currency: string;
    symbol: string;
    expiry?: string | null;
    status: string;
}

export default function GiftCardBalancePage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GiftCardResult | null>(null);
    const [error, setError] = useState("");

    async function handleCheck(e: React.FormEvent) {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setResult(null);
        setError("");

        try {
            const res = await fetch("/api/gift-card/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Gift card not found.");
            } else {
                setResult(data);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const initialBal = result?.face_value ?? result?.initial_balance;

    return (
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "60px 20px 80px" }}>
            <div style={{ width: "100%", maxWidth: "520px" }}>

                {/* Breadcrumb */}
                <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "32px", letterSpacing: ".04em" }}>
                    <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link>
                    {" / "}
                    <span style={{ color: "#333" }}>Check Gift Card Balance</span>
                </p>

                <h1 style={{
                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    color: "#000",
                    marginBottom: "8px",
                }}>
                    Check Gift Card Balance
                </h1>
                <p style={{ fontSize: "13px", color: "#767676", marginBottom: "36px", lineHeight: 1.6 }}>
                    Enter your gift card code to check the remaining balance.
                </p>

                <form onSubmit={handleCheck} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input
                        type="text"
                        placeholder="Gift card code (e.g. XXXX-XXXX-XXXX-XXXX)"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            border: "1px solid #e0e0e0",
                            fontSize: "14px",
                            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                            letterSpacing: ".06em",
                            outline: "none",
                            transition: "border-color .2s",
                            background: "#fff",
                            color: "#000",
                            boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#000")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
                        required
                        aria-label="Gift card code"
                    />

                    <button
                        type="submit"
                        disabled={loading || !code.trim()}
                        style={{
                            width: "100%",
                            padding: "15px",
                            background: loading ? "#555" : "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: 600,
                            letterSpacing: ".1em",
                            textTransform: "uppercase",
                            cursor: loading || !code.trim() ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                            transition: "background .2s",
                        }}
                    >
                        {loading ? "Checking…" : "Check Balance"}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div style={{
                        marginTop: "20px",
                        padding: "14px 16px",
                        background: "#fff5f5",
                        border: "1px solid #fecaca",
                        borderLeft: "3px solid #ef4444",
                        fontSize: "13px",
                        color: "#991b1b",
                        lineHeight: 1.5,
                    }}>
                        {error}
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div style={{
                        marginTop: "24px",
                        border: "1px solid #e8e8e8",
                        overflow: "hidden",
                    }}>
                        {/* Header strip */}
                        <div style={{
                            background: result.status === "active" ? "#000" : "#6b7280",
                            padding: "14px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>
                                Gift Card
                            </span>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: result.status === "active" ? "#4ade80" : "#f87171" }}>
                                {result.status === "active" ? "Active" : result.status === "used" ? "Used" : "Inactive"}
                            </span>
                        </div>

                        {/* Card body */}
                        <div style={{ padding: "20px" }}>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#aaa", marginBottom: "4px" }}>
                                Code
                            </p>
                            <p style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: 700, color: "#000", letterSpacing: ".08em", marginBottom: "20px" }}>
                                {result.code}
                            </p>

                            <div style={{ display: "grid", gridTemplateColumns: initialBal ? "1fr 1fr" : "1fr", gap: "16px" }}>
                                <div style={{ background: "#f9f9f9", padding: "14px 16px" }}>
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa", marginBottom: "4px" }}>
                                        Remaining Balance
                                    </p>
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: "26px", fontWeight: 800, color: result.balance > 0 ? "#000" : "#aaa" }}>
                                        {result.symbol}{result.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                {initialBal !== undefined && (
                                    <div style={{ background: "#f9f9f9", padding: "14px 16px" }}>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa", marginBottom: "4px" }}>
                                            Original Value
                                        </p>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "26px", fontWeight: 800, color: "#aaa" }}>
                                            {result.symbol}{initialBal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {result.expiry && (
                                <p style={{ fontSize: "12px", color: "#767676", marginTop: "14px" }}>
                                    Expires: {new Date(result.expiry).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            )}
                        </div>

                        {result.balance > 0 && (
                            <div style={{ padding: "0 20px 20px" }}>
                                <Link
                                    href="/shop"
                                    style={{
                                        display: "block",
                                        textAlign: "center",
                                        background: "#7F0E12",
                                        color: "#fff",
                                        fontFamily: "var(--font-body)",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        letterSpacing: ".1em",
                                        textTransform: "uppercase",
                                        padding: "13px",
                                        textDecoration: "none",
                                        borderRadius: "999px",
                                        transition: "opacity .2s",
                                    }}
                                >
                                    Shop Now
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Sign in prompt */}
                <p style={{ fontSize: "12px", color: "#aaa", marginTop: "32px", textAlign: "center", lineHeight: 1.7 }}>
                    Have an account?{" "}
                    <Link href="/account/login" style={{ color: "#000", textDecoration: "underline" }}>
                        Sign in
                    </Link>{" "}
                    to view all your gift cards in one place.
                </p>
            </div>
        </div>
    );
}
