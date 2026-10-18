"use client";
import { useState, useEffect } from "react";
import { useNewsletter } from "@/lib/use-newsletter";

const STORAGE_KEY = "missus_nl_popup_dismissed";
// Show after 6 seconds. Don't show again for 7 days after dismiss/subscribe.
const DELAY_MS = 6000;
const SUPPRESS_DAYS = 7;

export default function NewsletterPopup() {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState("");
    const { done, loading, error, subscribe } = useNewsletter("homepage");

    useEffect(() => {
        // Don't show if already dismissed recently
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const until = Number(raw);
                if (Date.now() < until) return;
            }
        } catch {
            // localStorage unavailable (SSR guard)
            return;
        }

        const timer = setTimeout(() => setVisible(true), DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    function dismiss() {
        setVisible(false);
        try {
            const until = Date.now() + SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
            localStorage.setItem(STORAGE_KEY, String(until));
        } catch { /* ignore */ }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (email) void subscribe(email);
    }

    // After success, close after 2.5s and suppress for 7 days
    useEffect(() => {
        if (!done) return;
        const t = setTimeout(dismiss, 2500);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done]);

    if (!visible) return null;

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                aria-hidden="true"
                onClick={dismiss}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    zIndex: 800,
                    animation: "nlpop-fade .25s ease forwards",
                }}
            />

            {/* ── Modal ── */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Join the Missus Inner Circle"
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 801,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    padding: "0",
                    pointerEvents: "none",
                }}
            >
                <div
                    style={{
                        pointerEvents: "auto",
                        width: "100%",
                        maxWidth: "560px",
                        background: "#fff",
                        animation: "nlpop-up .32s cubic-bezier(.4,0,.2,1) forwards",
                        position: "relative",
                    }}
                    className="nl-popup-panel"
                >
                    {/* Close button */}
                    <button
                        onClick={dismiss}
                        aria-label="Close"
                        style={{
                            position: "absolute", top: "14px", right: "16px",
                            background: "none", border: "none", cursor: "pointer",
                            color: "#888", padding: "4px", lineHeight: 1,
                            display: "flex", alignItems: "center",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    {/* ── Black accent top bar ── */}
                    <div style={{ height: "4px", background: "#000", width: "100%" }} />

                    <div style={{ padding: "28px 32px 32px" }} className="nl-popup-body">
                        {done ? (
                            /* ── Success state ── */
                            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                                <div style={{
                                    width: "48px", height: "48px", background: "#000", borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </div>
                                <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>You&apos;re in!</p>
                                <p style={{ fontSize: "13px", color: "#666" }}>Watch your inbox for early drops and exclusive deals.</p>
                            </div>
                        ) : (
                            /* ── Signup state ── */
                            <>
                                {/* Eyebrow */}
                                <p style={{
                                    fontSize: "10px", fontWeight: 700, letterSpacing: ".2em",
                                    textTransform: "uppercase", color: "#999", marginBottom: "8px",
                                }}>
                                    The Missus Inner Circle
                                </p>

                                {/* Heading */}
                                <h2 style={{
                                    fontSize: "24px", fontWeight: 700, lineHeight: 1.15,
                                    color: "#000", marginBottom: "8px",
                                }}>
                                    Get early access to new drops
                                </h2>

                                {/* Sub */}
                                <p style={{ fontSize: "13px", color: "#666", marginBottom: "22px", lineHeight: 1.55 }}>
                                    Join the Missus Girls Club for exclusive deals, style inspo and first dibs on new arrivals.
                                </p>

                                {/* Perks row */}
                                <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                                    {["Early access", "Exclusive deals", "Style inspo"].map((perk) => (
                                        <span key={perk} style={{
                                            display: "inline-flex", alignItems: "center", gap: "5px",
                                            fontSize: "11px", fontWeight: 500, color: "#444",
                                        }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                            {perk}
                                        </span>
                                    ))}
                                </div>

                                {/* Form */}
                                <form onSubmit={submit} style={{ display: "flex", gap: "0" }}>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Your email address"
                                        aria-label="Email address"
                                        style={{
                                            flex: 1, height: "46px",
                                            border: "1.5px solid #000", borderRight: "none",
                                            padding: "0 14px", fontSize: "13px",
                                            outline: "none", background: "#fff",
                                            borderRadius: "999px 0 0 999px",
                                            fontFamily: "inherit",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            height: "46px", padding: "0 22px",
                                            background: loading ? "#555" : "#000", color: "#fff",
                                            fontWeight: 700, fontSize: "12px",
                                            letterSpacing: ".1em", textTransform: "uppercase",
                                            border: "1.5px solid #000",
                                            cursor: loading ? "wait" : "pointer",
                                            whiteSpace: "nowrap",
                                            borderRadius: "0 999px 999px 0",
                                            transition: "background .15s",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {loading ? "..." : "Join"}
                                    </button>
                                </form>

                                {error && (
                                    <p role="alert" style={{ fontSize: "12px", color: "#a00", marginTop: "8px" }}>{error}</p>
                                )}

                                {/* Fine print */}
                                <p style={{ fontSize: "10px", color: "#bbb", marginTop: "12px" }}>
                                    By subscribing you agree to receive marketing emails. Unsubscribe anytime.
                                </p>

                                {/* No thanks */}
                                <button
                                    onClick={dismiss}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        fontSize: "11px", color: "#aaa", marginTop: "10px",
                                        textDecoration: "underline", padding: 0, fontFamily: "inherit",
                                    }}
                                >
                                    No thanks
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes nlpop-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes nlpop-up {
                    from { transform: translateY(100%); opacity: 0.7; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @media (min-width: 640px) {
                    .nl-popup-panel {
                        /* Center as a card on wider screens */
                        border-top: none !important;
                        margin-bottom: 40px;
                    }
                    /* Override the bottom-sheet flex for desktop */
                    .nl-popup-panel {
                        box-shadow: 0 8px 48px rgba(0,0,0,0.18);
                    }
                }
                @media (max-width: 480px) {
                    .nl-popup-body {
                        padding: 22px 20px 28px !important;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .nl-popup-panel { animation: none !important; }
                }
            `}</style>
        </>
    );
}
