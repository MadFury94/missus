"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import AdminLayout, { ABtn, APanel, ATable, ATr, ATd, StatusDot } from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Stats { products: number; orders: number; revenue: number; customers: number; configured: boolean; error?: string; }

const T = {
    sans: "var(--font-admin-sans,'Public Sans',sans-serif)",
    serif: "var(--font-admin-serif,'Fraunces',serif)",
};

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
    const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, revenue: 0, customers: 0, configured: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        setUser(u);
        fetch("/api/admin/stats", { headers: u.token ? { Authorization: `Bearer ${u.token}` } : {} })
            .then(r => r.json())
            .then(d => setStats({ products: d.products ?? 0, orders: d.orders ?? 0, revenue: d.revenue ?? 0, customers: d.customers ?? 0, configured: d.configured ?? false, error: d.error }))
            .catch(() => setStats(s => ({ ...s, error: "Could not reach stats API." })))
            .finally(() => setLoading(false));
    }, [router]);

    if (!user) return null;

    const statItems = [
        { label: "Products", value: stats.products.toLocaleString(), href: "/admin/products", accent: false },
        { label: "Orders", value: stats.orders.toLocaleString(), href: "/admin/orders", accent: false },
        { label: "Revenue", value: `₦${stats.revenue.toLocaleString("en-NG")}`, href: "/admin/orders", accent: true },
        { label: "Customers", value: stats.customers.toLocaleString(), href: "/admin/customers", accent: false },
    ];

    const actions = [
        { label: "Add Product", href: "/admin/products/new", icon: "+" },
        { label: "All Products", href: "/admin/products", icon: "≡" },
        { label: "Orders", href: "/admin/orders", icon: "📋" },
        { label: "Customers", href: "/admin/customers", icon: "👥" },
        { label: "Homepage", href: "/admin/homepage", icon: "🏠" },
        { label: "Settings", href: "/admin/settings", icon: "⚙" },
    ];

    return (
        <AdminLayout>
            <style>{`
                @keyframes apulse { 0%,100%{opacity:1} 50%{opacity:.35} }
                .a-stats { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid var(--sand-deep); border-bottom:none; margin-bottom:28px; }
                .a-stat  { padding:20px 24px 18px; border-right:1px solid var(--sand); border-bottom:1px solid var(--sand-deep); }
                .a-stat:last-child { border-right:none; }
                .a-qa-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--sand); }
                .a-qa-cell { background:var(--paper-raised); padding:14px 18px; display:flex; align-items:center; gap:10px; text-decoration:none; transition:background .12s; }
                .a-qa-cell:hover { background:#FBF3ED; }
                @media(max-width:900px){ .a-stats{grid-template-columns:repeat(2,1fr);} .a-qa-grid{grid-template-columns:repeat(2,1fr);} }
                @media(max-width:480px){ .a-stats{grid-template-columns:1fr 1fr;} }
            `}</style>

            {/* Page title */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>Dashboard</h1>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: "var(--stone)", margin: 0 }}>Welcome back, {user.displayName || user.username}</p>
            </div>

            {/* Error */}
            {stats.error && (
                <div style={{ background: "rgba(166,67,47,.06)", border: "1px solid rgba(166,67,47,.2)", borderLeft: "3px solid var(--rust)", padding: "10px 14px", marginBottom: 20, borderRadius: "var(--admin-radius)" }}>
                    <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: "var(--rust)", marginBottom: 2 }}>WooCommerce {stats.configured ? "error" : "not connected"}</p>
                    <p style={{ fontFamily: T.sans, fontSize: 12, color: "var(--stone)", margin: 0, lineHeight: 1.5 }}>{stats.error}</p>
                </div>
            )}

            {/* Stat strip */}
            <div className="a-stats">
                {statItems.map(s => (
                    <Link key={s.label} href={s.href} style={{ textDecoration: "none" }} className="a-stat">
                        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: "var(--stone)", marginBottom: 8, letterSpacing: ".03em" }}>{s.label}</div>
                        {loading
                            ? <div style={{ height: 30, width: "55%", background: "var(--sand)", borderRadius: 2, animation: "apulse 1.4s ease infinite" }} />
                            : <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 600, color: s.accent ? "var(--wine)" : "var(--ink)", lineHeight: 1 }}>{s.value}</div>
                        }
                    </Link>
                ))}
            </div>

            {/* Quick actions */}
            <APanel style={{ marginBottom: 24 }}>
                <div style={{ padding: "12px 20px 10px", borderBottom: "1px solid var(--sand)" }}>
                    <span style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Quick Actions</span>
                </div>
                <div className="a-qa-grid">
                    {actions.map(a => (
                        <Link key={a.href} href={a.href} className="a-qa-cell">
                            <span style={{ fontSize: 16, color: "var(--wine)", width: 20, textAlign: "center", flexShrink: 0 }}>{a.icon}</span>
                            <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{a.label}</span>
                        </Link>
                    ))}
                </div>
            </APanel>

            {/* System status */}
            <APanel>
                <div style={{ padding: "12px 20px 10px", borderBottom: "1px solid var(--sand)" }}>
                    <span style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>System Status</span>
                </div>
                <div style={{ padding: "4px 0" }}>
                    {[
                        { label: "WooCommerce API", status: stats.configured && !stats.error ? "active" : "disabled" },
                        { label: "Admin Auth", status: "active" },
                    ].map(row => (
                        <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid var(--sand)" }}>
                            <span style={{ fontFamily: T.sans, fontSize: 13, color: "var(--ink)" }}>{row.label}</span>
                            <StatusDot status={row.status} />
                        </div>
                    ))}
                </div>
            </APanel>
        </AdminLayout>
    );
}
