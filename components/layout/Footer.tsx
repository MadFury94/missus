"use client";
import Link from "next/link";
import { useState } from "react";
import { SITE_NAME, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/config";

const SOCIALS = [
    {
        key: "instagram",
        href: SOCIAL_LINKS.instagram,
        label: "Instagram",
        icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="rgba(255,255,255,.7)" fill="none" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
    },
    {
        key: "tiktok",
        href: SOCIAL_LINKS.tiktok,
        label: "TikTok",
        icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,.7)"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg>,
    },
    {
        key: "snapchat",
        href: SOCIAL_LINKS.snapchat,
        label: "Snapchat",
        icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,.7)"><path d="M12.166 2C9.315 2 7.2 3.967 7.2 7.2v1.2c-.4.1-.8.3-1.2.6-.2.2-.3.4-.2.6.1.3.4.5.7.5h.1c-.1.3-.2.7-.4 1-.5 1-1.4 1.7-2.2 2-.2.1-.3.3-.2.5.1.3.5.5.9.6.1 0 .2.1.2.2 0 .2-.1.4-.3.5-.4.2-.9.3-1.4.3-.3 0-.5.2-.5.5 0 .2.1.4.3.5 1.2.5 2 1.3 2.4 2.4.1.2.3.4.5.4.2 0 .5-.1.8-.2.5-.2 1.1-.3 1.7-.3.5 0 1 .1 1.4.3.6.3 1.1.5 1.7.5.6 0 1.1-.2 1.7-.5.4-.2.9-.3 1.4-.3.6 0 1.2.1 1.7.3.3.1.6.2.8.2.2 0 .4-.1.5-.4.4-1.1 1.2-1.9 2.4-2.4.2-.1.3-.3.3-.5 0-.3-.2-.5-.5-.5-.5 0-1-.1-1.4-.3-.2-.1-.3-.3-.3-.5 0-.1.1-.2.2-.2.4-.1.8-.3.9-.6.1-.2 0-.4-.2-.5-.8-.3-1.7-1-2.2-2-.2-.3-.3-.7-.4-1h.1c.3 0 .6-.2.7-.5.1-.2 0-.4-.2-.6-.4-.3-.8-.5-1.2-.6V7.2C17.2 3.967 15.017 2 12.166 2z" /></svg>,
    },
    {
        key: "facebook",
        href: SOCIAL_LINKS.facebook,
        label: "Facebook",
        icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="rgba(255,255,255,.7)" fill="none" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
    },
    {
        key: "youtube",
        href: SOCIAL_LINKS.youtube,
        label: "YouTube",
        icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="rgba(255,255,255,.7)" fill="none" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>,
    },
    {
        key: "whatsapp",
        href: SOCIAL_LINKS.whatsapp,
        label: "WhatsApp",
        icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,.7)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>,
    },
];

function AccordionSection({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            {/* Desktop heading */}
            <h4 className="footer-col-heading" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: "14px", color: "#fff" }}>
                {heading}
            </h4>
            {/* Mobile accordion toggle */}
            <button
                className="footer-col-toggle"
                onClick={() => setOpen((o) => !o)}
                style={{ display: "none", width: "100%", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,.1)", padding: "14px 0", cursor: "pointer", textAlign: "left", alignItems: "center", justifyContent: "space-between" }}
            >
                <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff" }}>{heading}</span>
                <span style={{ color: "rgba(255,255,255,.5)", fontSize: "18px", transform: open ? "rotate(45deg)" : "none", transition: "transform .2s", display: "inline-block" }}>+</span>
            </button>
            <div className={`footer-col-links${open ? " open" : ""}`}>
                {links.map((link) => (
                    <Link key={link.href} href={link.href} style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,.45)", marginBottom: "8px", fontWeight: 300 }}>
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function Footer() {
    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .footer-col-heading { display: none !important; }
                    .footer-col-toggle { display: flex !important; }
                    .footer-col-links { display: none; overflow: hidden; }
                    .footer-col-links.open { display: block; padding: 8px 0 16px; }
                    .footer-brand { grid-column: span 1 !important; }
                }
            `}</style>

            <footer style={{ background: "#1a1a1a", color: "#fff", padding: "40px 20px 20px" }}>
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "28px", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff", marginBottom: "12px" }}>
                            {SITE_NAME}<span style={{ color: "#e8002d" }}>.</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,.45)", lineHeight: 1.7, fontWeight: 300, marginBottom: "16px" }}>
                            Trendy, affordable women&apos;s fashion built for the modern Nigerian woman. Delivering style from Lagos to Abuja and beyond.
                        </p>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {SOCIALS.map((s) => (
                                <a
                                    key={s.key}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    style={{ width: "34px", height: "34px", border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none" }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns — accordion on mobile */}
                    {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                        <AccordionSection key={heading} heading={heading} links={links} />
                    ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: "20px", marginTop: "8px" }}>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>© {new Date().getFullYear()} Missus Outfits. All rights reserved.</p>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {["VISA", "MASTERCARD", "PAYSTACK", "FLUTTERWAVE", "OPAY"].map((p) => (
                            <span key={p} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "3px", padding: "3px 8px", fontFamily: "var(--font-barlow-condensed)", fontSize: "9px", fontWeight: 700, letterSpacing: ".08em", color: "rgba(255,255,255,.4)" }}>{p}</span>
                        ))}
                    </div>
                </div>
            </footer>
        </>
    );
}
