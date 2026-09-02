"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Stats {
    products: number;
    orders: number;
    revenue: number;
    customers: number;
    configured: boolean;
    error?: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
    const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, revenue: 0, customers: 0, configured: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || !isAdmin(currentUser)) { router.push("/admin/login"); return; }
        setUser(currentUser);

        const loadStats = async () => {
            try {
                const res = await fetch("/api/admin/stats", {
                    headers: currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
                });
                const data = await res.json();
                setStats({
                    products: data.products ?? 0,
                    orders: data.orders ?? 0,
                    revenue: data.revenue ?? 0,
                    customers: data.customers ?? 0,
                    configured: data.configured ?? false,
                    error: data.error,
                });
            } catch {
                setStats((s) => ({ ...s, error: "Could not reach the stats API." }));
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [router]);

    if (!user) return null;

    const statCards = [
        { title: "Products", value: stats.products.toLocaleString(), icon: "📦", color: "#2271b1", href: "/admin/products" },
        { title: "Orders", value: stats.orders.toLocaleString(), icon: "📋", color: "#00a32a", href: "/admin/orders" },
        { title: "Revenue", value: `₦${stats.revenue.toLocaleString("en-NG")}`, icon: "💰", color: "#d63638", href: "/admin/orders" },
        { title: "Customers", value: stats.customers.toLocaleString(), icon: "👥", color: "#8c8f94", href: "/admin/customers" },
    ];

    const quickActions = [
        { label: "Add Product", href: "/admin/products/new", icon: "➕", color: "#2271b1" },
        { label: "All Products", href: "/admin/products", icon: "📦", color: "#0073aa" },
        { label: "Orders", href: "/admin/orders", icon: "📋", color: "#00a32a" },
        { label: "Customers", href: "/admin/customers", icon: "👥", color: "#8c8f94" },
        { label: "Homepage", href: "/admin/homepage", icon: "🏠", color: "#7e5cef" },
        { label: "Settings", href: "/admin/settings", icon: "⚙️", color: "#50575e" },
    ];

    return (
        <AdminLayout>
            <style>{`
                .admin-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .admin-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                @media (max-width: 900px) {
                    .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .admin-actions-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .admin-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                    .admin-actions-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                }
            `}</style>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Welcome */}
                <div>
                    <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#23282d", margin: "0 0 2px" }}>Dashboard</h1>
                    <p style={{ fontSize: "13px", color: "#50575e", margin: 0 }}>
                        Welcome back, {user.displayName || user.username}
                    </p>
                </div>

                {/* API error banner */}
                {stats.error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderLeft: "4px solid #d63638", padding: "12px 16px", borderRadius: "4px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#d63638", marginBottom: "4px" }}>
                            ⚠️ {stats.configured ? "WooCommerce error" : "WooCommerce not connected"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#7f1d1d", margin: "0 0 6px", lineHeight: 1.5 }}>{stats.error}</p>
                        {!stats.configured && (
                            <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0, lineHeight: 1.5 }}>
                                Add <code style={{ background: "#fee2e2", padding: "1px 4px" }}>WC_CONSUMER_KEY</code> and{" "}
                                <code style={{ background: "#fee2e2", padding: "1px 4px" }}>WC_CONSUMER_SECRET</code> to{" "}
                                <code style={{ background: "#fee2e2", padding: "1px 4px" }}>.env.local</code> —{" "}
                                get them from WordPress Admin → WooCommerce → Settings → Advanced → REST API.
                            </p>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="admin-stats-grid">
                    {statCards.map((s) => (
                        <Link key={s.title} href={s.href} style={{ textDecoration: "none" }}>
                            <div style={{
                                background: "#fff", border: "1px solid #c3c4c7", borderRadius: "6px",
                                padding: "14px 16px", cursor: "pointer", transition: "box-shadow .15s",
                                borderTop: `3px solid ${s.color}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "20px" }}>{s.icon}</span>
                                    <span style={{ fontSize: "12px", color: "#50575e", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.title}</span>
                                </div>
                                {loading ? (
                                    <div style={{ height: "28px", background: "#f0f0f1", borderRadius: "4px", animation: "adminPulse 1.4s ease infinite" }} />
                                ) : (
                                    <div style={{ fontSize: "26px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick actions */}
                <div style={{ background: "#fff", border: "1px solid #c3c4c7", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8e8e8" }}>
                        <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#23282d", margin: 0, textTransform: "uppercase", letterSpacing: ".04em" }}>Quick Actions</h2>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                        <div className="admin-actions-grid">
                            {quickActions.map((a) => (
                                <Link
                                    key={a.href}
                                    href={a.href}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        padding: "11px 14px",
                                        background: "#f6f7f7", border: "1px solid #e2e4e7",
                                        borderRadius: "5px", textDecoration: "none",
                                        fontSize: "13px", fontWeight: 600, color: "#23282d",
                                        transition: "background .12s, border-color .12s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#e8f0fe"; e.currentTarget.style.borderColor = a.color; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f6f7f7"; e.currentTarget.style.borderColor = "#e2e4e7"; }}
                                >
                                    <span style={{ fontSize: "18px" }}>{a.icon}</span>
                                    <span>{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* WooCommerce connection status */}
                <div style={{ background: "#fff", border: "1px solid #c3c4c7", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8e8e8" }}>
                        <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#23282d", margin: 0, textTransform: "uppercase", letterSpacing: ".04em" }}>System Status</h2>
                    </div>
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                            { label: "WooCommerce API", ok: stats.configured && !stats.error },
                            { label: "Admin Auth", ok: true },
                            { label: "Dev Mode", ok: process.env.NODE_ENV === "development", neutral: true },
                        ].map((row) => (
                            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                                <span style={{ color: "#50575e" }}>{row.label}</span>
                                <span style={{
                                    padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 700,
                                    background: row.neutral ? "#f0f0f1" : row.ok ? "#d1fae5" : "#fee2e2",
                                    color: row.neutral ? "#50575e" : row.ok ? "#065f46" : "#991b1b",
                                }}>
                                    {row.neutral ? "Active" : row.ok ? "Connected" : "Not connected"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes adminPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </AdminLayout>
    );
}
