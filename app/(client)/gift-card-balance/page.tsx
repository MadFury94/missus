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
    const isActive = result?.status === "active";

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .gc-result { animation: fadeUp .35s ease forwards; }

                .gc-input:focus {
                    border-color: #000 !important;
                    box-shadow: 0 0 0 3px rgba(0,0,0,.07);
                }
                .gc-btn:hover:not(:disabled) { background: #222 !important; }
                .gc-btn:disabled { opacity: .45; }
                .gc-shop-btn:hover { opacity: .85; }

                @media (max-width: 600px) {
                    .gc-card-inner { padding: 24px 20px !important; }
                    .gc-bal-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div style={{ minHeight: "70vh", padding: "48px 20px 100px", background: "#fafafa" }}>
                <div style={{ width: "100%", maxWidth: "480px", margin: "0 auto" }}>

                    {/* Breadcrumb */}
                    <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "40px", letterSpacing: ".04em" }}>
                        <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link>
                        {" / "}
                        <span style={{ color: "#555" }}>Check Gift Card Balance</span>
                    </p>

                    {/* Page heading */}
                    <div style={{ marginBottom: "32px" }}>
                        {/* Gift icon */}
                        <div style={{
                            width: "48px", height: "48px", background: "#000",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "16px",
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 12 20 22 4 22 4 12" />
                                <rect x="2" y="7" width="20" height="5" />
                                <line x1="12" y1="22" x2="12" y2="7" />
                                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                            </svg>
                        </div>
                        <h1 style={{
                            fontFamily: "var(--font-display, 'Cormorant', serif)",
                            fontSize: "clamp(26px, 4vw, 36px)",
                            fontWeight: 600,
                            color: "#000",
                            letterSpacing: "-.01em",
                            lineHeight: 1.1,
                            marginBottom: "8px",
                        }}>
                            Check Your<br />Gift Card
                        </h1>
                        <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>
                            Enter your code below to see the remaining balance.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleCheck} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                        <input
                            className="gc-input"
                            type="text"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            style={{
                                width: "100%",
                                padding: "15px 18px",
                                border: "1.5px solid #e0e0e0",
                                background: "#fff",
                                fontSize: "15px",
                                fontFamily: "monospace",
                                letterSpacing: ".1em",
                                color: "#000",
                                outline: "none",
                                transition: "border-color .2s, box-shadow .2s",
                                boxSizing: "border-box",
                            }}
                            required
                            aria-label="Gift card code"
                            autoComplete="off"
                            spellCheck={false}
                        />

                        <button
                            type="submit"
                            className="gc-btn"
                            disabled={loading || !code.trim()}
                            style={{
                                width: "100%",
                                padding: "16px",
                                background: "#000",
                                color: "#fff",
                                border: "none",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: ".14em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                transition: "background .2s, opacity .2s",
                            }}
                        >
                            {loading ? "Checking…" : "Check Balance"}
                        </button>
                    </form>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: "14px 18px",
                            background: "#fff",
                            border: "1px solid #f5c6c6",
                            borderLeft: "3px solid #c0392b",
                            fontSize: "13px",
                            color: "#7b1010",
                            lineHeight: 1.5,
                            marginBottom: "20px",
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Result card */}
                    {result && (
                        <div className="gc-result" style={{
                            background: "#fff",
                            border: "1px solid #e8e8e8",
                            overflow: "hidden",
                            boxShadow: "0 4px 24px rgba(0,0,0,.06)",
                        }}>
                            {/* Physical card visual */}
                            <div style={{
                                background: "#000",
                                padding: "28px 28px 24px",
                                position: "relative",
                                overflow: "hidden",
                            }}>
                                {/* Decorative circles */}
                                <div style={{
                                    position: "absolute", top: "-40px", right: "-40px",
                                    width: "160px", height: "160px", borderRadius: "50%",
                                    background: "rgba(255,255,255,.04)",
                                }} />
                                <div style={{
                                    position: "absolute", bottom: "-20px", right: "40px",
                                    width: "80px", height: "80px", borderRadius: "50%",
                                    background: "rgba(255,255,255,.03)",
                                }} />

                                {/* Brand + status row */}
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
                                    <span style={{
                                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                                        fontSize: "22px",
                                        fontWeight: 600,
                                        color: "#fff",
                                        letterSpacing: ".04em",
                                    }}>
                                        MISSUS
                                    </span>
                                    <span style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        letterSpacing: ".14em",
                                        textTransform: "uppercase",
                                        color: isActive ? "#4ade80" : "#f87171",
                                        background: isActive ? "rgba(74,222,128,.12)" : "rgba(248,113,113,.12)",
                                        padding: "5px 10px",
                                        border: `1px solid ${isActive ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)"}`,
                                    }}>
                                        {isActive ? "Active" : result.status === "used" ? "Used" : "Inactive"}
                                    </span>
                                </div>

                                {/* Balance */}
                                <div>
                                    <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: "4px" }}>
                                        Balance
                                    </p>
                                    <p style={{
                                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                                        fontSize: "clamp(32px, 6vw, 42px)",
                                        fontWeight: 600,
                                        color: "#fff",
                                        letterSpacing: "-.01em",
                                        lineHeight: 1,
                                    }}>
                                        {result.symbol}{result.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Code chip */}
                                <div style={{ marginTop: "20px" }}>
                                    <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: "5px" }}>
                                        Code
                                    </p>
                                    <p style={{ fontFamily: "monospace", fontSize: "13px", color: "rgba(255,255,255,.75)", letterSpacing: ".12em" }}>
                                        {result.code}
                                    </p>
                                </div>
                            </div>

                            {/* Details section */}
                            <div className="gc-card-inner" style={{ padding: "24px 28px" }}>
                                <div className="gc-bal-grid" style={{ display: "grid", gridTemplateColumns: initialBal ? "1fr 1fr" : "1fr", gap: "12px", marginBottom: initialBal ? "24px" : "0" }}>
                                    <div style={{ background: "#f8f8f8", padding: "14px 16px" }}>
                                        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#aaa", marginBottom: "6px" }}>
                                            Remaining Balance
                                        </p>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "20px", fontWeight: 800, color: result.balance > 0 ? "#000" : "#bbb", lineHeight: 1 }}>
                                            {result.symbol}{result.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    {initialBal !== undefined && (
                                        <div style={{ background: "#f8f8f8", padding: "14px 16px" }}>
                                            <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#aaa", marginBottom: "6px" }}>
                                                Original Value
                                            </p>
                                            <p style={{ fontFamily: "var(--font-body)", fontSize: "20px", fontWeight: 800, color: "#ccc", lineHeight: 1 }}>
                                                {result.symbol}{initialBal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {result.expiry && (
                                    <p style={{ fontSize: "11px", color: "#aaa", letterSpacing: ".04em", marginBottom: "20px" }}>
                                        Expires{" "}
                                        <span style={{ color: "#555", fontWeight: 600 }}>
                                            {new Date(result.expiry).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                                        </span>
                                    </p>
                                )}

                                {result.balance > 0 && (
                                    <Link
                                        href="/shop"
                                        className="gc-shop-btn"
                                        style={{
                                            display: "block",
                                            textAlign: "center",
                                            background: "#000",
                                            color: "#fff",
                                            fontFamily: "var(--font-body)",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            letterSpacing: ".14em",
                                            textTransform: "uppercase",
                                            padding: "15px",
                                            textDecoration: "none",
                                            transition: "opacity .2s",
                                        }}
                                    >
                                        Use Your Gift Card — Shop Now
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sign in prompt */}
                    <p style={{ fontSize: "12px", color: "#bbb", marginTop: "36px", textAlign: "center", lineHeight: 1.8 }}>
                        Have an account?{" "}
                        <Link href="/account/login" style={{ color: "#000", textDecoration: "underline", fontWeight: 600 }}>
                            Sign in
                        </Link>{" "}
                        to view all your gift cards in one place.
                    </p>
                </div>
            </div>
        </>
    );
}
