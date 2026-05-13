import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Shipping Info — Missus",
    description: "Shipping rates, delivery times, and everything you need to know about getting your Missus order.",
};

export default function ShippingPage() {
    return (
        <div style={{ background: "#fff" }}>

            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#e8002d", marginBottom: "10px" }}>
                    Delivery
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Shipping Info
                </h1>
            </div>

            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px 64px" }}>

                {/* Free shipping callout */}
                <div style={{ background: "#000", color: "#fff", padding: "20px 24px", marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8002d" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                        Free shipping on all orders ₦150,000 and above
                    </p>
                </div>

                {/* Delivery options */}
                <Section title="Delivery Options">
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #000" }}>
                                {["Zone", "Timeframe", "Cost"].map((h) => (
                                    <th key={h} style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "10px 12px", textAlign: "left", color: "#000" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["Lagos (Island & Mainland)", "1–2 hours", "₦2,500"],
                                ["Lagos (Outskirts)", "2–4 hours", "₦3,500"],
                                ["Abuja", "Next day", "₦4,500"],
                                ["Port Harcourt", "1–2 business days", "₦4,500"],
                                ["Other States", "2–4 business days", "₦5,000"],
                                ["Orders ₦150,000+", "Any zone", "FREE"],
                            ].map(([zone, time, cost], i) => (
                                <tr key={zone} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                    <td style={{ padding: "12px", color: "#333", fontWeight: cost === "FREE" ? 700 : 400 }}>{zone}</td>
                                    <td style={{ padding: "12px", color: "#555" }}>{time}</td>
                                    <td style={{ padding: "12px", fontWeight: 700, color: cost === "FREE" ? "#007a3d" : "#000" }}>{cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                <Section title="How It Works">
                    <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            "Place your order and complete payment at checkout.",
                            "You'll receive an order confirmation via email or WhatsApp.",
                            "We process and dispatch your order within 1–2 hours (Lagos) or same day (nationwide).",
                            "You'll get a tracking update once your order is on its way.",
                            "Receive your order and look amazing.",
                        ].map((step, i) => (
                            <li key={i} style={{ fontSize: "13px", color: "#444", lineHeight: 1.7 }}>
                                <strong style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700 }}>Step {i + 1}:</strong> {step}
                            </li>
                        ))}
                    </ol>
                </Section>

                <Section title="Pay on Delivery">
                    <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8 }}>
                        Pay on Delivery is available for Lagos orders only. Select <strong>Pay on Delivery</strong> at checkout. Please note that orders with Pay on Delivery may take slightly longer to process as we confirm availability first.
                    </p>
                </Section>

                <Section title="Order Tracking">
                    <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8 }}>
                        Once your order is dispatched, you&apos;ll receive a WhatsApp message or email with your tracking details. For real-time updates, DM us on Instagram{" "}
                        <strong>@missusoutfits</strong> with your order number.
                    </p>
                </Section>

                <Section title="Issues with Your Delivery?">
                    <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8, marginBottom: "16px" }}>
                        If your order is delayed, damaged, or missing, contact us immediately. We&apos;ll sort it out — no stress.
                    </p>
                    <Link href="/contact" style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none", display: "inline-block" }}>
                        Contact Us
                    </Link>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1.5px solid #000" }}>
                {title}
            </h2>
            {children}
        </div>
    );
}
