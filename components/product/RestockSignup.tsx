"use client";

import { useState } from "react";

interface RestockSignupProps {
    productId: number;
    variationId?: number;
    selection: string;
    inline?: boolean; // For inline display under the button
}

export default function RestockSignup({ productId, variationId, selection, inline = false }: RestockSignupProps) {
    const [email, setEmail] = useState("");
    const [pending, setPending] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    async function subscribe(event: React.FormEvent) {
        event.preventDefault();
        setPending(true);
        setError("");

        try {
            const response = await fetch("/api/restock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, productId, variationId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not save your request. Please try again.");
            }

            setSaved(true);

            // Track restock signup for analytics
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'restock_signup', {
                    'product_id': productId,
                    'variation_id': variationId,
                    'selection': selection
                });
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : "Please try again.");
        } finally {
            setPending(false);
        }
    }

    if (inline) {
        // Inline version for under the "OUT OF STOCK" button
        return (
            <div id="restock-signup" style={{
                marginTop: "16px",
                padding: "20px",
                background: "#f8f9fa",
                border: "1px solid #e5e5e5",
                borderRadius: "12px"
            }}>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        background: "#000",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px"
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <path d="M8 12l2 2 4-4" />
                            <circle cx="12" cy="12" r="9" />
                        </svg>
                    </div>
                    <h3 style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#000",
                        marginBottom: "4px",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        Get notified when back in stock
                    </h3>
                    <p style={{
                        fontSize: "14px",
                        color: "#666",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        {selection ? `${selection} - ` : ""}We'll email you as soon as it's available
                    </p>
                </div>

                {saved ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <div style={{
                            width: "56px",
                            height: "56px",
                            background: "#1a7a3d",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px"
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                                <path d="M8 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                        </div>
                        <p style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#1a7a3d",
                            marginBottom: "8px",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            ✓ You're on the list!
                        </p>
                        <p style={{
                            fontSize: "14px",
                            color: "#666",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            We'll email you when this item is back in stock.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={subscribe} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <input
                            type="email"
                            required
                            maxLength={254}
                            autoComplete="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            placeholder="Enter your email address"
                            style={{
                                width: "100%",
                                border: "2px solid #e5e5e5",
                                borderRadius: "8px",
                                padding: "16px",
                                background: "white",
                                fontSize: "14px",
                                fontFamily: "'DM Sans', sans-serif",
                                outline: "none",
                                transition: "border-color 0.2s ease",
                                boxSizing: "border-box"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#000"}
                            onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                        />

                        <button
                            type="submit"
                            disabled={pending}
                            style={{
                                width: "100%",
                                padding: "16px",
                                background: "#000",
                                color: "#fff",
                                border: "none",
                                borderRadius: "999px",
                                fontSize: "14px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                cursor: pending ? "not-allowed" : "pointer",
                                opacity: pending ? 0.6 : 1,
                                transition: "opacity 0.2s ease",
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            {pending ? "Saving…" : "Notify me when available"}
                        </button>

                        {error && (
                            <p style={{
                                fontSize: "12px",
                                color: "#dc2626",
                                textAlign: "center",
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                {error}
                            </p>
                        )}

                        <p style={{
                            fontSize: "11px",
                            color: "#888",
                            textAlign: "center",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            📧 Restock alerts only • No spam • Unsubscribe anytime
                        </p>
                    </form>
                )}
            </div>
        );
    }

    // Original section version
    return (
        <section
            id="restock-signup"
            aria-label="Back in stock notification"
            style={{
                padding: "20px",
                border: "1px solid #ddd",
                background: "#fafafa",
                marginBottom: "20px",
                borderRadius: "8px"
            }}
        >
            <p style={{
                fontWeight: 700,
                fontSize: "14px",
                marginBottom: "8px",
                fontFamily: "'DM Sans', sans-serif"
            }}>
                Out of stock{selection ? ` — ${selection}` : ""}
            </p>

            {saved ? (
                <p role="status" style={{
                    fontSize: "13px",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    You're on the list. We'll email you when this option is back in stock.
                </p>
            ) : (
                <form onSubmit={subscribe}>
                    <p style={{
                        fontSize: "13px",
                        color: "#666",
                        marginBottom: "12px",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        Leave your email and we'll let you know when it's available again.
                    </p>

                    <label
                        htmlFor="restock-email"
                        style={{
                            display: "block",
                            fontSize: "12px",
                            marginBottom: "6px",
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        Email address
                    </label>

                    <input
                        id="restock-email"
                        type="email"
                        required
                        maxLength={254}
                        autoComplete="email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        style={{
                            width: "100%",
                            border: "1px solid #aaa",
                            padding: "12px",
                            background: "white",
                            fontSize: "14px",
                            fontFamily: "'DM Sans', sans-serif",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                        }}
                    />

                    <button
                        type="submit"
                        disabled={pending}
                        style={{
                            width: "100%",
                            padding: "13px",
                            marginTop: "10px",
                            background: "#000",
                            color: "#fff",
                            border: 0,
                            cursor: "pointer",
                            opacity: pending ? 0.6 : 1,
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        {pending ? "Saving…" : "Notify me when available"}
                    </button>

                    {error && (
                        <p role="alert" style={{
                            fontSize: "12px",
                            color: "#a00",
                            marginTop: "8px",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            {error}
                        </p>
                    )}

                    <p style={{
                        fontSize: "11px",
                        color: "#777",
                        marginTop: "10px",
                        fontFamily: "'DM Sans', sans-serif"
                    }}>
                        Only a restock alert for this item. No newsletter signup.
                    </p>
                </form>
            )}
        </section>
    );
}
