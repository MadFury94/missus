"use client";

import { useState, useEffect } from "react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    // Pre-fill subject (and optional role hint) from query params
    // e.g. /contact?subject=careers&role=Social+Media+Creator
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qSubject = params.get("subject");
        const qRole = params.get("role");
        const validSubjects = ["general", "order", "returns", "collab", "other", "careers"];
        const resolvedSubject = qSubject && validSubjects.includes(qSubject) ? qSubject : "general";
        const roleHint = qRole ? `Applying for: ${qRole}\n\n` : "";
        setForm((f) => ({
            ...f,
            subject: resolvedSubject,
            message: roleHint,
        }));
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setSending(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || "Failed");
            setSent(true);
        } catch {
            alert("Something went wrong. Please email us directly at hello@missusoutfits.com");
        } finally {
            setSending(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%",
        border: "1.5px solid #e0e0e0",
        padding: "12px 14px",
        fontSize: "13px",
        fontFamily: "var(--font-barlow)",
        outline: "none",
        background: "#fff",
        color: "#000",
        transition: "border-color .15s",
    };

    return (
        <div style={{ background: "#fff" }}>

            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7F0E12", marginBottom: "10px" }}>
                    We&apos;re Here
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Contact Us
                </h1>
            </div>

            <div style={{ maxWidth: "960px", margin: "0 auto", padding: "60px 24px" }}>
                <div className="contact-grid">

                    {/* Left  info */}
                    <div>
                        <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "20px" }}>
                            Get in Touch
                        </h2>

                        {[
                            {
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                ),
                                label: "Location",
                                value: "Lagos, Nigeria",
                            },
                            {
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                ),
                                label: "Email",
                                value: "hello@missusoutfits.com",
                            },
                            {
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="2" y="2" width="20" height="20" rx="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                ),
                                label: "Instagram",
                                value: "@missusoutfits",
                            },
                        ].map((item) => (
                            <div key={item.label} style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "20px" }}>
                                <div style={{ width: "40px", height: "40px", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa", marginBottom: "2px" }}>
                                        {item.label}
                                    </p>
                                    <p style={{ fontSize: "14px", color: "#000", fontWeight: 500 }}>{item.value}</p>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: "32px", padding: "20px", background: "#f5f5f5", borderLeft: "3px solid #7F0E12" }}>
                            <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
                                Response Time
                            </p>
                            <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
                                We reply to all DMs and emails within <strong>1 hour</strong> during business hours (9am9pm WAT, MonSat).
                            </p>
                        </div>

                        {/* Collab anchor */}
                        <div id="collab" style={{ marginTop: "32px", padding: "20px", background: "#000", color: "#fff" }}>
                            <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#7F0E12", marginBottom: "6px" }}>
                                Want to Collab?
                            </p>
                            <p style={{ fontSize: "13px", color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>
                                Influencers, stylists, and content creators  we&apos;d love to work with you. Send us a message with your handle and rates.
                            </p>
                        </div>
                    </div>

                    {/* Right  form */}
                    <div>
                        {sent ? (
                            <div style={{ textAlign: "center", padding: "48px 24px", border: "1.5px solid #e0e0e0" }}>
                                <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉️</div>
                                <h3 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px" }}>
                                    Message Sent!
                                </h3>
                                <p style={{ fontSize: "13px", color: "#555" }}>
                                    We&apos;ll get back to you within 1 hour. Check your DMs too!
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div className="contact-form-row">
                                    <div>
                                        <label style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                                            Name *
                                        </label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Your name"
                                            style={inputStyle}
                                            onFocus={(e) => (e.target.style.borderColor = "#000")}
                                            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                                            Email *
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="your@email.com"
                                            style={inputStyle}
                                            onFocus={(e) => (e.target.style.borderColor = "#000")}
                                            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                                        Subject
                                    </label>
                                    <select
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        style={{ ...inputStyle, cursor: "pointer" }}
                                        onFocus={(e) => (e.target.style.borderColor = "#000")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                                    >
                                        <option value="general">General Enquiry</option>
                                        <option value="order">Order Issue</option>
                                        <option value="returns">Returns &amp; Refunds</option>
                                        <option value="collab">Collaboration / PR</option>
                                        <option value="careers">Careers</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Tell us what's on your mind..."
                                        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                                        onFocus={(e) => (e.target.style.borderColor = "#000")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    style={{ background: sending ? "#555" : "#000", color: "#fff", border: "none", height: "50px", fontFamily: "var(--font-barlow-condensed)", fontSize: "14px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: sending ? "not-allowed" : "pointer", transition: "background .2s" }}
                                >
                                    {sending ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
