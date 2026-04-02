import Link from "next/link";
import { SITE_NAME, FOOTER_LINKS } from "@/lib/config";

export default function Footer() {
    return (
        <footer style={{ background: "#1a1a1a", color: "#fff", padding: "40px 20px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "32px", marginBottom: "36px", paddingBottom: "36px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
                {/* Brand */}
                <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff", marginBottom: "12px" }}>
                        {SITE_NAME}<span style={{ color: "#e8002d" }}>.</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,.45)", lineHeight: 1.7, fontWeight: 300, marginBottom: "16px" }}>
                        Trendy, affordable women&apos;s fashion built for the modern Nigerian woman. Delivering style from Lagos to Abuja and beyond.
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {[
                            <svg key="ig" viewBox="0 0 24 24" width="16" height="16" stroke="rgba(255,255,255,.6)" fill="none" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
                            <svg key="fb" viewBox="0 0 24 24" width="16" height="16" stroke="rgba(255,255,255,.6)" fill="none" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
                            <svg key="yt" viewBox="0 0 24 24" width="16" height="16" stroke="rgba(255,255,255,.6)" fill="none" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>,
                            <svg key="li" viewBox="0 0 24 24" width="16" height="16" stroke="rgba(255,255,255,.6)" fill="none" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
                        ].map((icon, i) => (
                            <div key={i} style={{ width: "34px", height: "34px", border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                {icon}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Link columns */}
                {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                    <div key={heading}>
                        <h4 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: "14px", color: "#fff" }}>{heading}</h4>
                        {links.map((link) => (
                            <Link key={link.href} href={link.href} style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,.45)", marginBottom: "8px", fontWeight: 300 }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>© {new Date().getFullYear()} Missus Outfits. All rights reserved.</p>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {["VISA", "MASTERCARD", "PAYSTACK", "FLUTTERWAVE", "OPAY"].map((p) => (
                        <span key={p} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "3px", padding: "3px 8px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: ".08em", color: "rgba(255,255,255,.4)" }}>{p}</span>
                    ))}
                </div>
            </div>
        </footer>
    );
}
