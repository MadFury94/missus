"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface TrackingEvent {
    status: string;
    description: string;
    timestamp: string;
    location?: string;
}

interface OrderResult {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    currency: string;
    shipping_total: string;
    line_items: {
        id: number;
        name: string;
        quantity: number;
        total: string;
        image: string | null;
        meta_data: { key: string; value: string }[];
    }[];
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
    };
    tracking?: {
        status: string;
        events: TrackingEvent[];
        carrier_tracking_url?: string;
    } | null;
    shipment_id?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
    processing: { label: "Processing", color: "#1e40af", bg: "#dbeafe" },
    "on-hold": { label: "On Hold", color: "#6b21a8", bg: "#f3e8ff" },
    completed: { label: "Delivered", color: "#065f46", bg: "#d1fae5" },
    cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
    refunded: { label: "Refunded", color: "#374151", bg: "#f3f4f6" },
    failed: { label: "Failed", color: "#991b1b", bg: "#fee2e2" },
};

export default function TrackOrderPage() {
    const [form, setForm] = useState({ orderNumber: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<OrderResult | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setResult(null);
        setLoading(true);
        try {
            const res = await fetch(
                `/api/account/orders/lookup?orderNumber=${encodeURIComponent(form.orderNumber.trim())}&email=${encodeURIComponent(form.email.trim())}`,
                { cache: "no-store" }
            );
            const data = await res.json();
            if (!res.ok || data.error) {
                setError(data.error || "Order not found. Please check your order number and email.");
                return;
            }
            setResult(data);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const fmt = (amount: string, currency = "NGN") =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(amount));

    const statusInfo = result ? (STATUS_LABELS[result.status] ?? { label: result.status, color: "#374151", bg: "#f3f4f6" }) : null;

    return (
        <>
            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                .track-result { animation: fadeUp .35s ease forwards; }
                .track-input:focus { border-color: #000 !important; }
                @media(max-width:768px) {
                    .track-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div style={{ minHeight: "70vh", background: "#fafafa", padding: "48px 20px 80px" }}>
                <div style={{ maxWidth: "520px", margin: "0 auto" }}>

                    {/* Breadcrumb */}
                    <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "36px", letterSpacing: ".04em" }}>
                        <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>Home</Link>
                        {" / "}
                        <span style={{ color: "#555" }}>Track My Order</span>
                    </p>

                    {/* Heading */}
                    <div style={{ marginBottom: "32px" }}>
                        <div style={{ width: "48px", height: "48px", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" rx="1" />
                                <path d="M16 8h4l3 3v5h-7V8z" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                        </div>
                        <h1 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, color: "#000", letterSpacing: "-.01em", marginBottom: "8px" }}>
                            Track Your Order
                        </h1>
                        <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>
                            Enter your order number and the email you used at checkout.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>
                                Order Number
                            </label>
                            <input
                                className="track-input"
                                type="text"
                                placeholder="e.g. 6056"
                                value={form.orderNumber}
                                onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                                required
                                style={{ width: "100%", border: "1.5px solid #e0e0e0", padding: "13px 16px", fontSize: "14px", outline: "none", transition: "border-color .2s", boxSizing: "border-box", background: "#fff" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "6px" }}>
                                Email Address
                            </label>
                            <input
                                className="track-input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                autoComplete="email"
                                style={{ width: "100%", border: "1.5px solid #e0e0e0", padding: "13px 16px", fontSize: "14px", outline: "none", transition: "border-color .2s", boxSizing: "border-box", background: "#fff" }}
                            />
                        </div>

                        {error && (
                            <div style={{ background: "#fff", border: "1px solid #fecaca", borderLeft: "3px solid #e53e3e", padding: "12px 16px", fontSize: "13px", color: "#9b1c1c" }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: "15px", background: "#000", color: "#fff", border: "none", borderRadius: "999px", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, transition: "opacity .2s", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
                        >
                            {loading ? "Looking up…" : "Track Order"}
                        </button>
                    </form>

                    {/* Result */}
                    {result && statusInfo && (
                        <div className="track-result">

                            {/* Status header */}
                            <div style={{ background: "#000", padding: "20px 24px", marginBottom: "1px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginBottom: "4px" }}>
                                        Order #{result.number}
                                    </p>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                                        {result.shipping.first_name} {result.shipping.last_name}
                                    </p>
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "5px 14px", borderRadius: "999px", background: statusInfo.bg, color: statusInfo.color, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            {/* Delivery address */}
                            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderTop: "none", padding: "16px 24px", marginBottom: "16px" }}>
                                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa", marginBottom: "6px" }}>Delivering to</p>
                                <p style={{ fontSize: "13px", color: "#333", lineHeight: 1.6 }}>
                                    {result.shipping.address_1}<br />
                                    {result.shipping.city}, {result.shipping.state}, Nigeria
                                </p>
                            </div>

                            {/* Live tracking timeline */}
                            {result.tracking && result.tracking.events.length > 0 && (
                                <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "20px 24px", marginBottom: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa" }}>Shipment Updates</p>
                                        {result.tracking.carrier_tracking_url && (
                                            <a href={result.tracking.carrier_tracking_url} target="_blank" rel="noopener noreferrer"
                                                style={{ fontSize: "11px", color: "#000", textDecoration: "underline", fontWeight: 600 }}>
                                                Track on carrier →
                                            </a>
                                        )}
                                    </div>
                                    <div style={{ position: "relative", paddingLeft: "20px" }}>
                                        <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "1px", background: "#e8e8e8" }} />
                                        {result.tracking.events.map((evt, idx) => (
                                            <div key={idx} style={{ position: "relative", paddingBottom: idx < result.tracking!.events.length - 1 ? "20px" : 0 }}>
                                                <div style={{ position: "absolute", left: "-16px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", background: idx === 0 ? "#000" : "#d1d5db", border: "2px solid #fff", boxShadow: "0 0 0 1px #d1d5db" }} />
                                                <p style={{ fontSize: "13px", fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? "#000" : "#555", marginBottom: "2px", lineHeight: 1.4 }}>{evt.description}</p>
                                                {evt.location && <p style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>📍 {evt.location}</p>}
                                                <p style={{ fontSize: "11px", color: "#aaa" }}>
                                                    {new Date(evt.timestamp).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "20px 24px", marginBottom: "16px" }}>
                                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa", marginBottom: "14px" }}>Items</p>
                                {result.line_items.map((item, idx) => (
                                    <div key={item.id} style={{ display: "flex", gap: "12px", padding: "10px 0", borderTop: idx > 0 ? "1px solid #f5f5f5" : "none", alignItems: "flex-start" }}>
                                        {item.image ? (
                                            <div style={{ width: "52px", height: "68px", flexShrink: 0, position: "relative", overflow: "hidden", background: "#f5f5f5" }}>
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="52px" />
                                            </div>
                                        ) : (
                                            <div style={{ width: "52px", height: "68px", flexShrink: 0, background: "#f0f0f0" }} />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#000", marginBottom: "3px" }}>{item.name}</p>
                                            {item.meta_data?.map((m, i) => (
                                                <p key={i} style={{ fontSize: "11px", color: "#888" }}>{m.key}: {String(m.value)}</p>
                                            ))}
                                            <p style={{ fontSize: "11px", color: "#888" }}>Qty: {item.quantity}</p>
                                        </div>
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#000", flexShrink: 0 }}>{fmt(item.total, result.currency)}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, borderTop: "2px solid #000", paddingTop: "12px", marginTop: "8px" }}>
                                    <span>Total</span>
                                    <span>{fmt(result.total, result.currency)}</span>
                                </div>
                            </div>

                            {/* Search again */}
                            <button
                                type="button"
                                onClick={() => { setResult(null); setForm({ orderNumber: "", email: "" }); }}
                                style={{ width: "100%", padding: "13px", background: "none", border: "1.5px solid #e0e0e0", borderRadius: "999px", fontSize: "12px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#555", cursor: "pointer", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
                            >
                                Track Another Order
                            </button>
                        </div>
                    )}

                    <p style={{ fontSize: "12px", color: "#bbb", marginTop: "32px", textAlign: "center", lineHeight: 1.8 }}>
                        Have an account?{" "}
                        <Link href="/account" style={{ color: "#000", textDecoration: "underline", fontWeight: 600 }}>
                            Sign in
                        </Link>{" "}
                        to see all your orders in one place.
                    </p>
                </div>
            </div>
        </>
    );
}
