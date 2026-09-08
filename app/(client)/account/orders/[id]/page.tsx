"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCurrentUser } from "@/lib/auth";
import { Package, MapPin, CreditCard, FileText, Truck, ChevronLeft } from "lucide-react";
import ShipmentTimeline from "@/components/tracking/ShipmentTimeline";
import RouteVisual from "@/components/tracking/RouteVisual";
import CarrierInfoCard from "@/components/tracking/CarrierInfoCard";
import LatestEventCard from "@/components/tracking/LatestEventCard";
import TrackingEmptyState from "@/components/tracking/TrackingEmptyState";

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
    billing: { first_name: string; last_name: string; email: string; phone: string; address_1: string; city: string; state: string; postcode: string; country: string };
    shipping: { first_name: string; last_name: string; address_1: string; city: string; state: string; postcode: string; country: string };
    tracking?: {
        shipment_id: string;
        status: string;
        carrier_name: string;
        carrier_tracking_number: string;
        carrier_tracking_url?: string;
        address_from: { city: string; state: string; country?: string };
        address_to: { city: string; state: string; country?: string };
        estimated_delivery_date?: string;
        delivery_date?: string;
        events: { status: string; description: string; timestamp: string; location?: string }[];
    } | null;
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
        if (urlEmail && urlEmail !== guestEmail) {
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

    // Calculate shipment progress percentage
    const getShipmentProgress = () => {
        if (!order?.tracking?.events?.length) return 0;

        const events = order.tracking.events;
        const status = order.tracking.status.toLowerCase();

        if (status.includes('delivered')) return 100;
        if (status.includes('delivery') || status.includes('out for delivery')) return 80;
        if (status.includes('transit') || status.includes('shipped')) return 60;
        if (status.includes('picked') || status.includes('collected')) return 40;
        if (events.length > 0) return 20;

        return 10;
    };

    // Format delivery date for header
    const getDeliveryDateText = () => {
        if (!order?.tracking) return null;

        const { delivery_date, estimated_delivery_date, status } = order.tracking;

        if (delivery_date) {
            const date = new Date(delivery_date);
            return `Delivered on ${date.toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "long"
            })}`;
        }

        if (estimated_delivery_date) {
            const date = new Date(estimated_delivery_date);
            return `Arriving ${date.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long"
            })}`;
        }

        if (status.toLowerCase().includes('transit')) {
            return "In Transit";
        }

        return "Processing";
    };

    // Determine email to use: URL param > logged-in user > guest input
    function getEmail(): string {
        // Priority 1: URL param (from confirmation page or direct link)
        console.log('getEmail - guestEmail:', guestEmail); // Debug log
        if (guestEmail) return guestEmail.toLowerCase();

        // Priority 2: logged-in user
        const user = getCurrentUser();
        console.log('getEmail - current user:', user?.email); // Debug log
        if (user?.email) return user.email.toLowerCase();

        console.log('getEmail - returning empty string'); // Debug log
        return "";
    }

    function loadOrder(email: string) {
        setLoading(true);
        setError("");
        setOrder(null);

        const url = email
            ? `/api/account/orders/${orderId}?email=${encodeURIComponent(email)}`
            : `/api/account/orders/${orderId}?email=placeholder`;

        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
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

        console.log('useEffect - urlEmail:', urlEmail, 'guestEmail:', guestEmail); // Debug log

        const email = getEmail();
        console.log('useEffect - final email:', email); // Debug log

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
        <div style={{
            minHeight: "100vh",
            background: "#f8f9fa",
            fontFamily: "'DM Sans', sans-serif"
        }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href={isLoggedIn ? "/account" : "/"}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            color: "#767676",
                            textDecoration: "none",
                            marginBottom: "24px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#000";
                            e.currentTarget.style.background = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#767676";
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <ChevronLeft style={{ width: "14px", height: "14px" }} />
                        {isLoggedIn ? "Back to My Orders" : "Back to Home"}
                    </Link>
                </motion.div>

                {/* Enhanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "16px",
                        padding: "32px",
                        marginBottom: "24px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                    }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "16px"
                    }}>
                        <div>
                            <p style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                letterSpacing: ".16em",
                                textTransform: "uppercase",
                                color: "#9ca3af",
                                marginBottom: "8px"
                            }}>
                                Order #{order.number}
                            </p>
                            <h1 style={{
                                fontSize: "clamp(24px, 4vw, 36px)",
                                fontWeight: 700,
                                color: "#000",
                                marginBottom: "8px",
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                {getDeliveryDateText() || `Order ${statusInfo.label}`}
                            </h1>
                            <p style={{
                                fontSize: "16px",
                                color: "#6b7280",
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                {order.shipping.first_name} {order.shipping.last_name} • Placed {orderDate}
                            </p>
                        </div>

                        <span style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "8px 16px",
                            borderRadius: "20px",
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            letterSpacing: ".06em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap"
                        }}>
                            {statusInfo.label}
                        </span>
                    </div>

                    {/* Delivery Address */}
                    <div style={{
                        background: "#f8f9fa",
                        borderRadius: "8px",
                        padding: "16px",
                    }}>
                        <p style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            color: "#6b7280",
                            marginBottom: "8px"
                        }}>
                            Delivering to
                        </p>
                        <p style={{
                            fontSize: "14px",
                            color: "#374151",
                            lineHeight: 1.6,
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            {order.shipping.address_1}<br />
                            {order.shipping.city}, {order.shipping.state}
                            {order.shipping.postcode && `, ${order.shipping.postcode}`}
                            {order.shipping.country && order.shipping.country !== 'Nigeria' && `, ${order.shipping.country}`}
                        </p>
                    </div>
                </motion.div>

                {/* Enhanced Tracking Section */}
                {order.tracking ? (
                    <div>
                        {/* Timeline */}
                        <ShipmentTimeline
                            events={order.tracking.events}
                            currentStatus={order.tracking.status}
                        />

                        {/* Route Visual */}
                        <RouteVisual
                            addressFrom={order.tracking.address_from}
                            addressTo={order.tracking.address_to}
                            progress={getShipmentProgress()}
                        />

                        {/* Carrier Info */}
                        <CarrierInfoCard
                            carrierName={order.tracking.carrier_name}
                            carrierTrackingNumber={order.tracking.carrier_tracking_number}
                            carrierTrackingUrl={order.tracking.carrier_tracking_url}
                        />

                        {/* Latest Event */}
                        {order.tracking.events.length > 0 && (
                            <LatestEventCard event={order.tracking.events[0]} />
                        )}
                    </div>
                ) : (
                    <TrackingEmptyState />
                )}

                {/* Order Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "16px",
                        padding: "32px",
                        marginBottom: "24px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                    }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "24px"
                    }}>
                        <h2 style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#000",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            Order Summary
                        </h2>
                        <div style={{
                            background: "#f3f4f6",
                            color: "#374151",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600
                        }}>
                            {order.line_items.length} {order.line_items.length === 1 ? 'item' : 'items'}
                        </div>
                    </div>

                    <div>
                        {order.line_items.map((item, idx) => (
                            <div key={item.id} style={{
                                display: "flex",
                                gap: "16px",
                                padding: "20px 0",
                                borderTop: idx > 0 ? "1px solid #f0f0f0" : "none"
                            }}>
                                <div style={{
                                    width: "80px",
                                    height: "100px",
                                    background: "#f0ece8",
                                    position: "relative",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    borderRadius: "8px"
                                }}>
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                                    ) : (
                                        <div style={{
                                            position: "absolute",
                                            inset: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "10px",
                                            color: "#ccc",
                                            textAlign: "center",
                                            padding: "4px"
                                        }}>
                                            {item.name.split(" ").slice(0, 2).join(" ")}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: "#000",
                                        marginBottom: "8px",
                                        fontFamily: "'DM Sans', sans-serif"
                                    }}>
                                        {item.name}
                                    </p>
                                    {item.meta_data.map((m) => (
                                        <p key={m.key} style={{
                                            fontSize: "14px",
                                            color: "#767676",
                                            marginBottom: "4px",
                                            fontFamily: "'DM Sans', sans-serif"
                                        }}>
                                            {m.key}: {m.value}
                                        </p>
                                    ))}
                                    <p style={{
                                        fontSize: "14px",
                                        color: "#767676",
                                        fontFamily: "'DM Sans', sans-serif"
                                    }}>
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <p style={{
                                        fontSize: "16px",
                                        fontWeight: 700,
                                        color: "#000",
                                        fontFamily: "'DM Sans', sans-serif"
                                    }}>
                                        ₦{parseFloat(item.total).toLocaleString("en-NG")}
                                    </p>
                                    {item.quantity > 1 && (
                                        <p style={{
                                            fontSize: "12px",
                                            color: "#aaa",
                                            fontFamily: "'DM Sans', sans-serif"
                                        }}>
                                            ₦{Number(item.price).toLocaleString("en-NG")} each
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div style={{ borderTop: "2px solid #e5e5e5", marginTop: "20px", paddingTop: "20px" }}>
                        {[
                            { label: "Subtotal", value: `₦${order.line_items.reduce((s, i) => s + parseFloat(i.total), 0).toLocaleString("en-NG")}` },
                            parseFloat(order.discount_total) > 0 && { label: "Discount", value: `−₦${parseFloat(order.discount_total).toLocaleString("en-NG")}`, red: true },
                            { label: "Shipping", value: parseFloat(order.shipping_total) === 0 ? "FREE" : `₦${parseFloat(order.shipping_total).toLocaleString("en-NG")}` },
                            parseFloat(order.total_tax) > 0 && { label: "Tax", value: `₦${parseFloat(order.total_tax).toLocaleString("en-NG")}` },
                        ].filter(Boolean).map((row) => {
                            const r = row as { label: string; value: string; red?: boolean };
                            return (
                                <div key={r.label} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "15px",
                                    marginBottom: "12px",
                                    fontFamily: "'DM Sans', sans-serif"
                                }}>
                                    <span style={{ color: "#767676" }}>{r.label}</span>
                                    <span style={{ fontWeight: 600, color: r.red ? "#e8002d" : "#000" }}>{r.value}</span>
                                </div>
                            );
                        })}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "20px",
                            fontWeight: 800,
                            borderTop: "2px solid #000",
                            paddingTop: "16px",
                            marginTop: "8px",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            <span>Total</span>
                            <span>₦{parseFloat(order.total).toLocaleString("en-NG")}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "16px",
                        padding: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <FileText style={{ width: "20px", height: "20px", color: "#6b7280" }} />
                        <p style={{
                            fontSize: "15px",
                            color: "#374151",
                            fontFamily: "'DM Sans', sans-serif"
                        }}>
                            Issue with this order? We reply within 1 hour.
                        </p>
                    </div>
                    <Link
                        href={`/contact?subject=order&ref=Order+%23${order.number}`}
                        style={{
                            background: "var(--color-brand-primary, #7F0E12)",
                            color: "#fff",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        Contact Support
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
