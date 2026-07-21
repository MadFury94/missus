"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // WordPress lost password endpoint
            const res = await fetch("https://missusoutfits.com/wp-login.php?action=lostpassword", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ user_login: email, redirect_to: "", wp_submit: "Get New Password" }),
            });
            // WordPress always 200s this endpoint whether the email exists or not (security)
            setSent(true);
        } catch {
            setError("Could not reach the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", background: "#fff" }}>
            <div style={{ width: "100%", maxWidth: "420px" }}>
                <Link href="/account/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#767676", textDecoration: "none", marginBottom: "28px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
                    ← Back to Sign In
                </Link>

                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "32px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                    Forgot Password
                </h1>

                {!sent ? (
                    <>
                        <p style={{ fontSize: "13px", color: "#767676", marginBottom: "28px", lineHeight: 1.6 }}>
                            Enter the email address linked to your account. We&apos;ll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>
                                    Email Address
                                </label>
                                <div style={{ position: "relative" }}>
                                    <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#aaa" }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        style={{ width: "100%", border: "1.5px solid #e0e0e0", height: "44px", paddingLeft: "40px", paddingRight: "16px", fontSize: "13px", outline: "none", background: "#fff", transition: "border .2s", boxSizing: "border-box" }}
                                        onFocus={(e) => e.target.style.borderColor = "#000"}
                                        onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", fontSize: "13px" }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ width: "100%", height: "48px", background: loading ? "#555" : "#000", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background .2s" }}
                                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#222"; }}
                                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#000"; }}
                            >
                                {loading ? "Sending…" : "Send Reset Link"}
                                {!loading && <ArrowRight style={{ width: "16px", height: "16px" }} strokeWidth={2.5} />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#007a3d", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#000", marginBottom: "8px" }}>Check your inbox</p>
                        <p style={{ fontSize: "13px", color: "#767676", lineHeight: 1.6, marginBottom: "24px" }}>
                            If <strong>{email}</strong> is linked to a Missus account, you&apos;ll receive a password reset email shortly.
                        </p>
                        <Link
                            href="/account/login"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "underline" }}
                        >
                            ← Back to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
