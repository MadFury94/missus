import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Careers — Missus",
    description: "Join the Missus team. We're a small but fast-moving Lagos fashion brand always looking for passionate people.",
};

const ROLES = [
    {
        title: "Social Media & Content Creator",
        type: "Part-time / Freelance",
        location: "Lagos (Remote-friendly)",
        desc: "We need someone who lives on Instagram and TikTok, understands fashion content, and can make our pieces look irresistible. Reels, styling videos, product shoots — that's you.",
    },
    {
        title: "Customer Experience Rep",
        type: "Full-time",
        location: "Lagos",
        desc: "You'll be the first voice our customers hear. Handling DMs, resolving order issues, and making sure every Missus customer feels like a VIP. Must be warm, fast, and solution-oriented.",
    },
    {
        title: "Delivery & Logistics Coordinator",
        type: "Full-time",
        location: "Lagos",
        desc: "Coordinating same-day deliveries across Lagos, managing dispatch riders, and making sure orders get out on time. Organised, calm under pressure, and knows Lagos like the back of your hand.",
    },
];

export default function CareersPage() {
    return (
        <div style={{ background: "#fff" }}>

            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#630D13", marginBottom: "10px" }}>
                    Join the Team
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Careers
                </h1>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,.55)", fontWeight: 300, marginTop: "18px", maxWidth: "480px", margin: "18px auto 0", lineHeight: 1.7 }}>
                    We&apos;re a small, fast-moving team building something real. If you love fashion, hustle hard, and want to grow with a brand — read on.
                </p>
            </div>

            {/* Intro */}
            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px 40px" }}>
                <div style={{ borderLeft: "3px solid #630D13", paddingLeft: "20px", marginBottom: "48px" }}>
                    <p style={{ fontSize: "15px", color: "#333", lineHeight: 1.8 }}>
                        Missus is a Lagos-based women&apos;s fashion brand. We&apos;re not a corporation — we&apos;re a tight team that moves fast, cares deeply about our customers, and is building something the Nigerian fashion space has never seen. Every role here matters.
                    </p>
                </div>

                {/* Open roles */}
                <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "26px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "24px" }}>
                    Open Roles
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {ROLES.map((role) => (
                        <div key={role.title} className="role-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "10px" }}>
                                <h3 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
                                    {role.title}
                                </h3>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ background: "#f5f5f5", fontFamily: "var(--font-barlow-condensed)", fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 10px", color: "#555" }}>
                                        {role.type}
                                    </span>
                                    <span style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 10px" }}>
                                        {role.location}
                                    </span>
                                </div>
                            </div>
                            <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.7, marginBottom: "16px" }}>
                                {role.desc}
                            </p>
                            <Link
                                href={`/contact?subject=careers&role=${encodeURIComponent(role.title)}`}
                                style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "1px" }}
                            >
                                Apply Now →
                            </Link>
                        </div>
                    ))}
                </div>

                {/* No role fits */}
                <div style={{ marginTop: "40px", padding: "28px", background: "#f5f5f5", textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                        Don&apos;t See Your Role?
                    </p>
                    <p style={{ fontSize: "13px", color: "#555", marginBottom: "16px" }}>
                        We&apos;re always open to hearing from talented people. Send us your CV and tell us how you&apos;d add value.
                    </p>
                    <Link
                        href="/contact"
                        style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none", display: "inline-block" }}
                    >
                        Send a Message
                    </Link>
                </div>
            </div>
        </div>
    );
}
