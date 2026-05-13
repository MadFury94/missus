import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — Missus",
    description: "How Missus collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
    return (
        <div style={{ background: "#fff" }}>
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Privacy Policy
                </h1>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,.4)", marginTop: "14px" }}>Last updated: January 2026</p>
            </div>

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px 64px" }}>
                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8, marginBottom: "32px" }}>
                    Missus Outfits (&quot;Missus&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights.
                </p>

                {[
                    {
                        title: "Information We Collect",
                        body: `When you place an order or create an account, we collect your name, email address, phone number, delivery address, and payment information. Payment details are processed securely by Paystack or Flutterwave — we do not store your card details. We also collect basic usage data (pages visited, device type) to improve our website.`,
                    },
                    {
                        title: "How We Use Your Information",
                        body: `We use your information to process and deliver your orders, send order confirmations and delivery updates, respond to your enquiries, and improve our products and services. We may send you promotional messages if you've opted in — you can unsubscribe at any time.`,
                    },
                    {
                        title: "Sharing Your Information",
                        body: `We do not sell your personal data. We share your information only with third parties necessary to fulfil your order — delivery partners, payment processors (Paystack, Flutterwave), and our e-commerce platform (WooCommerce). All partners are bound by confidentiality agreements.`,
                    },
                    {
                        title: "Cookies",
                        body: `Our website uses cookies to keep your cart active, remember your preferences, and understand how visitors use the site. You can disable cookies in your browser settings, but some features may not work correctly.`,
                    },
                    {
                        title: "Your Rights",
                        body: `You have the right to access, correct, or delete your personal data at any time. To make a request, email us at hello@missusoutfits.com. We'll respond within 5 business days.`,
                    },
                    {
                        title: "Data Security",
                        body: `We use industry-standard security measures to protect your data. All transactions are encrypted via SSL. However, no method of transmission over the internet is 100% secure — we encourage you to use strong passwords and keep your account details private.`,
                    },
                    {
                        title: "Contact",
                        body: `Questions about this policy? Email us at hello@missusoutfits.com or DM us on Instagram @missusoutfits.`,
                    },
                ].map((section) => (
                    <div key={section.title} style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1.5px solid #000" }}>
                            {section.title}
                        </h2>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8 }}>{section.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
