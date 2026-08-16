"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, logoutUser, type User } from "@/lib/auth";
import { formatPrice } from "@/lib/woocommerce";
import { getWishlistCount } from "@/lib/wishlist";
import { Package, Heart, MapPin, LogOut, ChevronRight, ShoppingBag } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
    processing: { label: "Processing", color: "#1e40af", bg: "#dbeafe" },
    "on-hold": { label: "On Hold", color: "#6b21a8", bg: "#f3e8ff" },
    completed: { label: "Delivered", color: "#065f46", bg: "#d1fae5" },
    cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
    refunded: { label: "Refunded", color: "#374151", bg: "#f3f4f6" },
    failed: { label: "Failed", color: "#991b1b", bg: "#fee2e2" },
};

interface Order {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    currency: string;
    line_items: { id: number; name: string; quantity: number; total: string; image: string | null }[];
    shipping: { first_name: string; last_name: string; address_1: string; city: string; state: string };
}

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [tab, setTab] = useState<"orders" | "wishlist" | "details">("orders");
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u) { router.push("/account/login"); return; }
        setUser(u);
        setWishlistCount(getWishlistCount());
        fetch(`/api/account/orders?email=${encodeURIComponent(u.email)}`)
            .then((r) => r.json())
            .then((d) => setOrders(d.orders ?? []))
            .catch(() => setOrders([]))
            .finally(() => setLoadingOrders(false));
    }, [router]);

    function handleLogout() {
        logoutUser();
        router.push("/");
    }

    if (!user) return null;

    const TAB_ITEMS = [
        { key: "orders", label: "My Orders", icon: Package },
        { key: "details", label: "My Details", icon: MapPin },
    ] as const;

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 20px 80px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", color: "#000", marginBottom: "4px" }}>
                        Hey, {user.displayName || user.username} 👋
                    </h1>
                    <p style={{ fontSize: "13px", color: "#767676" }}>{user.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1.5px solid #e0e0e0", padding: "8px 16px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#555", transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#555"; }}
                >
                    <LogOut style={{ width: "14px", height: "14px" }} />
                    Sign Out
                </button>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
                {[
                    { icon: ShoppingBag, label: "Total Orders", value: orders.length },
                    { icon: Package, label: "In Progress", value: orders.filter((o) => ["processing", "on-hold"].includes(o.status)).length },
                    { icon: Heart, label: "Wishlist", value: wishlistCount },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ border: "1px solid #e8e8e8", padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <Icon style={{ width: "16px", height: "16px", color: "#aaa" }} />
                            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#aaa" }}>{label}</span>
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900, color: "#000" }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Tab nav */}
            <div style={{ display: "flex", borderBottom: "2px solid #e8e8e8", marginBottom: "28px", gap: "0" }}>
                {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: "none", border: "none", borderBottom: tab === key ? "2px solid #000" : "2px solid transparent", marginBottom: "-2px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: tab === key ? "#000" : "#767676", cursor: "pointer", transition: "color .15s" }}
                    >
                        <Icon style={{ width: "14px", height: "14px" }} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Orders tab */}
            {tab === "orders" && (
                <div>
                    {loadingOrders ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[1, 2, 3].map((i) => <div key={i} style={{ height: "100px", background: "#f5f5f5" }} />)}
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "80px 20px" }}>
                            <ShoppingBag style={{ width: "48px", height: "48px", color: "#e0e0e0", margin: "0 auto 16px" }} />
                            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#ccc", marginBottom: "8px" }}>No orders yet</h2>
                            <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "24px" }}>Time to treat yourself.</p>
                            <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "14px 32px", textDecoration: "none" }}>Shop Now</Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {orders.map((order) => {
                                const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: "#374151", bg: "#f3f4f6" };
                                return (
                                    <div key={order.id} style={{ border: "1px solid #e8e8e8", padding: "16px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, letterSpacing: ".04em", color: "#000" }}>Order #{order.number}</span>
                                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", background: statusInfo.bg, color: statusInfo.color, letterSpacing: ".04em", textTransform: "uppercase" }}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                <span style={{ fontSize: "12px", color: "#767676" }}>
                                                    {new Date(order.date_created).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#000" }}>
                                                    ₦{parseFloat(order.total).toLocaleString("en-NG")}
                                                </span>
                                                <Link
                                                    href={`/account/orders/${order.id}`}
                                                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "1px", whiteSpace: "nowrap" }}
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Line items */}
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            {order.line_items.slice(0, 4).map((li) => (
                                                <div key={li.id} style={{ display: "flex", gap: "10px", alignItems: "center", flex: "1 1 200px", minWidth: 0 }}>
                                                    {li.image && (
                                                        <div style={{ width: "44px", height: "56px", background: "#f0ece8", position: "relative", flexShrink: 0, overflow: "hidden" }}>
                                                            <Image src={li.image} alt={li.name} fill style={{ objectFit: "cover" }} sizes="44px" />
                                                        </div>
                                                    )}
                                                    <div style={{ minWidth: 0 }}>
                                                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{li.name}</p>
                                                        <p style={{ fontSize: "11px", color: "#767676" }}>Qty: {li.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.line_items.length > 4 && (
                                                <div style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#767676" }}>
                                                    +{order.line_items.length - 4} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Details tab */}
            {tab === "details" && (
                <div style={{ maxWidth: "480px" }}>
                    <div style={{ border: "1px solid #e8e8e8", padding: "24px", marginBottom: "16px" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "16px", color: "#000" }}>Account Info</h2>
                        {[
                            { label: "Name", value: user.displayName || `${user.username}` },
                            { label: "Username", value: user.username },
                            { label: "Email", value: user.email },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                                <span style={{ color: "#767676", fontWeight: 500 }}>{label}</span>
                                <span style={{ color: "#000", fontWeight: 600 }}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
                        To update your password or personal details, visit your{" "}
                        <a href="https://missusoutfits.com/my-account" target="_blank" rel="noopener noreferrer" style={{ color: "#000", textDecoration: "underline" }}>
                            WordPress account page →
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}
