"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || "Failed");
            setDone(true);
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ background: "#fff", minHeight: "60vh" }}>
            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7F0E12", marginBottom: "10px" }}>
                    Stay in the Loop
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Join the<br /><span style={{ color: "#7F0E12" }}>Missus Circle</span>
                </h1>
            </div>

            <div style={{ maxWidth: "560px", margin: "0 auto", padding: "56px 24px 64px", textAlign: "center" }}>
                {done ? (
                    <div>
                        <div style={{ fontSize: "56px", marginBottom: "20px" }}>💌</div>
                        <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "28px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "12px" }}>
                            You&apos;re In!
                        </h2>
                        <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.7, marginBottom: "28px" }}>
                            Welcome to the Missus Circle. Expect early drops, exclusive deals, and style inspo straight to your inbox.
                        </p>
                        <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 36px", textDecoration: "none", display: "inline-block" }}>
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <>
                        <p style={{ fontSize: "15px", color: "#444", lineHeight: 1.8, marginBottom: "32px" }}>
                            Get early access to new drops, exclusive discount codes, and style inspo  straight to your inbox. No spam, ever.
                        </p>

                        {/* Perks */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px", textAlign: "left" }}>
                            {[
                                { icon: "✨", text: "Early access to new collections before anyone else" },
                                { icon: "🎁", text: "Exclusive subscriber-only discount codes" },
                                { icon: "💅", text: "Style inspo, trend reports & outfit ideas" },
                                { icon: "⚡", text: "Flash sale alerts & free shipping events" },
                            ].map((perk) => (
                                <div key={perk.text} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px", background: "#f5f5f5" }}>
                                    <span style={{ fontSize: "18px", flexShrink: 0 }}>{perk.icon}</span>
                                    <span style={{ fontSize: "13px", color: "#333", lineHeight: 1.6 }}>{perk.text}</span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your first name"
                                style={{ width: "100%", border: "1.5px solid #e0e0e0", padding: "14px 16px", fontSize: "14px", fontFamily: "var(--font-barlow)", outline: "none", transition: "border-color .15s" }}
                                onFocus={(e) => (e.target.style.borderColor = "#000")}
                                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                required
                                style={{ width: "100%", border: "1.5px solid #e0e0e0", padding: "14px 16px", fontSize: "14px", fontFamily: "var(--font-barlow)", outline: "none", transition: "border-color .15s" }}
                                onFocus={(e) => (e.target.style.borderColor = "#000")}
                                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ background: loading ? "#555" : "#000", color: "#fff", border: "none", height: "52px", fontFamily: "var(--font-barlow-condensed)", fontSize: "15px", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", transition: "background .2s" }}
                            >
                                {loading ? "Subscribing..." : "Join the Circle ?"}
                            </button>
                        </form>

                        <p style={{ fontSize: "11px", color: "#aaa", marginTop: "16px" }}>
                            By subscribing you agree to receive marketing emails from Missus. Unsubscribe anytime.{" "}
                            <Link href="/privacy" style={{ color: "#555", textDecoration: "underline" }}>Privacy Policy</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
