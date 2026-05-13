"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
    {
        category: "Orders & Delivery",
        items: [
            {
                q: "How fast do you deliver in Lagos?",
                a: "Lagos orders are typically delivered within 1–2 hours of dispatch. We dispatch same-day for orders placed before 6pm. Orders placed after 6pm are dispatched the next morning.",
            },
            {
                q: "Do you deliver nationwide?",
                a: "Yes! We deliver to all states in Nigeria. Abuja and Port Harcourt take 1–2 business days. Other states take 2–4 business days. See our full shipping info for rates.",
            },
            {
                q: "Can I pay on delivery?",
                a: "Pay on Delivery is available for Lagos orders only. Select it at checkout. Note that POD orders may take slightly longer to confirm.",
            },
            {
                q: "How do I track my order?",
                a: "Once your order is dispatched, you'll receive a WhatsApp message or email with tracking details. You can also DM us on Instagram @missusoutfits with your order number for a real-time update.",
            },
            {
                q: "Can I change or cancel my order?",
                a: "Contact us immediately via DM or email. If your order hasn't been dispatched yet, we can make changes. Once it's on its way, we can't cancel but you can return it after delivery.",
            },
        ],
    },
    {
        category: "Products & Sizing",
        items: [
            {
                q: "How do I know what size to order?",
                a: "Each product page has a size guide. We recommend checking measurements rather than going by label size alone. If you're between sizes, size up — our pieces are designed to be worn with confidence.",
            },
            {
                q: "Are the colours accurate in photos?",
                a: "We do our best to represent colours accurately. Slight variations can occur due to screen settings and lighting. If you're unsure about a colour, DM us and we'll send you more photos.",
            },
            {
                q: "Is the quality good?",
                a: "Yes — quality is something we take seriously. Every piece is checked before it ships. If you ever receive something that doesn't meet your expectations, contact us and we'll sort it.",
            },
        ],
    },
    {
        category: "Returns & Refunds",
        items: [
            {
                q: "What is your return policy?",
                a: "We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in original condition with tags. Returns are issued as store credit — no cash refunds.",
            },
            {
                q: "How do I start a return?",
                a: "DM us on Instagram or email hello@missusoutfits.com with your order number and reason. We'll guide you through the process.",
            },
            {
                q: "Can I return sale items?",
                a: "Sale items marked as final sale cannot be returned. All other items follow our standard 7-day return policy.",
            },
        ],
    },
    {
        category: "Payments",
        items: [
            {
                q: "What payment methods do you accept?",
                a: "We accept Visa, Mastercard, bank transfers via Paystack, Flutterwave, and OPay. Pay on Delivery is available for Lagos orders.",
            },
            {
                q: "Is it safe to pay on your website?",
                a: "Yes. All payments are processed through Paystack and Flutterwave — both are PCI-DSS compliant and fully encrypted. We never store your card details.",
            },
        ],
    },
];

export default function FAQPage() {
    const [open, setOpen] = useState<string | null>(null);

    function toggle(key: string) {
        setOpen((prev) => (prev === key ? null : key));
    }

    return (
        <div style={{ background: "#fff" }}>

            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#e8002d", marginBottom: "10px" }}>
                    Got Questions?
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    FAQ
                </h1>
            </div>

            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px 64px" }}>
                {FAQS.map((section) => (
                    <div key={section.category} style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1.5px solid #000" }}>
                            {section.category}
                        </h2>

                        {section.items.map((item) => {
                            const key = `${section.category}-${item.q}`;
                            const isOpen = open === key;
                            return (
                                <div key={key} style={{ borderBottom: "1px solid #e8e8e8" }}>
                                    <button
                                        onClick={() => toggle(key)}
                                        style={{ width: "100%", background: "none", border: "none", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", cursor: "pointer", textAlign: "left" }}
                                    >
                                        <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "15px", fontWeight: 700, letterSpacing: ".02em", color: "#000" }}>
                                            {item.q}
                                        </span>
                                        <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 300, color: "#000", flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .2s" }}>
                                            +
                                        </span>
                                    </button>
                                    {isOpen && (
                                        <div style={{ paddingBottom: "16px", fontSize: "13px", color: "#555", lineHeight: 1.8 }}>
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Still need help */}
                <div style={{ background: "#f5f5f5", padding: "32px", textAlign: "center", marginTop: "16px" }}>
                    <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                        Still Need Help?
                    </p>
                    <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px" }}>
                        Our team replies within 1 hour during business hours.
                    </p>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/contact" style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none" }}>
                            Contact Us
                        </Link>
                        <a href="https://instagram.com/missusoutfits" target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#000", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none", border: "1.5px solid #000" }}>
                            DM on Instagram
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
