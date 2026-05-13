import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service — Missus",
    description: "Terms and conditions for shopping with Missus Outfits.",
};

export default function TermsPage() {
    return (
        <div style={{ background: "#fff" }}>
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Terms of Service
                </h1>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,.4)", marginTop: "14px" }}>Last updated: January 2026</p>
            </div>

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px 64px" }}>
                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8, marginBottom: "32px" }}>
                    By using the Missus Outfits website and placing an order, you agree to the following terms. Please read them carefully.
                </p>

                {[
                    {
                        title: "1. General",
                        body: `These terms apply to all purchases made through missusoutfits.com. Missus Outfits reserves the right to update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.`,
                    },
                    {
                        title: "2. Orders & Pricing",
                        body: `All prices are listed in Nigerian Naira (₦) and are inclusive of applicable taxes. We reserve the right to cancel or refuse any order at our discretion — for example, if a pricing error occurs or if stock is unavailable. You will be notified and fully refunded in such cases.`,
                    },
                    {
                        title: "3. Payment",
                        body: `Payment is required at the time of order unless Pay on Delivery is selected (Lagos only). We accept Visa, Mastercard, bank transfers, Paystack, Flutterwave, and OPay. All transactions are secured and encrypted.`,
                    },
                    {
                        title: "4. Delivery",
                        body: `Delivery timeframes are estimates and not guaranteed. Missus is not liable for delays caused by third-party couriers, weather, or circumstances beyond our control. Risk of loss passes to you upon delivery.`,
                    },
                    {
                        title: "5. Returns & Refunds",
                        body: `Returns are accepted within 7 days of delivery for eligible items in original condition. Refunds are issued as store credit only. See our full Returns Policy for details.`,
                    },
                    {
                        title: "6. Intellectual Property",
                        body: `All content on this website — including images, text, logos, and designs — is the property of Missus Outfits. You may not reproduce, distribute, or use our content without written permission.`,
                    },
                    {
                        title: "7. Limitation of Liability",
                        body: `Missus Outfits is not liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability to you shall not exceed the amount paid for the order in question.`,
                    },
                    {
                        title: "8. Governing Law",
                        body: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved under Nigerian jurisdiction.`,
                    },
                    {
                        title: "9. Contact",
                        body: `Questions? Email hello@missusoutfits.com or visit our Contact page.`,
                    },
                ].map((section) => (
                    <div key={section.title} style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1.5px solid #000" }}>
                            {section.title}
                        </h2>
                        <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.8 }}>{section.body}</p>
                    </div>
                ))}

                <div style={{ background: "#f5f5f5", padding: "20px 24px", marginTop: "8px" }}>
                    <p style={{ fontSize: "13px", color: "#555" }}>
                        For any questions about these terms, <Link href="/contact" style={{ color: "#000", fontWeight: 700 }}>contact us</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
