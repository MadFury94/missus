"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";

interface AdminLayoutProps { children: React.ReactNode; }

const T = {
    sans: "var(--font-admin-sans, 'Public Sans', sans-serif)",
    serif: "var(--font-admin-serif, 'Fraunces', serif)",
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const logout = () => { logoutUser(); router.push("/admin/login"); };

    const nav = [
        { icon: <DashIco />, label: "Dashboard", href: "/admin" },
        { icon: <HomeIco />, label: "Homepage", href: "/admin/homepage" },
        { icon: <OrderIco />, label: "Orders", href: "/admin/orders" },
        { icon: <PeopleIco />, label: "Customers", href: "/admin/customers" },
        { icon: <TagIco />, label: "Categories", href: "/admin/categories" },
        { icon: <GiftIco />, label: "Gift Cards", href: "/admin/gift-cards" },
        { icon: <GearIco />, label: "Settings", href: "/admin/settings" },
    ];
    const prodNav = [
        { label: "New Product", href: "/admin/products/new" },
        { label: "All Products", href: "/admin/products" },
    ];

    const active = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

    const Sidebar = () => (
        <div style={{ width: 232, background: "var(--sidebar)", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
            {/* Wordmark */}
            <div style={{ padding: "28px 20px 22px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                <Link href="/admin" onClick={() => setOpen(false)} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: "var(--sidebar-text)", letterSpacing: ".04em" }}>MISSUS</div>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: "var(--sidebar-text-dim)", marginTop: 2, letterSpacing: ".06em" }}>Admin</div>
                </Link>
                <button className="a-sb-close" onClick={() => setOpen(false)} style={{ display: "none", position: "absolute", top: 20, right: 16, background: "none", border: "none", color: "var(--sidebar-text-dim)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, paddingTop: 8 }}>
                {nav.map(item => {
                    const on = active(item.href);
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 20px",
                            fontFamily: T.sans, fontSize: 13, fontWeight: on ? 600 : 400,
                            color: on ? "var(--sidebar-text)" : "var(--sidebar-text-dim)",
                            textDecoration: "none",
                            background: on ? "rgba(122,31,43,0.18)" : "transparent",
                            borderLeft: on ? "2px solid var(--wine)" : "2px solid transparent",
                            transition: "background .12s, color .12s",
                        }}>
                            <span style={{ color: on ? "var(--wine)" : "var(--sidebar-text-dim)", flexShrink: 0 }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}

                {/* Products group */}
                <div style={{ padding: "16px 20px 4px", fontFamily: T.sans, fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--sidebar-text-dim)", textTransform: "uppercase" }}>
                    Products
                </div>
                {prodNav.map(item => {
                    const on = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                            display: "block", padding: "7px 20px 7px 36px",
                            fontFamily: T.sans, fontSize: 12, fontWeight: on ? 600 : 400,
                            color: on ? "var(--sidebar-text)" : "var(--sidebar-text-dim)",
                            textDecoration: "none",
                            background: on ? "rgba(122,31,43,0.18)" : "transparent",
                            borderLeft: on ? "2px solid var(--wine)" : "2px solid transparent",
                            transition: "background .12s",
                        }}>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <Link href="/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.sans, fontSize: 12, color: "var(--sidebar-text-dim)", textDecoration: "none", marginBottom: 10, transition: "color .12s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--sidebar-text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--sidebar-text-dim)")}>
                    <ExtIco /> View Store
                </Link>
                <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.sans, fontSize: 12, color: "var(--sidebar-text-dim)", padding: 0, transition: "color .12s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--rust)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--sidebar-text-dim)")}>
                    Sign out
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                .a-root { display:flex; min-height:100vh; background:var(--paper); }
                .a-sb   { width:232px; position:fixed; top:0; left:0; bottom:0; z-index:100; }
                .a-main { margin-left:232px; flex:1; display:flex; flex-direction:column; min-width:0; }
                .a-top  { background:var(--paper-raised); border-bottom:1px solid var(--sand); padding:0 44px; height:48px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:50; }
                .a-ham  { display:none !important; }
                .a-mob-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:200; }
                .a-mob-drawer  { display:none; position:fixed; top:0; left:0; bottom:0; width:232px; z-index:201; }
                .a-content { flex:1; padding:36px 44px; max-width:1180px; }
                @media (max-width:768px) {
                    .a-sb   { display:none !important; }
                    .a-main { margin-left:0 !important; }
                    .a-ham  { display:flex !important; }
                    .a-sb-close { display:block !important; position:absolute; top:20px; right:16px; }
                    .a-mob-overlay { display:block; }
                    .a-mob-drawer  { display:block; }
                    .a-content { padding:24px 20px; }
                    .a-top { padding:0 20px; }
                }
            `}</style>

            <div className="a-root">
                <div className="a-sb"><Sidebar /></div>

                {open && (
                    <>
                        <div className="a-mob-overlay" onClick={() => setOpen(false)} />
                        <div className="a-mob-drawer"><Sidebar /></div>
                    </>
                )}

                <div className="a-main">
                    <div className="a-top">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button className="a-ham" onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "none", alignItems: "center" }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                            </button>
                            <span style={{ fontFamily: T.sans, fontSize: 12, color: "var(--stone)" }}>Missus Admin</span>
                        </div>
                        <Link href="/" target="_blank" style={{ fontFamily: T.sans, fontSize: 12, color: "var(--stone)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color .12s" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--stone)")}>
                            <ExtIco /> View Store
                        </Link>
                    </div>

                    <div className="a-content">{children}</div>
                </div>
            </div>
        </>
    );
}

/* ── Shared helpers ── */
export function ABtn({ children, onClick, variant = "primary", disabled, type = "button", style }: {
    children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger";
    disabled?: boolean; type?: "button" | "submit"; style?: React.CSSProperties;
}) {
    const base: React.CSSProperties = {
        fontFamily: "var(--font-admin-sans, 'Public Sans', sans-serif)",
        fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        border: "none", borderRadius: "var(--admin-radius, 3px)", padding: "7px 16px",
        display: "inline-flex", alignItems: "center", gap: 6, transition: "background .12s",
        opacity: disabled ? .55 : 1, ...style,
    };
    if (variant === "primary") return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, background: "var(--wine)", color: "#F9F1EC" }} onMouseEnter={e => !disabled && (e.currentTarget.style.background = "var(--wine-deep)")} onMouseLeave={e => (e.currentTarget.style.background = "var(--wine)")}>{children}</button>;
    if (variant === "secondary") return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: "var(--ink)", border: "1px solid var(--sand-deep)" }} onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor = "var(--stone)")} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--sand-deep)")}>{children}</button>;
    return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: "var(--rust)", border: "1px solid var(--sand-deep)" }} onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor = "var(--rust)")} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--sand-deep)")}>{children}</button>;
}

export function AInput({ label, value, onChange, type = "text", placeholder, required, min, step, style }: {
    label?: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; required?: boolean; min?: string; step?: string; style?: React.CSSProperties;
}) {
    const f = "var(--font-admin-sans,'Public Sans',sans-serif)";
    return (
        <div style={{ marginBottom: 14, ...style }}>
            {label && <div style={{ fontFamily: f, fontSize: 11, fontWeight: 600, color: "var(--stone)", marginBottom: 5, letterSpacing: ".03em" }}>{label}</div>}
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} min={min} step={step}
                style={{ width: "100%", fontFamily: f, fontSize: 13, color: "var(--ink)", background: "var(--paper-raised)", border: "1px solid var(--sand-deep)", borderRadius: "var(--admin-radius)", padding: "7px 10px", outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                onFocus={e => (e.target.style.borderColor = "var(--wine)")}
                onBlur={e => (e.target.style.borderColor = "var(--sand-deep)")}
            />
        </div>
    );
}

export function APanel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ background: "var(--paper-raised)", border: "1px solid var(--sand)", borderRadius: "var(--admin-radius)", ...style }}>{children}</div>;
}

export function APanelHeader({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--sand)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-admin-serif,'Fraunces',serif)", fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>{children}</div>
            {actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
        </div>
    );
}

export function ATable({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: string }) {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-admin-sans,'Public Sans',sans-serif)" }}>
                <thead>
                    <tr>
                        {headers.map(h => (
                            <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--stone)", borderBottom: "1px solid var(--sand-deep)", whiteSpace: "nowrap", letterSpacing: ".02em" }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
            {!children && empty && <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--stone)", fontFamily: "var(--font-admin-sans)", fontSize: 13 }}>{empty}</div>}
        </div>
    );
}

export function ATr({ children, selected }: { children: React.ReactNode; selected?: boolean }) {
    return (
        <tr style={{ borderBottom: "1px solid var(--sand)", background: selected ? "rgba(122,31,43,.04)" : "transparent" }}
            onMouseEnter={e => !selected && (e.currentTarget.style.background = "#FBF7F1")}
            onMouseLeave={e => !selected && (e.currentTarget.style.background = "transparent")}>
            {children}
        </tr>
    );
}

export function ATd({ children, primary, muted, mono, style }: { children: React.ReactNode; primary?: boolean; muted?: boolean; mono?: boolean; style?: React.CSSProperties }) {
    return (
        <td style={{
            padding: "10px 14px", fontSize: 13,
            fontWeight: primary ? 600 : 400,
            color: muted ? "var(--stone)" : "var(--ink)",
            fontFamily: mono ? "monospace" : "var(--font-admin-sans,'Public Sans',sans-serif)",
            ...style,
        }}>{children}</td>
    );
}

export function StatusDot({ status }: { status: string }) {
    const map: Record<string, { dot: string; label: string }> = {
        active: { dot: "var(--moss)", label: "Active" },
        completed: { dot: "var(--moss)", label: "Completed" },
        instock: { dot: "var(--moss)", label: "In stock" },
        processing: { dot: "var(--amber)", label: "Processing" },
        "on-hold": { dot: "var(--amber)", label: "On hold" },
        pending: { dot: "var(--amber)", label: "Pending" },
        used: { dot: "var(--stone)", label: "Used" },
        refunded: { dot: "var(--stone)", label: "Refunded" },
        cancelled: { dot: "var(--rust)", label: "Cancelled" },
        failed: { dot: "var(--rust)", label: "Failed" },
        disabled: { dot: "var(--rust)", label: "Disabled" },
        expired: { dot: "var(--rust)", label: "Expired" },
        outofstock: { dot: "var(--rust)", label: "Out of stock" },
    };
    const s = map[status] ?? { dot: "var(--stone)", label: status };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-admin-sans,'Public Sans',sans-serif)", fontSize: 12, color: "var(--ink)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0, display: "inline-block" }} />
            {s.label}
        </span>
    );
}

/* ── Icons ── */
function DashIco() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>; }
function HomeIco() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>; }
function OrderIco() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>; }
function PeopleIco() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function TagIco() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>; }
function GiftIco() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>; }
function GearIco() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>; }
function ExtIco() { return <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>; }
