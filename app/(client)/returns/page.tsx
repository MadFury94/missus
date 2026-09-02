import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Returns & Refunds  Missus",
    description: "Our returns and refund policy. Easy 7-day returns on eligible items.",
};

export default function ReturnsPage() {
    return (
        <div style={{ background: "#fff" }}>

            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7F0E12", marginBottom: "10px" }}>
                    Hassle-Free
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Returns
                </h1>
            </div>

            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px 64px" }}>

                {/* Quick summary */}
                <div className="returns-summary-grid">
                    {[
                        { icon: "7", label: "Days to Return", sub: "From delivery date" },
                        { icon: "?", label: "Store Credit", sub: "Issued within 24hrs" },
                        { icon: "?", label: "Easy Process", sub: "Just DM us" },
                    ].map((item) => (
                        <div key={item.label} style={{ border: "1.5px solid #000", padding: "20px", textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "28px", fontWeight: 900, marginBottom: "6px" }}>{item.icon}</div>
                            <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{item.label}</p>
                            <p style={{ fontSize: "11px", color: "#767676", marginTop: "4px" }}>{item.sub}</p>
                        </div>
                    ))}
                </div>

                <Section title="Return Policy">
                    <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8, marginBottom: "12px" }}>
                        We accept returns within <strong>7 days</strong> of delivery. Items must be unworn, unwashed, and in their original condition with tags attached. Returns are issued as <strong>store credit</strong>  we do not offer cash refunds.
                    </p>
                    <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8 }}>
                        Store credit never expires and can be used on any future order.
                    </p>
                </Section>

                <Section title="Items Not Eligible for Return">
                    <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                            "Sale items (marked as final sale)",
                            "Swimwear and lingerie",
                            "Items that have been worn, washed, or altered",
                            "Items without original tags",
                            "Gift cards",
                        ].map((item) => (
                            <li key={item} style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>{item}</li>
                        ))}
                    </ul>
                </Section>

                <Section title="How to Return">
                    <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            "DM us on Instagram @missusoutfits or email hello@missusoutfits.com within 7 days of receiving your order.",
                            "Include your order number and reason for return.",
                            "We'll confirm eligibility and send you return instructions.",
                            "Drop off or arrange pickup (Lagos only  nationwide customers cover return shipping).",
                            "Once we receive and inspect the item, store credit is issued within 24 hours.",
                        ].map((step, i) => (
                            <li key={i} style={{ fontSize: "13px", color: "#444", lineHeight: 1.7 }}>
                                <strong style={{ fontFamily: "var(--font-barlow-condensed)", fontWeight: 700 }}>Step {i + 1}:</strong> {step}
                            </li>
                        ))}
                    </ol>
                </Section>

                <Section title="Damaged or Wrong Item?">
                    <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8, marginBottom: "16px" }}>
                        If you received a damaged, defective, or incorrect item, we&apos;ll make it right immediately  no questions asked. Contact us within 48 hours of delivery with a photo of the item.
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
