"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { Package, MapPin, CreditCard, FileText, Truck, ChevronLeft } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
    processing: { label: "Processing", color: "#1e40af", bg: "#dbeafe" },
    "on-hold": { label: "On Hold", color: "#6b21a8", bg: "#f3e8ff" },
    completed: { label: "Delivered", color: "#065f46", bg: "#d1fae5" },
    cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
    refunded: { label: "Refunded", color: "#374151", bg: "#f3f4f6" },
    failed: { label: "Failed", color: "#991b1b", bg: "#fee2e2" },
};

interface OrderDetail {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    subtotal: string;
    total_tax: string;
    shipping_total: string;
    discount_total: string;
    currency: string;
    payment_method_title: string;
    transaction_id: string;
    customer_note: string;
    meta_data: { key: string; value: string }[];
    line_items: {
        id: number;
        name: string;
        quantity: number;
        price: number;
        total: string;
        sku: string;
        image: string | null;
        meta_data: { key: string; value: string }[];
    }[];
    billing: { first_name: string; last_name: string; email: string; phone: string; address_1: string; city: string; state: string };
    shipping: { first_name: string; last_name: string; address_1: string; city: string; state: string };
}

export default function OrderDetailPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px" }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: "80px", background: "#f5f5f5", marginBottom: "12px", borderRadius: "4px" }} />
                ))}
            </div>
        }>
            <OrderDetailContent />
        </Suspense>
    );
}

function OrderDetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params.id as string;

    // Email can come from: logged-in user, URL param (from confirmation page), or guest form
    const urlEmail = searchParams.get("email")?.toLowerCase() || "";
    const [guestEmail, setGuestEmail] = useState(urlEmail);
    const [emailInput, setEmailInput] = useState("");
    const [needsEmail, setNeedsEmail] = useState(false);

    // Sync guestEmail when URL param hydrates (happens after Suspense resolves)
    useEffect(() => {
        if (urlEmail && !guestEmail) {
            setGuestEmail(urlEmail);
        }
    }, [urlEmail]); // eslint-disable-line react-hooks/exhaustive-deps

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tracking, setTracking] = useState<{
        status: string;
        events: { status: string; description: string; timestamp: string; location?: string }[];
        carrier_tracking_url?: string;
    } | null>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Determine email to use: logged-in user > URL param > guest input
    function getEmail(): string {
        const user = getCurrentUser();
        if (user?.email) return user.email.toLowerCase();
        return guestEmail.toLowerCase();
    }

    function loadOrder(email: string) {
        setLoading(true);
        setError("");
        setOrder(null);

        fetch(`/api/account/orders/${orderId}?email=${encodeURIComponent(email)}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    // If email mismatch, show guest form
                    if (!getCurrentUser()) {
                        setNeedsEmail(true);
                    } else {
                        setError(data.error);
                    }
                    return;
                }
                setOrder(data);
                setNeedsEmail(false);

                // Fetch tracking if Terminal Africa shipment ID exists
                const shipmentMeta = data.meta_data?.find(
                    (m: { key: string }) => m.key === "_terminal_shipment_id"
                );
                if (shipmentMeta?.value) {
                    setTrackingLoading(true);
                    fetch(`/api/shipping/track/${shipmentMeta.value}`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((t) => { if (t) setTracking(t); })
                        .catch(() => { })
                        .finally(() => setTrackingLoading(false));
                }
            })
            .catch(() => setError("Could not load order. Please try again."))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        // Don't reload if we already have the order
        if (order) return;
        const email = getEmail();
        if (email) {
            loadOrder(email);
        } else {
            setNeedsEmail(true);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, guestEmail]);

    function handleGuestSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = emailInput.trim().toLowerCase();
        if (!trimmed) return;
        setGuestEmail(trimmed);
        loadOrder(trimmed);
    }

    // ── Guest email gate ──────────────────────────────────────────────────
    if (needsEmail && !order) {
        return (
            <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", background: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <Package style={{ width: "22px", height: "22px", color: "#fff" }} />
                </div>
                <h1 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "28px", fontWeight: 600, color: "#000", marginBottom: "8px" }}>
                    Track Your Order
                </h1>
                <p style={{ fontSize: "13px", color: "#888", marginBottom: "28px", lineHeight: 1.6 }}>
                    Enter the email address used at checkout to view your order details.
                </p>
                <form onSubmit={handleGuestSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="your@email.com"
                        required
                        style={{ width: "100%", border: "1.5px solid #e0e0e0", borderRadius: "999px", padding: "13px 18px", fontSize: "14px", outline: "none", boxSizing: "border-box", textAlign: "center" }}
                        onFocus={(e) => (e.target.style.borderColor = "#000")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                        autoComplete="email"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ background: "#000", color: "#fff", border: "none", borderRadius: "999px", padding: "14px", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? "Checking…" : "View Order"}
                    </button>
                </form>
                {error && (
                    <p style={{ fontSize: "13px", color: "#c0392b", marginTop: "14px" }}>
                        {error === "Order not found." ? "No order found for that email. Please check and try again." : error}
                    </p>
                )}
                <p style={{ fontSize: "12px", color: "#aaa", marginTop: "20px" }}>
                    Have an account?{" "}
                    <Link href={`/account/login?redirect=/account/orders/${orderId}`} style={{ color: "#000", textDecoration: "underline" }}>
                        Sign in
                    </Link>
                </p>
            </div>
        );
    }

    // ── Loading skeleton ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px" }}>
                <div style={{ height: "24px", width: "160px", background: "#f0f0f0", marginBottom: "32px", borderRadius: "4px" }} />
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: "80px", background: "#f5f5f5", marginBottom: "12px", borderRadius: "4px" }} />
                ))}
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────
    if (error || !order) {
        return (
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
                <Package style={{ width: "48px", height: "48px", color: "#e0e0e0", margin: "0 auto 16px" }} />
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "#ccc", marginBottom: "8px" }}>
                    Order not found
                </h2>
                <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "24px" }}>
                    {error || "This order doesn't exist or the email doesn't match."}
                </p>
                <Link href="/" style={{ background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none", borderRadius: "999px" }}>
                    Go Home
                </Link>
            </div>
        );
    }

    // ── Order detail ──────────────────────────────────────────────────────
    const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: "#374151", bg: "#f3f4f6" };
    const orderDate = new Date(order.date_created).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
    const isLoggedIn = !!getCurrentUser();

    return (
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 20px 80px" }}>

            {/* Back */}
            <Link
                href={isLoggedIn ? "/account" : "/"}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#767676", textDecoration: "none", marginBottom: "24px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#767676")}
            >
                <ChevronLeft style={{ width: "14px", height: "14px" }} />
                {isLoggedIn ? "Back to My Orders" : "Back to Home"}
            </Link>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(24px,4vw,32px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em", color: "#000", marginBottom: "4px" }}>
                        Order #{order.number}
                    </h1>
                    <p style={{ fontSize: "13px", color: "#767676" }}>Placed on {orderDate}</p>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, padding: "6px 14px", borderRadius: "99px", background: statusInfo.bg, color: statusInfo.color, letterSpacing: ".04em", textTransform: "uppercase", alignSelf: "flex-start" }}>
                    {statusInfo.label}
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>

                {/* Line items */}
                <section style={{ border: "1px solid #e8e8e8", padding: "20px 24px" }}>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Package style={{ width: "15px", height: "15px" }} /> Items Ordered
                    </h2>
                    <div>
                        {order.line_items.map((item, idx) => (
                            <div key={item.id} style={{ display: "flex", gap: "14px", padding: "14px 0", borderTop: idx > 0 ? "1px solid #f0f0f0" : "none" }}>
                                <div style={{ width: "60px", height: "78px", background: "#f0ece8", position: "relative", flexShrink: 0, overflow: "hidden" }}>
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="60px" />
                                    ) : (
                                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#ccc", textAlign: "center", padding: "4px" }}>
                                            {item.name.split(" ").slice(0, 2).join(" ")}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#000", marginBottom: "4px" }}>{item.name}</p>
                                    {item.meta_data.map((m) => (
                                        <p key={m.key} style={{ fontSize: "12px", color: "#767676", marginBottom: "2px" }}>
                                            {m.key}: {m.value}
                                        </p>
                                    ))}
                                    <p style={{ fontSize: "12px", color: "#767676" }}>Qty: {item.quantity}</p>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>
                                        ₦{parseFloat(item.total).toLocaleString("en-NG")}
                                    </p>
                                    {item.quantity > 1 && (
                                        <p style={{ fontSize: "11px", color: "#aaa" }}>₦{Number(item.price).toLocaleString("en-NG")} each</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div style={{ borderTop: "1px solid #e8e8e8", marginTop: "16px", paddingTop: "16px" }}>
                        {[
                            { label: "Subtotal", value: `₦${order.line_items.reduce((s, i) => s + parseFloat(i.total), 0).toLocaleString("en-NG")}` },
                            parseFloat(order.discount_total) > 0 && { label: "Discount", value: `−₦${parseFloat(order.discount_total).toLocaleString("en-NG")}`, red: true },
                            { label: "Shipping", value: parseFloat(order.shipping_total) === 0 ? "FREE" : `₦${parseFloat(order.shipping_total).toLocaleString("en-NG")}` },
                            parseFloat(order.total_tax) > 0 && { label: "Tax", value: `₦${parseFloat(order.total_tax).toLocaleString("en-NG")}` },
                        ].filter(Boolean).map((row) => {
                            const r = row as { label: string; value: string; red?: boolean };
                            return (
                                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                                    <span style={{ color: "#767676" }}>{r.label}</span>
                                    <span style={{ fontWeight: 600, color: r.red ? "#e8002d" : "#000" }}>{r.value}</span>
                                </div>
                            );
                        })}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: 800, borderTop: "2px solid #000", paddingTop: "12px", marginTop: "4px" }}>
                            <span>Total</span>
                            <span>₦{parseFloat(order.total).toLocaleString("en-NG")}</span>
                        </div>
                    </div>
                </section>

                {/* Live tracking section */}
                {(trackingLoading || tracking) && (
                    <section style={{ border: "1px solid #e8e8e8", padding: "20px 24px" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Truck style={{ width: "15px", height: "15px" }} /> Shipment Tracking
                        </h2>

                        {trackingLoading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} style={{ height: "44px", background: "#f5f5f5", borderRadius: "4px" }} />
                                ))}
                            </div>
                        ) : tracking ? (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                                    <span style={{
                                        fontSize: "11px", fontWeight: 700, padding: "5px 14px",
                                        borderRadius: "999px", textTransform: "uppercase", letterSpacing: ".06em",
                                        background: tracking.status === "delivered" ? "#d1fae5" : tracking.status === "in_transit" ? "#dbeafe" : "#f3f4f6",
                                        color: tracking.status === "delivered" ? "#065f46" : tracking.status === "in_transit" ? "#1e40af" : "#374151",
                                    }}>
                                        {tracking.status.replace(/_/g, " ")}
                                    </span>
                                    {tracking.carrier_tracking_url && (
                                        <a href={tracking.carrier_tracking_url} target="_blank" rel="noopener noreferrer"
                                            style={{ fontSize: "12px", color: "#000", textDecoration: "underline", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                            Track on Carrier →
                                        </a>
                                    )}
                                </div>

                                {tracking.events.length > 0 && (
                                    <div style={{ position: "relative", paddingLeft: "20px" }}>
                                        <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "1px", background: "#e8e8e8" }} />
                                        {tracking.events.map((evt, idx) => (
                                            <div key={idx} style={{ position: "relative", paddingBottom: idx < tracking.events.length - 1 ? "20px" : 0 }}>
                                                <div style={{ position: "absolute", left: "-16px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", background: idx === 0 ? "#000" : "#d1d5db", border: "2px solid #fff", boxShadow: "0 0 0 1px #d1d5db" }} />
                                                <p style={{ fontSize: "13px", fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? "#000" : "#555", marginBottom: "2px", lineHeight: 1.4 }}>
                                                    {evt.description}
                                                </p>
                                                {evt.location && (
                                                    <p style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>📍 {evt.location}</p>
                                                )}
                                                <p style={{ fontSize: "11px", color: "#aaa" }}>
                                                    {new Date(evt.timestamp).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : null}
                    </section>
                )}

                {/* Shipping + payment */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                    <section style={{ border: "1px solid #e8e8e8", padding: "20px 24px" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <MapPin style={{ width: "15px", height: "15px" }} /> Delivery Address
                        </h2>
                        <p style={{ fontSize: "13px", color: "#000", lineHeight: 1.8 }}>
                            {order.shipping.first_name} {order.shipping.last_name}<br />
                            {order.shipping.address_1}<br />
                            {order.shipping.city}, {order.shipping.state}<br />
                            Nigeria
                        </p>
                        {order.customer_note && (
                            <div style={{ marginTop: "12px", padding: "10px 12px", background: "#f8f8f8", borderLeft: "2px solid #e8e8e8" }}>
                                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "#aaa", marginBottom: "4px" }}>Delivery Note</p>
                                <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>{order.customer_note}</p>
                            </div>
                        )}
                    </section>

                    <section style={{ border: "1px solid #e8e8e8", padding: "20px 24px" }}>
                        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <CreditCard style={{ width: "15px", height: "15px" }} /> Payment
                        </h2>
                        <div style={{ fontSize: "13px", color: "#000", lineHeight: 1.8 }}>
                            <p><span style={{ color: "#767676" }}>Method: </span>{order.payment_method_title || "—"}</p>
                            {order.transaction_id && (
                                <p style={{ wordBreak: "break-all" }}>
                                    <span style={{ color: "#767676" }}>Ref: </span>
                                    <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{order.transaction_id}</span>
                                </p>
                            )}
                            <p><span style={{ color: "#767676" }}>Email: </span>{order.billing.email}</p>
                            {order.billing.phone && (
                                <p><span style={{ color: "#767676" }}>Phone: </span>{order.billing.phone}</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Help */}
                <div style={{ border: "1px solid #e8e8e8", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FileText style={{ width: "16px", height: "16px", color: "#aaa" }} />
                        <p style={{ fontSize: "13px", color: "#555" }}>Issue with this order? We reply within 1 hour.</p>
                    </div>
                    <Link
                        href={`/contact?subject=order&ref=Order+%23${order.number}`}
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000", textDecoration: "none", borderBottom: "1.5px solid #000", paddingBottom: "1px", whiteSpace: "nowrap" }}
                    >
                        Contact Support →
                    </Link>
                </div>
            </div>
        </div>
    );
}
