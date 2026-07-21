"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { loginUser, saveUser } from "@/lib/auth";

export default function UserLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const justRegistered = searchParams.get("registered") === "1";
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    return (
        <div className="min-h-screen flex">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-black flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px)" }} />
                <div className="absolute bottom-0 left-0 right-0 h-[50%]" style={{ background: "linear-gradient(to top, rgba(232,0,45,0.08), transparent)" }} />

                <Link href="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", position: "relative", zIndex: 1, textDecoration: "none" }}>
                    MISSUS<span style={{ color: "#e8002d" }}>.</span>
                </Link>

                <div style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#e8002d", marginBottom: "16px" }}>Welcome Back</p>
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
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#e8002d" }}>Sarah O. — Lagos</p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
                <div className="w-full max-w-[420px]">
                    <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "32px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "4px", color: "#000" }}>
                        Sign In
                    </h1>
                    <p style={{ fontSize: "13px", color: "#767676", marginBottom: "28px" }}>
                        Don&apos;t have an account?{" "}
                        <Link href="/account/register" style={{ color: "#000", fontWeight: 600, textDecoration: "underline" }}>
                            Create one →
                        </Link>
                    </p>

                    {justRegistered && (
                        <div style={{ background: "#f0faf4", border: "1px solid #c8e6d4", color: "#007a3d", padding: "12px 14px", fontSize: "13px", marginBottom: "20px", borderRadius: "2px" }}>
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
                                <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#aaa" }} />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                    style={{ width: "100%", border: "1.5px solid #e0e0e0", height: "44px", paddingLeft: "40px", paddingRight: "16px", fontSize: "13px", outline: "none", background: "#fff", transition: "border .2s", boxSizing: "border-box" }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#000" }}>Password</label>
                                <Link href="/account/forgot-password" style={{ fontSize: "11px", color: "#767676", textDecoration: "underline" }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: "relative" }}>
                                <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#aaa" }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: "100%", border: "1.5px solid #e0e0e0", height: "44px", paddingLeft: "40px", paddingRight: "44px", fontSize: "13px", outline: "none", background: "#fff", transition: "border .2s", boxSizing: "border-box" }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex" }}
                                >
                                    {showPassword ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", fontSize: "13px", borderRadius: "2px" }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: "100%", height: "48px", background: loading ? "#555" : "#000", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background .2s", marginTop: "4px" }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#222"; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#000"; }}
                        >
                            {loading ? "Signing In…" : "Sign In"}
                            {!loading && <ArrowRight style={{ width: "16px", height: "16px" }} strokeWidth={2.5} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
