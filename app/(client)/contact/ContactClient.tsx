"use client";

import { useState, useEffect } from "react";

export default function ContactClient() {
    const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    // Pre-fill subject (and optional role hint) from query params
    // e.g. /contact?subject=careers&role=Social+Media+Creator
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qSubject = params.get("subject");
        const qRole = params.get("role");
        if (qSubject) {
            setForm(prev => ({
                ...prev,
                subject: qSubject,
                message: qRole ? `I'm interested in the ${qRole.replace(/\+/g, ' ')} position.` : ""
            }));
        }
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setSent(true);
                setForm({ name: "", email: "", subject: "general", message: "" });
            }
        } catch (err) {
            console.error("Contact form error:", err);
        } finally {
            setSending(false);
        }
    }

    if (sent) {
        return (
            <div style={{ minHeight: "60vh", padding: "80px 20px", textAlign: "center" }}>
                <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        background: "#000",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px"
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "36px",
                        fontWeight: 600,
                        marginBottom: "16px"
                    }}>
                        Message Sent!
                    </h1>
                    <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>
                        Thanks for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                        onClick={() => setSent(false)}
                        style={{
                            padding: "12px 32px",
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#fff" }}>
            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <h1 style={{
                    fontFamily: "var(--font-display, 'Cormorant', serif)",
                    fontSize: "clamp(40px, 7vw, 60px)",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "16px"
                }}>
                    Get in Touch
                </h1>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }}>
                    We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
            </div>

            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>

                    {/* Contact Info */}
                    <div>
                        <h2 style={{
                            fontSize: "24px",
                            fontWeight: 600,
                            marginBottom: "24px"
                        }}>
                            Contact Information
                        </h2>

                        <div style={{ marginBottom: "32px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                                Customer Support
                            </h3>
                            <p style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                                Email: hello@missusoutfits.com
                            </p>
                            <p style={{ fontSize: "14px", color: "#666" }}>
                                Response time: Within 24 hours
                            </p>
                        </div>

                        <div style={{ marginBottom: "32px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                                Social Media
                            </h3>
                            <p style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                                Instagram: @missusoutfits
                            </p>
                            <p style={{ fontSize: "14px", color: "#666" }}>
                                For quick responses, DM us on Instagram
                            </p>
                        </div>

                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                                Business Hours
                            </h3>
                            <p style={{ fontSize: "14px", color: "#666" }}>
                                Monday - Friday: 9am - 6pm WAT<br />
                                Saturday: 10am - 4pm WAT<br />
                                Sunday: Closed
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                        <div>
                            <label style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 600,
                                marginBottom: "6px"
                            }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #ddd",
                                    fontSize: "14px",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 600,
                                marginBottom: "6px"
                            }}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #ddd",
                                    fontSize: "14px",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 600,
                                marginBottom: "6px"
                            }}>
                                Subject
                            </label>
                            <select
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #ddd",
                                    fontSize: "14px",
                                    boxSizing: "border-box"
                                }}
                            >
                                <option value="general">General Inquiry</option>
                                <option value="order">Order Support</option>
                                <option value="returns">Returns & Exchanges</option>
                                <option value="careers">Careers</option>
                                <option value="press">Press & Media</option>
                                <option value="wholesale">Wholesale Inquiries</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: 600,
                                marginBottom: "6px"
                            }}>
                                Message *
                            </label>
                            <textarea
                                required
                                rows={5}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Tell us how we can help you..."
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #ddd",
                                    fontSize: "14px",
                                    resize: "vertical",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            style={{
                                padding: "14px",
                                background: sending ? "#ccc" : "#000",
                                color: "#fff",
                                border: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: sending ? "not-allowed" : "pointer",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}
                        >
                            {sending ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}