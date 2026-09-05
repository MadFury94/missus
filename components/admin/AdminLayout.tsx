"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logoutUser();
        router.push("/admin/login");
    };

    const menuItems = [
        { icon: "📊", label: "Dashboard", href: "/admin" },
        { icon: "🏠", label: "Homepage", href: "/admin/homepage" },
        { icon: "📋", label: "Orders", href: "/admin/orders" },
        { icon: "👥", label: "Customers", href: "/admin/customers" },
        { icon: "🏷️", label: "Categories", href: "/admin/categories" },
        { icon: "🎁", label: "Gift Cards", href: "/admin/gift-cards" },
        { icon: "⚙️", label: "Settings", href: "/admin/settings" },
    ];

    const productItems = [
        { label: "New Product", href: "/admin/products/new" },
        { label: "All Products", href: "/admin/products" },
    ];

    const navLinkStyle = (href: string): React.CSSProperties => {
        const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return {
            display: "flex", alignItems: "center", gap: "10px",
            padding: "11px 16px",
            color: isActive ? "#72aee6" : "#fff",
            textDecoration: "none",
            fontSize: "13px",
            background: isActive ? "#0073aa" : "transparent",
            borderLeft: isActive ? "4px solid #72aee6" : "4px solid transparent",
            transition: "background .15s",
        };
    };

    const subLinkStyle = (href: string): React.CSSProperties => {
        const isActive = pathname === href;
        return {
            display: "block",
            padding: "9px 16px 9px 36px",
            color: isActive ? "#72aee6" : "#a7aaad",
            textDecoration: "none",
            fontSize: "13px",
            background: isActive ? "#0073aa" : "transparent",
            borderLeft: isActive ? "4px solid #72aee6" : "4px solid transparent",
            transition: "background .15s",
        };
    };

    const Sidebar = () => (
        <div style={{
            width: "200px", background: "#23282d", color: "#fff",
            display: "flex", flexDirection: "column", height: "100%",
            overflowY: "auto",
        }}>
            {/* Logo */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #32373c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/admin" onClick={() => setSidebarOpen(false)} style={{ display: "block", textDecoration: "none" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/missus-logo.webp" alt="Missus Admin" style={{ height: "28px", width: "auto", filter: "brightness(0) invert(1)" }} />
                </Link>
                {/* Close button — mobile only */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="admin-sidebar-close"
                    aria-label="Close menu"
                    style={{ background: "none", border: "none", color: "#a7aaad", cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "2px", display: "none" }}
                >
                    ×
                </button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, paddingTop: "8px" }}>
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} style={navLinkStyle(item.href)} onClick={() => setSidebarOpen(false)}>
                        <span style={{ fontSize: "16px" }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}

                <div style={{ marginTop: "8px" }}>
                    <div style={{ padding: "8px 16px", fontSize: "10px", color: "#a7aaad", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".06em" }}>
                        Products
                    </div>
                    {productItems.map((item) => (
                        <Link key={item.href} href={item.href} style={subLinkStyle(item.href)} onClick={() => setSidebarOpen(false)}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #32373c", fontSize: "12px" }}>
                <Link href="/" target="_blank" style={{ color: "#72aee6", textDecoration: "none", display: "block", marginBottom: "8px" }}>
                    🌐 Visit Store
                </Link>
                <button onClick={handleLogout} style={{ color: "#a7aaad", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12px" }}>
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                .admin-layout-root {
                    display: flex;
                    min-height: 100vh;
                    background: #f0f0f1;
                }
                .admin-sidebar-desktop {
                    width: 200px;
                    position: fixed;
                    top: 0; left: 0; bottom: 0;
                    z-index: 100;
                }
                .admin-main {
                    margin-left: 200px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .admin-topbar {
                    background: #fff;
                    border-bottom: 1px solid #ccd0d4;
                    padding: 0 20px;
                    height: 46px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }
                .admin-hamburger { display: none !important; }
                .admin-topbar-title { display: block; }

                /* Mobile overlay sidebar */
                .admin-sidebar-mobile-overlay {
                    display: none;
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,.55);
                    z-index: 200;
                }
                .admin-sidebar-mobile-drawer {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; bottom: 0;
                    width: 220px;
                    z-index: 201;
                }

                @media (max-width: 768px) {
                    .admin-sidebar-desktop { display: none !important; }
                    .admin-main { margin-left: 0 !important; }
                    .admin-hamburger { display: flex !important; }
                    .admin-topbar-title { display: none; }
                    .admin-sidebar-close { display: block !important; }
                    .admin-sidebar-mobile-overlay { display: block; }
                    .admin-sidebar-mobile-drawer { display: block; }
                }
            `}</style>

            <div className="admin-layout-root">

                {/* Desktop sidebar */}
                <div className="admin-sidebar-desktop">
                    <Sidebar />
                </div>

                {/* Mobile sidebar overlay + drawer */}
                {sidebarOpen && (
                    <>
                        <div className="admin-sidebar-mobile-overlay" onClick={() => setSidebarOpen(false)} />
                        <div className="admin-sidebar-mobile-drawer">
                            <Sidebar />
                        </div>
                    </>
                )}

                {/* Main content */}
                <div className="admin-main">
                    {/* Top bar */}
                    <div className="admin-topbar">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button
                                className="admin-hamburger"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open menu"
                                style={{ background: "none", border: "none", cursor: "pointer", display: "none", alignItems: "center", padding: "4px" }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#23282d" strokeWidth="2">
                                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                            {/* Mobile logo */}
                            <Link href="/admin" className="admin-hamburger" style={{ display: "none", textDecoration: "none" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/missus-logo.webp" alt="Admin" style={{ height: "24px", width: "auto" }} />
                            </Link>
                            <span className="admin-topbar-title" style={{ fontSize: "13px", color: "#50575e" }}>Missus Admin</span>
                        </div>
                        <Link href="/" target="_blank" style={{ fontSize: "12px", color: "#2271b1", textDecoration: "none" }}>
                            View Store ↗
                        </Link>
                    </div>

                    {/* Page content */}
                    <div style={{ flex: 1, padding: "16px" }}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
