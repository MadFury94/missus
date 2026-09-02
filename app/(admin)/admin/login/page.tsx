"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, saveUser, isAdmin } from "@/lib/auth";
import Link from "next/link";

export default function AdminLogin() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await loginUser(form.username, form.password);

        if (result.success && result.user) {
            console.log("Login successful. User:", result.user);
            console.log("User roles:", result.user.roles);

            if (!isAdmin(result.user)) {
                setError(`Access denied. Your roles: ${result.user.roles.join(", ")}. User ID: ${result.user.id}. Need: administrator or shop_manager`);
                setLoading(false);
                return;
            }

            saveUser(result.user);
            router.push("/admin");
        } else {
            console.error("Login failed:", result.error);
            setError(result.error || "Login failed");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div style={{ width: "100%", maxWidth: "420px", padding: "20px" }}>
                <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <Link href="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase", color: "#000", textDecoration: "none" }}>
                            MISSUS<span style={{ color: "#7F0E12" }}>.</span>
                        </Link>
                        <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>Admin Dashboard</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#333" }}>
                                Username or Email
                            </label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e8e8e8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border .2s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                                onBlur={(e) => e.target.style.borderColor = "#e8e8e8"}
                            />
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#333" }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e8e8e8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border .2s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                                onBlur={(e) => e.target.style.borderColor = "#e8e8e8"}
                            />
                        </div>

                        {error && (
                            <div style={{ background: "#fee", border: "1px solid #fcc", color: "#c00", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px" }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: loading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "15px",
                                fontWeight: 700,
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "transform .2s",
                                fontFamily: "'Barlow Condensed', sans-serif",
                                letterSpacing: ".04em",
                                textTransform: "uppercase"
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            {loading ? "Logging in..." : "Login to Dashboard"}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={{ marginTop: "24px", textAlign: "center" }}>
                        <Link href="/" style={{ fontSize: "13px", color: "#667eea", textDecoration: "none", fontWeight: 600 }}>
                            ? Back to Store
                        </Link>
                    </div>
                </div>

                {/* Info */}
                <div style={{ marginTop: "20px", textAlign: "center", color: "#fff", fontSize: "12px", opacity: 0.9 }}>
                    <p>Admin access only. Use your WordPress credentials.</p>
                </div>
            </div>
        </div>
    );
}
