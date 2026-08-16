"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { loginUser, saveUser } from "@/lib/auth";

export default function UserLoginPage() {
    const router = useRouter();
    const [justRegistered, setJustRegistered] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setJustRegistered(params.get("registered") === "1");
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await loginUser(form.email, form.password);
        if (result.success && result.user) {
            saveUser(result.user);
            router.push("/account");
        } else {
            setError(result.error || "Login failed. Please check your credentials.");
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        border: "1.5px solid #e0e0e0",
        height: "48px",
        fontSize: "14px",
        outline: "none",
        background: "#fff",
        transition: "border .2s",
        boxSizing: "border-box",
        fontFamily: "'Barlow', sans-serif",
    };

    return (
        <div style={{ display: "flex", minHeight: "100svh" }}>

            {/* ── Left branding panel (desktop only) ── */}
            <div style={{
                display: "none",
                width: "45%",
                background: "#000",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "48px",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
            }} className="login-brand-panel">
                <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(232,0,45,0.08), transparent)" }} />

                <Link href="/" style={{ position: "relative", zIndex: 1, textDecoration: "none", display: "block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/missus-logo.webp" alt="Missus" style={{ height: "39px", width: "auto", filter: "brightness(0) invert(1)" }} />
                </Link>

                <div style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#e8002d", marginBottom: "16px" }}>
                        Welcome Back
                    </p>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(48px,5vw,64px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: .92, marginBottom: "20px" }}>
                        Dress Like<br /><span style={{ color: "#e8002d" }}>Her.</span>
                    </h2>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", fontWeight: 300, lineHeight: 1.6, maxWidth: "340px" }}>
                        Log in to track your orders, manage your wishlist, and get early access to new drops and exclusive Missus deals.
                    </p>
                </div>

                <div style={{ position: "relative", zIndex: 1, border: "1px solid rgba(255,255,255,.1)", padding: "20px" }}>
                    <div style={{ color: "#ffc107", fontSize: "14px", marginBottom: "10px" }}>★★★★★</div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,.7)", fontStyle: "italic", lineHeight: 1.6, marginBottom: "10px" }}>
                        &quot;Missus is really for the IT girls. Delivery in 45 mins, quality is unreal. Never switching.&quot;
                    </p>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#e8002d" }}>
                        Sarah O. — Lagos
                    </p>
                </div>
            </div>

            {/* ── Right / mobile form panel ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#fff", minWidth: 0 }}>
                <div style={{ width: "100%", maxWidth: "420px" }}>

                    {/* Mobile logo — hidden on desktop where the left panel has it */}
                    <div style={{ marginBottom: "28px", display: "block" }} className="login-mobile-logo">
                        <Link href="/" style={{ display: "inline-block", textDecoration: "none" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/missus-logo.webp" alt="Missus" style={{ height: "34px", width: "auto" }} />
                        </Link>
                    </div>

                    <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "32px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "4px", color: "#000" }}>
                        Sign In
                    </h1>
                    <p style={{ fontSize: "13px", color: "#767676", marginBottom: justRegistered ? "16px" : "28px" }}>
                        Don&apos;t have an account?{" "}
                        <Link href="/account/register" style={{ color: "#000", fontWeight: 600, textDecoration: "underline" }}>
                            Create one →
                        </Link>
                    </p>

                    {justRegistered && (
                        <div style={{ background: "#f0faf4", border: "1px solid #c8e6d4", color: "#007a3d", padding: "12px 14px", fontSize: "13px", marginBottom: "20px" }}>
                            ✓ Account created! Sign in below.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>
                                Email Address
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#aaa" }} aria-hidden="true" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    autoCapitalize="off"
                                    style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "16px" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#000")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#000" }}>
                                    Password
                                </label>
                                <Link href="/account/forgot-password" style={{ fontSize: "11px", color: "#767676", textDecoration: "underline" }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: "relative" }}>
                                <Lock style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#aaa" }} aria-hidden="true" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "48px" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#000")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px", display: "flex" }}
                                >
                                    {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", fontSize: "13px" }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", height: "50px",
                                background: loading ? "#555" : "#000", color: "#fff", border: "none",
                                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 900,
                                letterSpacing: ".14em", textTransform: "uppercase",
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                transition: "background .2s", marginTop: "4px",
                            }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#222"; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = loading ? "#555" : "#000"; }}
                        >
                            {loading ? "Signing In…" : "Sign In"}
                            {!loading && <ArrowRight style={{ width: "16px", height: "16px" }} strokeWidth={2.5} />}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                /* Show left brand panel on desktop */
                @media (min-width: 1024px) {
                    .login-brand-panel { display: flex !important; }
                    .login-mobile-logo { display: none !important; }
                }
            `}</style>
        </div>
    );
}
