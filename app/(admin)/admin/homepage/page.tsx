"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import AdminLayout, { ABtn, APanel } from "@/components/admin/AdminLayout";
import { HOMEPAGE_DEFAULTS, type HomepageContent } from "@/lib/homepage-content";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };

/* ─── small reusable field components ─── */
function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
    const base: React.CSSProperties = {
        width: "100%", border: "1px solid var(--sand-deep)", borderRadius: "var(--admin-radius)",
        padding: "7px 10px", fontSize: "13px", fontFamily: T.sans, boxSizing: "border-box",
        outline: "none", background: "var(--paper-raised)", color: "var(--ink)", transition: "border-color .15s",
    };
    return (
        <label style={{ display: "block", marginBottom: "12px" }}>
            <span style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--stone)", marginBottom: "4px", letterSpacing: ".03em", fontFamily: T.sans }}>{label}</span>
            {multiline
                ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={base} onFocus={e => (e.target.style.borderColor = "var(--wine)")} onBlur={e => (e.target.style.borderColor = "var(--sand-deep)")} />
                : <input value={value} onChange={(e) => onChange(e.target.value)} style={base} onFocus={e => (e.target.style.borderColor = "var(--wine)")} onBlur={e => (e.target.style.borderColor = "var(--sand-deep)")} />
            }
        </label>
    );
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ background: "var(--paper-raised)", border: "1px solid var(--sand)", borderRadius: "var(--admin-radius)", marginBottom: "20px" }}>
            <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--sand)" }}>
                <h2 style={{ margin: 0, fontFamily: T.serif, fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>{title}</h2>
            </div>
            <div style={{ padding: "20px" }}>{children}</div>
        </div>
    );
}

