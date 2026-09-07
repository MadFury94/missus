"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { clearCart } from "@/lib/cart";

interface ConfirmationOrder {
    id: number;
    number: string;
    status: string;
    total: string;
    currency: string;
    shipping_total: string;
    discount_total: string;
    line_items: {
        id: number;
        name: string;
        quantity: number;
        total: string;
        image: string | null;
        meta_data: { key: string; value: string }[];
    }[];
    billing: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address_1: string;
        city: string;
        state: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
    };
}

export default function CallbackContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const ref = searchParams.get("ref") || searchParams.get("reference") || searchParams.get("trxref");
    // These may or may not be present depending on whether order creation succeeded
    const orderNumberParam = searchParams.get("orderNumber");
    const orderIdParam = searchParams.get("orderId");
    const nameParam = searchParams.get("name");
    const addressParam = searchParams.get("address");
    const cityParam = searchParams.get("city");
    const stateParam = searchParams.get("state");

    const [cleared, setCleared] = useState(false);
    const [order, setOrder] = useState<ConfirmationOrder | null>(null);
    const [orderLoading, setOrderLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // Clear cart on success
    useEffect(() => {
        if (status === "success" && !cleared) {
            clearCart();
            window.dispatchEvent(new Event("cart-updated"));
            setCleared(true);
        }
    }, [status, cleared]);

    // Fetch order details using the Paystack reference — no login required
    // Retries up to 3 times with delay to handle WooCommerce propagation lag
    useEffect(() => {
        if (status !== "success" || !ref) { setOrderLoading(false); return; }
        const controller = new AbortController();
        setOrderLoading(true);

        const attempt = async (triesLeft: number) => {
            try {
                const res = await fetch(
                    `/api/payment/order-by-ref?ref=${encodeURIComponent(ref)}`,
                    { cache: "no-store", signal: controller.signal }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (!controller.signal.aborted) setOrder(data);
                } else if (res.status === 404 && triesLeft > 0) {
                    // Order not in WC yet — wait and retry
                    await new Promise((r) => setTimeout(r, 2500));
                    if (!controller.signal.aborted) await attempt(triesLeft - 1);
                }
            } catch {
                // aborted or network error — ignore
            } finally {
                if (!controller.signal.aborted) setOrderLoading(false);
            }
        };

        attempt(3);
        return () => controller.abort();
    }, [status, ref, retryCount]);

    if (status !== "success") {
        return (
            <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px 80px", background: "#fafafa", textAlign: "center" }}>
                <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#888", marginBottom: "10px" }}>Payment Failed</p>
                    <h1 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 600, lineHeight: 1.1, color: "#000", marginBottom: "16px" }}>
                        Something went wrong.
                    </h1>
                    <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7, marginBottom: "36px", maxWidth: "360px" }}>
                        Your card was not charged. Please try again — if the problem persists, contact us.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                        <Link href="/checkout" style={{ display: "block", textAlign: "center", background: "#000", color: "#fff", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "16px", textDecoration: "none", borderRadius: "999px" }}>
                            Try Again
                        </Link>
                        <Link href="/contact" style={{ display: "block", textAlign: "center", background: "#fff", color: "#000", border: "1.5px solid #000", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "15px", textDecoration: "none", borderRadius: "999px" }}>
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Use data from URL params as fallback while order loads
    const firstName = order?.billing?.first_name || nameParam?.split(" ")[0] || "";
    const displayName = firstName ? `Thank you, ${firstName}!` : "Thank you for your order!";
    const orderNumber = order?.number || orderNumberParam;
    const orderId = order?.id ? String(order.id) : orderIdParam;
    const shippingAddr = order?.shipping?.address_1 || addressParam || "";
    const shippingCity = order?.shipping?.city || cityParam || "";
    const shippingState = order?.shipping?.state || stateParam || "";
    const shippingName = order
        ? `${order.shipping.first_name} ${order.shipping.last_name}`
        : nameParam || "";
    const fullAddress = [shippingAddr, shippingCity, shippingState, "Nigeria"].filter(Boolean).join(", ");
    const mapQuery = encodeURIComponent(fullAddress || "Lagos, Nigeria");

    const fmt = (amount: string) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: order?.currency || "NGN" })
            .format(Number(amount));

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
                .confirm-wrap { animation: fadeIn .4s ease forwards; }
                .confirm-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 32px;
                    max-width: 960px;
                    margin: 0 auto;
                    padding: 40px 24px 80px;
                }
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
                    background-size: 200px 100%;
                    animation: shimmer 1.4s infinite;
                    border-radius: 4px;
                }
                @media (max-width: 768px) {
                    .confirm-grid { grid-template-columns: 1fr; padding: 24px 16px 60px; }
                    .confirm-order-col { order: -1; }
                }
            `}</style>

            <div className="confirm-wrap" style={{ background: "#fafafa", minHeight: "70vh" }}>

                {/* Header */}
                <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "20px 24px" }}>
                    <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            {orderNumber && (
                                <p style={{ fontSize: "11px", color: "#aaa", letterSpacing: ".06em", marginBottom: "2px" }}>
                                    Confirmation #{orderNumber}
                                </p>
                            )}
                            <h1 style={{ fontFamily: "var(--font-display, 'Cormorant', serif)", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 600, color: "#000", lineHeight: 1.1 }}>
                                {displayName}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="confirm-grid">

                    {/* LEFT — map + details + CTAs */}
                    <div>
                        {/* Map */}
                        {(shippingAddr || cityParam) && (
                            <div style={{ background: "#fff", border: "1px solid #e8e8e8", marginBottom: "16px", overflow: "hidden" }}>
                                <iframe
                                    loading="lazy"
                                    title="Delivery location"
                                    style={{ width: "100%", height: "200px", border: "none", display: "block" }}
                                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=14`}
                                />
                                <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "8px", alignItems: "center" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <p style={{ fontSize: "12px", color: "#666" }}>{fullAddress}</p>
                                </div>
                            </div>
                        )}

                        {/* Confirmed message */}
                        <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "6px" }}>
                                Your order is confirmed
                            </h2>
                            <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
                                A confirmation email with your order details is on its way.
                            </p>
                        </div>

                        {/* Order details grid */}
                        <div style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "20px", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
                                Order Details
                            </h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                {(order?.billing?.email) && (
                                    <div>
                                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Contact</p>
                                        <p style={{ fontSize: "13px", color: "#333" }}>{order.billing.email}</p>
                                    </div>
                                )}
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Payment</p>
                                    <p style={{ fontSize: "13px", color: "#333" }}>Paystack · Paid</p>
                                </div>
                                {shippingAddr && (
                                    <div>
                                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Shipping Address</p>
                                        <p style={{ fontSize: "13px", color: "#333", lineHeight: 1.5 }}>
                                            {shippingName}<br />{shippingAddr}<br />{shippingCity}, {shippingState}
                                        </p>
                                    </div>
                                )}
                                {ref && (
                                    <div>
                                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#aaa", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "4px" }}>Reference</p>
                                        <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#333", wordBreak: "break-all" }}>{ref}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <Link
                                href={orderId ? `/account/orders/${orderId}` : "/account"}
                                style={{ display: "block", textAlign: "center", background: "#000", color: "#fff", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "15px", textDecoration: "none", borderRadius: "999px" }}
                            >
                                {orderId ? "Track My Order" : "View My Orders"}
                            </Link>
                            <Link
                                href="/shop"
                                style={{ display: "block", textAlign: "center", background: "#fff", color: "#000", border: "1.5px solid #000", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "14px", textDecoration: "none", borderRadius: "999px" }}
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — order items */}
                    <div className="confirm-order-col" style={{ background: "#fff", border: "1px solid #e8e8e8", padding: "24px", height: "fit-content", position: "sticky", top: "80px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#aaa", marginBottom: "16px" }}>
                            Order Summary
                        </p>

                        {/* Loading skeletons */}
                        {orderLoading && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                                {[1, 2].map((i) => (
                                    <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <div className="skeleton" style={{ width: "56px", height: "72px", flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton" style={{ height: "14px", marginBottom: "8px" }} />
                                            <div className="skeleton" style={{ height: "12px", width: "60%" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Items */}
                        {!orderLoading && order && (
                            <>
                                <div style={{ marginBottom: "16px" }}>
                                    {order.line_items.map((item, idx) => (
                                        <div key={item.id} style={{ display: "flex", gap: "12px", padding: "12px 0", borderTop: idx > 0 ? "1px solid #f0f0f0" : "none", alignItems: "flex-start" }}>
                                            {item.image ? (
                                                <div style={{ width: "56px", height: "72px", flexShrink: 0, position: "relative", overflow: "hidden", background: "#f5f5f5" }}>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        style={{ objectFit: "cover", objectPosition: "top" }}
                                                        sizes="56px"
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ width: "56px", height: "72px", flexShrink: 0, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 9 5-5 4 4 4-4 5 5" /></svg>
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#000", marginBottom: "3px", lineHeight: 1.3 }}>{item.name}</p>
                                                {item.meta_data?.map((m, i) => (
                                                    <p key={i} style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>
                                                        {m.key}: {String(m.value)}
                                                    </p>
                                                ))}
                                                <p style={{ fontSize: "11px", color: "#888" }}>Qty: {item.quantity}</p>
                                            </div>
                                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#000", flexShrink: 0 }}>
                                                {fmt(item.total)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                {parseFloat(order.discount_total) > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                                        <span style={{ color: "#666" }}>Discount</span>
                                        <span style={{ color: "#007a3d", fontWeight: 600 }}>−{fmt(order.discount_total)}</span>
                                    </div>
                                )}
                                {parseFloat(order.shipping_total) > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                                        <span style={{ color: "#666" }}>Shipping</span>
                                        <span style={{ fontWeight: 600 }}>{fmt(order.shipping_total)}</span>
                                    </div>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, borderTop: "2px solid #000", paddingTop: "12px", marginTop: "8px" }}>
                                    <span>Total</span>
                                    <span>{fmt(order.total)}</span>
                                </div>
                            </>
                        )}

                        {/* Fallback when order not yet in WC */}
                        {!orderLoading && !order && (
                            <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, marginBottom: "16px" }}>
                                <p style={{ marginBottom: "8px" }}>Items are loading…</p>
                                <button
                                    type="button"
                                    onClick={() => setRetryCount((c) => c + 1)}
                                    style={{ fontSize: "12px", color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                >
                                    Refresh
                                </button>
                            </div>
                        )}

                        {/* Reference + order number always shown */}
                        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "14px", marginTop: "8px" }}>
                            {ref && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
                                    <span style={{ color: "#aaa" }}>Reference</span>
                                    <span style={{ fontFamily: "monospace", color: "#333", maxWidth: "150px", textAlign: "right", wordBreak: "break-all" }}>{ref}</span>
                                </div>
                            )}
                            {orderNumber && (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                                    <span style={{ color: "#aaa" }}>Order #</span>
                                    <span style={{ fontWeight: 700, color: "#000" }}>#{orderNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
