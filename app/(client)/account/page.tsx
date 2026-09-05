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
    const [tab, setTab] = useState<"orders" | "wishlist" | "details" | "giftcards">("orders");
    const [wishlistCount, setWishlistCount] = useState(0);
    const [giftCards, setGiftCards] = useState<any[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);

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
        { key: "giftcards", label: "Gift Cards", icon: Heart },
        { key: "details", label: "My Details", icon: MapPin },
    ] as const;

    function handleTabChange(key: typeof tab) {
        setTab(key);
        if (key === "giftcards" && giftCards.length === 0 && !loadingCards) {
            setLoadingCards(true);
            const u = getCurrentUser();
            fetch("/api/account/gift-cards", {
                headers: u?.token ? { Authorization: `Bearer ${u.token}` } : {},
            })
                .then((r) => r.json())
                .then((d) => setGiftCards(d.gift_cards ?? []))
                .catch(() => setGiftCards([]))
                .finally(() => setLoadingCards(false));
        }
    }

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 16px 80px" }}>
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(24px,6vw,40px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", color: "#000", marginBottom: "4px", wordBreak: "break-all", lineHeight: 1.1 }}>
                    Hey, {user.displayName || user.username} 👋
                </h1>
                <p style={{ fontSize: "13px", color: "#767676", wordBreak: "break-all", marginBottom: "14px" }}>{user.email}</p>
                <button
                    onClick={handleLogout}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "1.5px solid #e0e0e0", padding: "8px 16px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#555", transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.color = "#000"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#555"; }}
                >
                    <LogOut style={{ width: "14px", height: "14px" }} />
                    Sign Out
                </button>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "28px" }}>
                {[
                    { icon: ShoppingBag, label: "Total Orders", value: orders.length },
                    { icon: Package, label: "In Progress", value: orders.filter((o) => ["processing", "on-hold"].includes(o.status)).length },
                    { icon: Heart, label: "Wishlist", value: wishlistCount },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ border: "1px solid #e8e8e8", padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                            <Icon style={{ width: "14px", height: "14px", color: "#aaa", flexShrink: 0 }} />
                            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#aaa", lineHeight: 1.2 }}>{label}</span>
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "26px", fontWeight: 900, color: "#000" }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Tab nav */}
            <div style={{ display: "flex", borderBottom: "2px solid #e8e8e8", marginBottom: "24px" }}>
                {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => handleTabChange(key)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", background: "none", border: "none", borderBottom: tab === key ? "2px solid #000" : "2px solid transparent", marginBottom: "-2px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: tab === key ? "#000" : "#767676", cursor: "pointer", transition: "color .15s", whiteSpace: "nowrap" }}
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
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
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
                                    <div key={order.id} style={{ border: "1px solid #e8e8e8", padding: "14px 16px" }}>
                                        {/* Order header row */}
                                        <div style={{ marginBottom: "10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, letterSpacing: ".04em", color: "#000" }}>
                                                    Order #{order.number}
                                                </span>
                                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", background: statusInfo.bg, color: statusInfo.color, letterSpacing: ".04em", textTransform: "uppercase", flexShrink: 0 }}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <span style={{ fontSize: "12px", color: "#767676" }}>
                                                        {new Date(order.date_created).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#000" }}>
                                                        ₦{parseFloat(order.total).toLocaleString("en-NG")}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/account/orders/${order.id}`}
                                                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "1px", whiteSpace: "nowrap", flexShrink: 0 }}
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Line items */}
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            {order.line_items.slice(0, 4).map((li) => (
                                                <div key={li.id} style={{ display: "flex", gap: "8px", alignItems: "center", flex: "1 1 140px", minWidth: 0 }}>
                                                    {li.image && (
                                                        <div style={{ width: "40px", height: "52px", background: "#f0ece8", position: "relative", flexShrink: 0, overflow: "hidden" }}>
                                                            <Image src={li.image} alt={li.name} fill style={{ objectFit: "cover" }} sizes="40px" />
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

            {/* Gift Cards tab */}
            {tab === "giftcards" && (
                <div>
                    {loadingCards ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[1, 2].map((i) => <div key={i} style={{ height: "80px", background: "#f5f5f5" }} />)}
                        </div>
                    ) : giftCards.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <Heart style={{ width: "48px", height: "48px", color: "#e0e0e0", margin: "0 auto 16px" }} />
                            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#ccc", marginBottom: "8px" }}>No gift cards yet</h2>
                            <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>Gift cards purchased for you will appear here.</p>
                            <Link href="/gift-card-balance" style={{ fontSize: "12px", color: "#000", textDecoration: "underline", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
                                Check a code manually →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {giftCards.map((card: any, idx: number) => {
                                const sym = card.currency_symbol || "₦";
                                const bal = parseFloat(card.balance ?? card.remaining ?? 0);
                                const initial = parseFloat(card.initial_balance ?? card.amount ?? bal);
                                const isActive = bal > 0 && card.status !== "used";
                                return (
                                    <div key={card.code || idx} style={{ border: "1px solid #e8e8e8", overflow: "hidden" }}>
                                        <div style={{ background: isActive ? "#000" : "#6b7280", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>Gift Card</span>
                                            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: isActive ? "#4ade80" : "#f87171" }}>
                                                {isActive ? "Active" : "Used"}
                                            </span>
                                        </div>
                                        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                            <div>
                                                <p style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 700, color: "#000", letterSpacing: ".06em", marginBottom: "4px" }}>
                                                    {card.code}
                                                </p>
                                                {card.expiry && (
                                                    <p style={{ fontSize: "11px", color: "#aaa" }}>
                                                        Expires: {new Date(card.expiry).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "2px" }}>Balance</p>
                                                <p style={{ fontSize: "22px", fontWeight: 800, color: isActive ? "#000" : "#aaa", fontFamily: "'Barlow Condensed', sans-serif" }}>
                                                    {sym}{bal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                                </p>
                                                {initial !== bal && (
                                                    <p style={{ fontSize: "11px", color: "#ccc" }}>of {sym}{initial.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <Link href="/gift-card-balance" style={{ display: "block", textAlign: "center", fontSize: "12px", color: "#767676", textDecoration: "underline", marginTop: "8px" }}>
                                Check a different code →
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Details tab */}
            {tab === "details" && (
                <div style={{ maxWidth: "480px" }}>
                    <div style={{ border: "1px solid #e8e8e8", padding: "20px 16px", marginBottom: "16px" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "16px", color: "#000" }}>Account Info</h2>
                        {[
                            { label: "Name", value: user.displayName || `${user.username}` },
                            { label: "Username", value: user.username },
                            { label: "Email", value: user.email },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                                <span style={{ color: "#767676", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                                <span style={{ color: "#000", fontWeight: 600, wordBreak: "break-all", textAlign: "right" }}>{value}</span>
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
