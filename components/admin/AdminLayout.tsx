"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logoutUser();
        router.push("/admin/login");
    };

    const menuItems = [
        { icon: "📊", label: "Dashboard", href: "/admin" },
        { icon: "📋", label: "Orders", href: "/admin/orders" },
        { icon: "👥", label: "Customers", href: "/admin/customers" },
        { icon: "🏷️", label: "Categories", href: "/admin/categories" },
        { icon: "⚙️", label: "Settings", href: "/admin/settings" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f0f1" }}>
            {/* Sidebar */}
            <div style={{ width: "160px", background: "#23282d", color: "#fff", display: "flex", flexDirection: "column", position: "fixed", height: "100vh", left: 0, top: 0 }}>
                {/* Logo */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #32373c" }}>
                    <Link href="/admin" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff", textDecoration: "none", display: "block" }}>
                        MISSUS<span style={{ color: "#e8002d" }}>.</span>
                    </Link>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, padding: "8px 0" }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 16px",
                                    color: isActive ? "#72aee6" : "#fff",
                                    textDecoration: "none",
                                    fontSize: "13px",
                                    background: isActive ? "#0073aa" : "transparent",
                                    borderLeft: isActive ? "4px solid #72aee6" : "4px solid transparent",
                                    transition: "all .15s"
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "#32373c";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "transparent";
                                    }
                                }}
                            >
                                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Products Section */}
                    <div style={{ marginTop: "4px" }}>
                        <div style={{ padding: "8px 16px", fontSize: "11px", color: "#a7aaad", textTransform: "uppercase", fontWeight: 600, letterSpacing: ".5px" }}>
                            Products
                        </div>
                        {[
                            { label: "New Product", href: "/admin/products/new" },
                            { label: "All Products", href: "/admin/products" },
                        ].map((subItem) => {
                            const isActive = pathname === subItem.href;
                            return (
                                <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    style={{
                                        display: "block",
                                        padding: "8px 16px 8px 32px",
                                        color: isActive ? "#72aee6" : "#a7aaad",
                                        textDecoration: "none",
                                        fontSize: "13px",
                                        background: isActive ? "#0073aa" : "transparent",
                                        borderLeft: isActive ? "4px solid #72aee6" : "4px solid transparent",
                                        transition: "all .15s"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = "#32373c";
                                            e.currentTarget.style.color = "#fff";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#a7aaad";
                                        }
                                    }}
                                >
                                    {subItem.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #32373c", fontSize: "12px" }}>
                    <Link href="/" target="_blank" style={{ color: "#72aee6", textDecoration: "none", display: "block", marginBottom: "8px" }}>
                        🌐 Visit Site
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{ color: "#fff", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12px", opacity: 0.7 }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: "160px", flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Top Bar */}
                <div style={{ background: "#fff", borderBottom: "1px solid #ccd0d4", padding: "0 20px", height: "32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "13px", color: "#50575e" }}>
                        Admin Panel
                    </div>
                    <div style={{ fontSize: "13px", color: "#50575e" }}>
                        Welcome, Admin
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: "20px" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
