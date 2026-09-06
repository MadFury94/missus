"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin, logoutUser } from "@/lib/auth";
import AdminLayout, { ABtn, APanel, APanelHeader, ATable, ATr, ATd } from "@/components/admin/AdminLayout";
import Link from "next/link";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };

export default function AdminSettings() {
    const router = useRouter();
    const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        setUser(u);
    }, [router]);

    if (!user) return null;

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

    const links = [
        { label: "WordPress Admin", href: "https://missusoutfits.com/wp-admin" },
        { label: "WooCommerce Orders", href: "https://missusoutfits.com/wp-admin/edit.php?post_type=shop_order" },
        { label: "WooCommerce Products", href: "https://missusoutfits.com/wp-admin/edit.php?post_type=product" },
        { label: "Paystack Dashboard", href: "https://dashboard.paystack.com" },
        { label: "WC REST API Keys", href: "https://missusoutfits.com/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys" },
    ];

    return (
        <AdminLayout>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: 0 }}>Settings</h1>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Account */}
                <APanel>
                    <APanelHeader actions={<ABtn variant="danger" onClick={() => { logoutUser(); router.push("/admin/login"); }}>Sign Out</ABtn>}>Account</APanelHeader>
                    <div style={{ padding: 20 }}>
                        {[
                            { label: "Signed in as", value: `${user.displayName || user.username} (${user.email})` },
                            { label: "Roles", value: user.roles.join(", ") || "administrator" },
                            { label: "User ID", value: `#${user.id}` },
                        ].map(row => (
                            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0 16px", padding: "8px 0", borderBottom: "1px solid var(--sand)", fontFamily: T.sans, fontSize: 13 }}>
                                <span style={{ color: "var(--stone)", fontWeight: 600 }}>{row.label}</span>
                                <span style={{ color: "var(--ink)" }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </APanel>

                {/* Env vars */}
                <APanel>
                    <APanelHeader>Environment Variables</APanelHeader>
                    <div style={{ padding: "8px 14px 6px", borderBottom: "1px solid var(--sand)", fontFamily: T.sans, fontSize: 12, color: "var(--stone)" }}>
                        Configured in <code style={{ background: "var(--sand)", padding: "1px 5px", borderRadius: 2, fontFamily: "monospace", fontSize: 11 }}>.env.local</code> — restart dev server after changes.
                    </div>
                    <ATable headers={["Variable", "Description", "Required"]}>
                        {envRows.map(row => (
                            <ATr key={row.key}>
                                <ATd mono style={{ color: "var(--wine)", fontSize: 12 }}>{row.key}</ATd>
                                <ATd muted>{row.desc}</ATd>
                                <ATd>
                                    <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: row.required ? "var(--moss)" : "var(--stone)" }}>
                                        {row.required ? "Required" : "Optional"}
                                    </span>
                                </ATd>
                            </ATr>
                        ))}
                    </ATable>
                </APanel>

                {/* Quick links */}
                <APanel>
                    <APanelHeader>Quick Links</APanelHeader>
                    <div style={{ padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {links.map(l => (
                            <a key={l.href} href={l.href} target="_blank" rel="noreferrer"
                                style={{ fontFamily: T.sans, fontSize: 12, color: "var(--wine)", textDecoration: "none", padding: "5px 12px", border: "1px solid var(--sand-deep)", borderRadius: "var(--admin-radius)", transition: "border-color .12s, color .12s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--wine)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--sand-deep)"; }}>
                                {l.label} ↗
                            </a>
                        ))}
                        <Link href="/" target="_blank"
                            style={{ fontFamily: T.sans, fontSize: 12, color: "var(--wine)", textDecoration: "none", padding: "5px 12px", border: "1px solid var(--sand-deep)", borderRadius: "var(--admin-radius)" }}>
                            View Store ↗
                        </Link>
                    </div>
                </APanel>
            </div>
        </AdminLayout>
    );
}
