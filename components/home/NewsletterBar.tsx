"use client";
import { useState } from "react";
import Link from "next/link";

export default function NewsletterBar() {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (email) setDone(true);
    }

    return (
        <div style={{ background: "#f5f5f5", borderTop: "3px solid #000", padding: "28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
            <div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>Join The Missus Circle</h3>
                <p style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>
                    Get early drops, exclusive deals & style inspo — straight to your inbox.{" "}
                    <Link href="/newsletter" style={{ color: "#000", fontWeight: 600, textDecoration: "underline" }}>Learn more →</Link>
                </p>
            </div>
            {done ? (
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 700, color: "#000" }}>You&apos;re in! ✓</p>
            ) : (
                <form onSubmit={submit} style={{ display: "flex", flex: 1, maxWidth: "500px" }}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        style={{ flex: 1, border: "1.5px solid #000", borderRight: "none", padding: "0 14px", height: "44px", fontFamily: "'Barlow', sans-serif", fontSize: "13px", outline: "none", background: "#fff" }}
                    />
                    <button type="submit" style={{ height: "44px", padding: "0 24px", background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", fontSize: "12px", border: "none", cursor: "pointer" }}>
                        Subscribe
                    </button>
                </form>
            )}
        </div>
    );
}
