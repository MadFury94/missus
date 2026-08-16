"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setLoading(true);
        try {
            // All registration goes through our server-side proxy to avoid CORS
            const res = await fetch("/api/account/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    first_name: form.firstName,
                    last_name: form.lastName,
                    billing: { phone: form.phone },
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Registration failed. Please try again.");
            }
            router.push("/account/login?registered=1");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", border: "1.5px solid #e0e0e0", height: "44px",
        paddingLeft: "40px", paddingRight: "16px", fontSize: "13px",
        outline: "none", background: "#fff", transition: "border .2s", boxSizing: "border-box",
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex" }}>
            {/* Left brand panel */}
            <div style={{ display: "none", width: "45%", background: "#000", flexDirection: "column", justifyContent: "space-between", padding: "48px" }} className="lg-panel">
                <Link href="/" style={{ textDecoration: "none", display: "block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/missus-logo.webp" alt="Missus" style={{ height: "39px", width: "auto", filter: "brightness(0) invert(1)" }} />
                </Link>
                <div>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#e8002d", marginBottom: "16px" }}>Join the Club</p>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(48px,5vw,64px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: .92, marginBottom: "20px" }}>
                        Dress Like<br /><span style={{ color: "#e8002d" }}>Her.</span>
                    </h2>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", fontWeight: 300, lineHeight: 1.6, maxWidth: "340px" }}>
                        Create your account to track orders, save your wishlist and get early access to new drops.
                    </p>
                </div>
                <div style={{ border: "1px solid rgba(255,255,255,.1)", padding: "20px" }}>
                    <div style={{ color: "#ffc107", fontSize: "14px", marginBottom: "8px" }}>★★★★★</div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,.7)", fontStyle: "italic", lineHeight: 1.6, marginBottom: "8px" }}>
                        &quot;I ordered my dress at noon and it was at my door by 2pm. Missus is built different.&quot;
                    </p>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#e8002d" }}>Temi A. — Lagos</p>
                </div>
            </div>

            {/* Right form */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", background: "#fff" }}>
                <div style={{ width: "100%", maxWidth: "420px" }}>
                    <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "32px", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "4px", color: "#000" }}>
                        Create Account
                    </h1>
                    <p style={{ fontSize: "13px", color: "#767676", marginBottom: "28px" }}>
                        Already have an account?{" "}
                        <Link href="/account/login" style={{ color: "#000", fontWeight: 600, textDecoration: "underline" }}>Sign in →</Link>
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {/* Name row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {(["firstName", "lastName"] as const).map((field) => (
                                <div key={field}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>
                                        {field === "firstName" ? "First Name" : "Last Name"}
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#aaa" }} />
                                        <input
                                            type="text"
                                            value={form[field]}
                                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                            required
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = "#000"}
                                            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#aaa" }} />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>Phone Number</label>
                            <div style={{ position: "relative" }}>
                                <Phone style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#aaa" }} />
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+234 800 000 0000"
                                    style={{ ...inputStyle }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#aaa" }} />
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    required
                                    style={{ ...inputStyle, paddingRight: "44px" }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex" }}>
                                    {showPw ? <EyeOff style={{ width: "15px", height: "15px" }} /> : <Eye style={{ width: "15px", height: "15px" }} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>Confirm Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#aaa" }} />
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={form.confirm}
                                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                    placeholder="Repeat password"
                                    required
                                    style={{ ...inputStyle }}
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
                            style={{ width: "100%", height: "48px", background: loading ? "#555" : "#000", color: "#fff", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background .2s", marginTop: "4px" }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#222"; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#000"; }}
                        >
                            {loading ? "Creating Account…" : "Create Account"}
                            {!loading && <ArrowRight style={{ width: "16px", height: "16px" }} strokeWidth={2.5} />}
                        </button>

                        <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", lineHeight: 1.6 }}>
                            By creating an account you agree to our{" "}
                            <Link href="/terms" style={{ color: "#555", textDecoration: "underline" }}>Terms</Link> and{" "}
                            <Link href="/privacy" style={{ color: "#555", textDecoration: "underline" }}>Privacy Policy</Link>.
                        </p>
                    </form>
                </div>
            </div>

            <style>{`@media(min-width:1024px){.lg-panel{display:flex!important}}`}</style>
        </div>
    );
}
