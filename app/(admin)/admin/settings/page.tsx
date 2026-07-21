"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin, logoutUser } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

export default function AdminSettings() {
    const router = useRouter();
    const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        setUser(u);
    }, [router]);

    if (!user) return null;

    const handleLogout = () => {
        logoutUser();
        router.push("/admin/login");
    };

    const envRows = [
        { key: "WC_API_URL", desc: "WooCommerce REST API base URL", required: true },
        { key: "WC_CONSUMER_KEY", desc: "WooCommerce consumer key", required: true },
        { key: "WC_CONSUMER_SECRET", desc: "WooCommerce consumer secret", required: true },
        { key: "WP_API_URL", desc: "WordPress REST API base URL", required: true },
        { key: "JWT_API", desc: "JWT Authentication secret", required: true },
        { key: "PAYSTACK_SECRET_KEY", desc: "Paystack secret key (server-side)", required: true },
        { key: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", desc: "Paystack public key (client-side)", required: true },
        { key: "NEXT_PUBLIC_PAYSTACK_CALLBACK_URL", desc: "URL Paystack redirects to after payment", required: true },
        { key: "NEXT_PUBLIC_SITE_URL", desc: "Production site URL", required: false },
        { key: "NEXT_PUBLIC_SITE_NAME", desc: "Site display name", required: false },
    ];

    const usefulLinks = [
        { label: "WordPress Admin", href: "https://missusoutfits.com/wp-admin" },
        { label: "WooCommerce Orders", href: "https://missusoutfits.com/wp-admin/edit.php?post_type=shop_order" },
        { label: "WooCommerce Products", href: "https://missusoutfits.com/wp-admin/edit.php?post_type=product" },
        { label: "Paystack Dashboard", href: "https://dashboard.paystack.com" },
        { label: "WC REST API Keys", href: "https://missusoutfits.com/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys" },
    ];

    return (
        <AdminLayout>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Account */}
                <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                    <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#23282d" }}>Account</h2>
                    </div>
                    <div style={{ padding: "20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "8px 20px", fontSize: "13px", marginBottom: "20px" }}>
                            <span style={{ color: "#50575e", fontWeight: 600 }}>Logged in as</span>
                            <span style={{ color: "#2c3338" }}>{user.displayName || user.username} ({user.email})</span>
                            <span style={{ color: "#50575e", fontWeight: 600 }}>Roles</span>
                            <span style={{ color: "#2c3338" }}>{user.roles.join(", ") || "administrator"}</span>
                            <span style={{ color: "#50575e", fontWeight: 600 }}>User ID</span>
                            <span style={{ color: "#2c3338" }}>#{user.id}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ padding: "6px 14px", background: "#d63638", color: "#fff", border: "1px solid #d63638", borderRadius: "3px", fontSize: "13px", cursor: "pointer" }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Environment Variables */}
                <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                    <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#23282d" }}>Environment Variables</h2>
                    </div>
                    <div style={{ padding: "14px 20px 6px", background: "#f0f6fc", borderBottom: "1px solid #c3d9f5", fontSize: "13px", color: "#004085" }}>
                        ℹ️ These are configured in <code style={{ background: "#dce8f5", padding: "1px 5px", borderRadius: "3px" }}>.env.local</code>. Restart the dev server after changing them.
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f6f7f7" }}>
                                    {["Variable", "Description", "Required"].map((h) => (
                                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#2c3338", borderBottom: "1px solid #c3c4c7", textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {envRows.map((row) => (
                                    <tr key={row.key} style={{ borderBottom: "1px solid #f0f0f1" }}>
                                        <td style={{ padding: "9px 14px", fontFamily: "monospace", fontSize: "12px", color: "#2271b1" }}>{row.key}</td>
                                        <td style={{ padding: "9px 14px", fontSize: "13px", color: "#50575e" }}>{row.desc}</td>
                                        <td style={{ padding: "9px 14px", fontSize: "12px" }}>
                                            <span style={{ background: row.required ? "#d4edda" : "#f0f0f1", color: row.required ? "#155724" : "#50575e", padding: "2px 7px", borderRadius: "3px", fontWeight: 600 }}>
                                                {row.required ? "Required" : "Optional"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Links */}
                <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                    <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#23282d" }}>Quick Links</h2>
                    </div>
                    <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {usefulLinks.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                target="_blank"
                                rel="noreferrer"
                                style={{ padding: "7px 14px", background: "#f6f7f7", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "13px", color: "#2271b1", textDecoration: "none" }}
                            >
                                {l.label} ↗
                            </a>
                        ))}
                        <Link href="/" target="_blank" style={{ padding: "7px 14px", background: "#f6f7f7", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "13px", color: "#2271b1", textDecoration: "none" }}>
                            View Store ↗
                        </Link>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
