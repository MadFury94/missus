"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || !isAdmin(currentUser)) {
            router.push("/admin/login");
            return;
        }
        setUser(currentUser);
        loadStats();
    }, [router]);

    const loadStats = async () => {
        try {
            const response = await fetch("/api/admin/stats");
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || loading) {
        return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
    }

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                {/* Header */}
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>Dashboard</h1>
                </div>

                {/* Content */}
                <div style={{ padding: "20px" }}>
                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                        {[
                            { title: "Products", value: stats.products.toLocaleString(), icon: "📦", color: "#2271b1" },
                            { title: "Orders", value: stats.orders.toLocaleString(), icon: "📋", color: "#00a32a" },
                            { title: "Revenue", value: `₦${stats.revenue.toLocaleString()}`, icon: "💰", color: "#d63638" },
                            { title: "Customers", value: stats.customers.toLocaleString(), icon: "👥", color: "#8c8f94" },
                        ].map((stat, idx) => (
                            <div key={idx} style={{ background: "#f6f7f7", border: "1px solid #c3c4c7", borderRadius: "4px", padding: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "24px" }}>{stat.icon}</span>
                                    <span style={{ fontSize: "13px", color: "#50575e", fontWeight: 600 }}>{stat.title}</span>
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: 600, color: stat.color }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#1d2327", marginBottom: "12px", textTransform: "uppercase" }}>
                            Quick Actions
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                            {[
                                { label: "Add Product", href: "/admin/products/new", icon: "➕" },
                                { label: "View Products", href: "/admin/products", icon: "📦" },
                                { label: "View Orders", href: "/admin/orders", icon: "📋" },
                                { label: "Settings", href: "/admin/settings", icon: "⚙️" },
                            ].map((action, idx) => (
                                <Link
                                    key={idx}
                                    href={action.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 16px",
                                        background: "#2271b1",
                                        color: "#fff",
                                        borderRadius: "3px",
                                        textDecoration: "none",
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        border: "1px solid #2271b1",
                                        transition: "background .15s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#135e96"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "#2271b1"}
                                >
                                    <span>{action.icon}</span>
                                    <span>{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div style={{ background: "#f0f6fc", border: "1px solid #c3c4c7", borderLeft: "4px solid #2271b1", borderRadius: "4px", padding: "16px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1d2327", marginBottom: "8px" }}>
                            Welcome to MISSUS Admin
                        </h3>
                        <p style={{ fontSize: "13px", color: "#50575e", margin: 0, lineHeight: 1.6 }}>
                            Manage your products, orders, and customers from this dashboard. Use the sidebar to navigate between different sections.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