export default function HomepageContentPage() {
    const router = useRouter();
    const [content, setContent] = useState<HomepageContent>(HOMEPAGE_DEFAULTS);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        fetch("/api/admin/homepage")
            .then((r) => r.json())
            .then((data) => {
                if (data && Object.keys(data).length > 0) {
                    setContent({ ...HOMEPAGE_DEFAULTS, ...data });
                }
            })
            .finally(() => setLoading(false));
    }, [router]);

    const update = useCallback(<K extends keyof HomepageContent>(section: K, value: HomepageContent[K]) => {
        setContent((prev) => ({ ...prev, [section]: value }));
        setSaved(false);
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const currentUser = getCurrentUser();
            await fetch("/api/admin/homepage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
                },
                body: JSON.stringify(content),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AdminLayout><div style={{ padding: "40px", textAlign: "center", color: "var(--stone)" }}>Loading…</div></AdminLayout>;

    const SaveBtn = ({ bottom }: { bottom?: boolean }) => (
        <ABtn type="button" variant="primary" onClick={save} disabled={saving} style={{ fontSize: bottom ? 13 : 12, padding: bottom ? "9px 24px" : "7px 16px" }}>
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
        </ABtn>
    );

    return (
        <AdminLayout>
            <div style={{ maxWidth: "900px" }}>
                {/* Page header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <div>
                        <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>Homepage</h1>
                        <p style={{ fontFamily: T.sans, fontSize: 13, color: "var(--stone)", margin: 0 }}>Edit homepage content — changes go live within 60 seconds</p>
                    </div>
                    <SaveBtn />
                </div>

                <div style={{ background: "rgba(184,137,46,.06)", border: "1px solid rgba(184,137,46,.25)", borderLeft: "3px solid var(--amber)", padding: "8px 14px", marginBottom: 20, borderRadius: "var(--admin-radius)", fontFamily: T.sans, fontSize: 12, color: "var(--ink)" }}>
                    Changes are live immediately. The homepage refreshes every 60 seconds in production.
                </div>

                {/* ── Announcement Bar ── */}
                <SectionBox title="Announcement Bar (Black Banner at Top)">
                    <Field
                        label="Announcement text"
                        value={content.announcement}
                        onChange={(v) => update("announcement", v)}
                    />
                    <p style={{ fontSize: "12px", color: "var(--stone)", margin: "-4px 0 0" }}>
                        Use <code style={{ background: "#f0f0f1", padding: "1px 4px" }}>|</code> to separate items. E.g. <em>FREE SHIPPING ON ORDERS ₦150,000+ | NEW ARRIVALS EVERY WEEK</em>
                    </p>
                </SectionBox>

                {/* ── Marquee Strip ── */}
                <SectionBox title="Scrolling Marquee Strip (Black Band Below Hero)">
                    {content.marquee.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "var(--stone)", width: "20px", flexShrink: 0 }}>{i + 1}.</span>
                            <input
                                value={item}
                                onChange={(e) => {
                                    const next = [...content.marquee];
                                    next[i] = e.target.value;
                                    update("marquee", next);
                                }}
                                style={{ flex: 1, border: "1px solid var(--sand-deep)", borderRadius: "3px", padding: "7px 10px", fontSize: "13px" }}
                            />
                            <button
                                onClick={() => update("marquee", content.marquee.filter((_, j) => j !== i))}
                                style={{ padding: "6px 10px", background: "#fff", border: "1px solid var(--rust)", borderRadius: "3px", fontSize: "12px", cursor: "pointer", color: "var(--rust)" }}
                            >✕</button>
                        </div>
                    ))}
                    <button
                        onClick={() => update("marquee", [...content.marquee, "New Item"])}
                        style={{ marginTop: "4px", padding: "6px 14px", background: "var(--paper)", border: "1px solid var(--sand-deep)", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
                    >
                        + Add Item
                    </button>
                </SectionBox>

                {/* ── Hero Slides ── */}
                <SectionBox title="Hero Slideshow">
                    {content.hero.map((slide, i) => (
                        <div key={i} style={{ border: "1px solid var(--sand)", borderRadius: "4px", padding: "16px", marginBottom: "16px", background: "var(--paper)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>Slide {i + 1}</span>
                                {content.hero.length > 1 && (
                                    <button
                                        onClick={() => update("hero", content.hero.filter((_, j) => j !== i))}
                                        style={{ padding: "4px 10px", background: "#fff", border: "1px solid var(--rust)", borderRadius: "3px", fontSize: "11px", color: "var(--rust)", cursor: "pointer" }}
                                    >Remove</button>
                                )}
                            </div>

                            {/* Image preview */}
                            {slide.src && (
                                <div style={{ marginBottom: "12px" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={slide.src} alt="" style={{ height: "80px", width: "auto", objectFit: "cover", borderRadius: "3px", border: "1px solid var(--sand)" }} onError={(e) => (e.currentTarget.style.display = "none")} />
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                                <Field label="Image URL or /path" value={slide.src} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], src: v }; update("hero", h); }} />
                                <Field label="Label (small text above heading)" value={slide.label ?? ""} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], label: v }; update("hero", h); }} />
                            </div>
                            <Field label="Heading (use \\n for line break, e.g. Fresh\\nFits.)" value={slide.heading} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], heading: v }; update("hero", h); }} />
                            <Field label="Sub-text" value={slide.sub} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], sub: v }; update("hero", h); }} multiline />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                                <Field label="Button 1 label" value={slide.cta.label} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], cta: { ...h[i].cta, label: v } }; update("hero", h); }} />
                                <Field label="Button 1 link" value={slide.cta.href} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], cta: { ...h[i].cta, href: v } }; update("hero", h); }} />
                                <Field label="Button 2 label" value={slide.cta2?.label ?? ""} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], cta2: { label: v, href: h[i].cta2?.href ?? "/shop" } }; update("hero", h); }} />
                                <Field label="Button 2 link" value={slide.cta2?.href ?? ""} onChange={(v) => { const h = [...content.hero]; h[i] = { ...h[i], cta2: { label: h[i].cta2?.label ?? "", href: v } }; update("hero", h); }} />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => update("hero", [...content.hero, { src: "", label: "", heading: "New\nSlide.", sub: "", cta: { label: "Shop Now", href: "/shop" }, cta2: { label: "View All", href: "/shop" } }])}
                        style={{ padding: "7px 16px", background: "var(--paper)", border: "1px solid var(--sand-deep)", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
                    >
                        + Add Slide
                    </button>
                </SectionBox>

                {/* ── Style Radar Cards ── */}
                <SectionBox title="The Style Radar Cards">
                    {content.styleRadar.map((card, i) => (
                        <div key={i} style={{ border: "1px solid var(--sand)", borderRadius: "4px", padding: "12px", marginBottom: "10px", background: "var(--paper)" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                {card.img && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={card.img} alt="" style={{ width: "48px", height: "64px", objectFit: "cover", borderRadius: "3px", flexShrink: 0 }} onError={(e) => (e.currentTarget.style.display = "none")} />
                                )}
                                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0 12px", alignItems: "end" }}>
                                    <Field label="Card title" value={card.title} onChange={(v) => { const c = [...content.styleRadar]; c[i] = { ...c[i], title: v }; update("styleRadar", c); }} />
                                    <Field label="Image URL" value={card.img} onChange={(v) => { const c = [...content.styleRadar]; c[i] = { ...c[i], img: v }; update("styleRadar", c); }} />
                                    <Field label="Link href" value={card.href} onChange={(v) => { const c = [...content.styleRadar]; c[i] = { ...c[i], href: v }; update("styleRadar", c); }} />
                                    <button
                                        onClick={() => update("styleRadar", content.styleRadar.filter((_, j) => j !== i))}
                                        style={{ padding: "7px 10px", background: "#fff", border: "1px solid var(--rust)", borderRadius: "3px", fontSize: "11px", color: "var(--rust)", cursor: "pointer", marginBottom: "12px", whiteSpace: "nowrap" }}
                                    >✕ Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => update("styleRadar", [...content.styleRadar, { title: "New Category", href: "/shop", img: "" }])}
                        style={{ padding: "7px 16px", background: "var(--paper)", border: "1px solid var(--sand-deep)", borderRadius: "3px", fontSize: "12px", cursor: "pointer" }}
                    >
                        + Add Card
                    </button>
                </SectionBox>

                {/* ── Newsletter Bar ── */}
                <SectionBox title="Newsletter Bar (Join Missus Girls Club)">
                    <Field label="Heading" value={content.newsletter.heading} onChange={(v) => update("newsletter", { ...content.newsletter, heading: v })} />
                    <Field label="Sub-text" value={content.newsletter.sub} onChange={(v) => update("newsletter", { ...content.newsletter, sub: v })} multiline />
                </SectionBox>

                {/* Save (bottom) */}
                <div style={{ display: "flex", justifyContent: "flex-start", paddingBottom: "40px" }}>
                    <SaveBtn bottom />
                </div>
            </div>
        </AdminLayout>
    );
}
