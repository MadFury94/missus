"use client";
import { useState } from "react";
import Link from "next/link";

const TRUST_ITEMS = [
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
        title: "Lagos: 1–2 Hours",
        sub: "Express delivery available",
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
            </svg>
        ),
        title: "Easy Returns",
        sub: "7-day hassle-free returns",
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Secure Checkout",
        sub: "100% safe & encrypted",
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: "24/7 DM Support",
        sub: "Reply within 1 hour",
    },
];

export default function NewsletterBar({
    heading = "Join Missus Girls Club",
    sub = "Early drops, exclusive deals & style inspo — straight to your inbox.",
}: {
    heading?: string;
    sub?: string;
}) {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (email) setDone(true);
    }

    return (
        <>
            <style>{`
                .newsletter-bar {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border-top: 3px solid #000;
                }
                .newsletter-left {
                    background: #f5f5f5;
                    padding: 36px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 16px;
                }
                .newsletter-right {
                    background: #0a0a0a;
                    padding: 36px 40px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                }
                .trust-cell {
                    padding: 20px 16px;
                    border-right: 1px solid rgba(255,255,255,.07);
                    border-bottom: 1px solid rgba(255,255,255,.07);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .trust-cell:nth-child(2n) { border-right: none; }
                .trust-cell:nth-child(3),
                .trust-cell:nth-child(4) { border-bottom: none; }

                @media (max-width: 900px) {
                    .newsletter-bar { grid-template-columns: 1fr; }
                    .newsletter-right { padding: 28px 20px; }
                    .newsletter-left { padding: 28px 20px; }
                }
                @media (max-width: 480px) {
                    .newsletter-right { grid-template-columns: 1fr; }
                    .trust-cell { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.07) !important; }
                    .trust-cell:last-child { border-bottom: none !important; }
                }
            `}</style>

            <div className="newsletter-bar">
                {/* Left — newsletter signup */}
                <div className="newsletter-left">
                    <div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#999", marginBottom: "6px" }}>
                            The Missus Inner Circle
                        </p>
                        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase", lineHeight: 1, marginBottom: "6px" }}>
                            {heading}
                        </h3>
                        <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.6 }}>
                            {sub}{" "}
                            <Link href="/newsletter" style={{ color: "#000", fontWeight: 600, textDecoration: "underline" }}>Learn more →</Link>
                        </p>
                    </div>

                    {done ? (
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 700, color: "#000" }}>You&apos;re in! ✓</p>
                    ) : (
                        <form onSubmit={submit} style={{ display: "flex", maxWidth: "420px" }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                style={{ flex: 1, border: "1.5px solid #000", borderRight: "none", padding: "0 14px", height: "44px", fontFamily: "'Barlow', sans-serif", fontSize: "13px", outline: "none", background: "#fff" }}
                            />
                            <button type="submit" style={{ height: "44px", padding: "0 22px", background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", fontSize: "12px", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>

                {/* Right — trust items */}
                <div className="newsletter-right">
                    {TRUST_ITEMS.map((item) => (
                        <div key={item.title} className="trust-cell">
                            <div style={{ color: "rgba(255,255,255,.5)", marginBottom: "4px" }}>
                                {item.icon}
                            </div>
                            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", lineHeight: 1.2 }}>
                                {item.title}
                            </p>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,.4)", fontWeight: 300, lineHeight: 1.4 }}>
                                {item.sub}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
