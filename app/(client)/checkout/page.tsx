"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Cart } from "@/types";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

export default function CheckoutPage() {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        address: "", city: "", state: "", notes: "",
    });

    useEffect(() => { setCart(getCart()); }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/payment/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    amount: cart.total,
                    metadata: { cart: cart.items, shipping: form },
                }),
            });
            const data = await res.json();
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            }
        } finally {
            setLoading(false);
        }
    }

    const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3000;
    const total = cart.total + shipping;

    return (
        <div style={{ background: "#fff", minHeight: "calc(100vh - 200px)" }}>
            {/* Header Banner */}
            {/* <div style={{ background: "#f8f8f8", borderBottom: "1px solid #e8e8e8", padding: "16px 0", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#000" }}>
                    Spend <strong>{formatPrice(FREE_SHIPPING_THRESHOLD)}</strong> or more to unlock <strong style={{ color: "#e8002d" }}>FREE SHIPPING!</strong> <Link href="/shop" style={{ textDecoration: "underline", color: "#000" }}>Shop Now →</Link>
                </p>
            </div> */}

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: "24px", color: "#000" }}>
                    CHECKOUT
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: "32px" }}>
                        {/* Left: Delivery Form */}
                        <div>
                            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "20px", color: "#000" }}>
                                DELIVERY INFORMATION
                            </h2>

                            <div className="checkout-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                        FIRST NAME
                                    </label>
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", transition: "border .2s" }}
                                        onFocus={(e) => e.target.style.borderColor = "#000"}
                                        onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                        LAST NAME
                                    </label>
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", transition: "border .2s" }}
                                        onFocus={(e) => e.target.style.borderColor = "#000"}
                                        onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                    EMAIL ADDRESS
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", transition: "border .2s" }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                />
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                    PHONE NUMBER
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", transition: "border .2s" }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                />
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                    DELIVERY ADDRESS
                                </label>
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", transition: "border .2s" }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                />
                            </div>

                            <div className="checkout-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                        CITY
                                    </label>
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", transition: "border .2s" }}
                                        onFocus={(e) => e.target.style.borderColor = "#000"}
                                        onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                        STATE
                                    </label>
                                    <select
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", background: "#fff", transition: "border .2s" }}
                                        onFocus={(e) => e.target.style.borderColor = "#000"}
                                        onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                    >
                                        <option value="">Select State</option>
                                        {["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Benin City", "Kaduna", "Oyo", "Ondo", "Osun", "Ogun", "Delta", "Rivers", "Anambra"].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px", color: "#000" }}>
                                    ORDER NOTES (OPTIONAL)
                                </label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Special delivery instructions..."
                                    style={{ width: "100%", border: "1px solid #ddd", padding: "12px 14px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "'Barlow', sans-serif", transition: "border .2s" }}
                                    onFocus={(e) => e.target.style.borderColor = "#000"}
                                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                                />
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="checkout-summary" style={{ background: "#f8f8f8", padding: "24px", height: "fit-content", position: "sticky", top: "80px" }}>
                            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "20px", color: "#000" }}>
                                ORDER SUMMARY
                            </h2>

                            {/* Cart Items */}
                            <div style={{ marginBottom: "20px", maxHeight: "300px", overflowY: "auto" }}>
                                {cart.items.length === 0 ? (
                                    <p style={{ fontSize: "14px", color: "#666", textAlign: "center", padding: "20px 0" }}>
                                        Your cart is empty. <Link href="/shop" style={{ color: "#e8002d", textDecoration: "underline" }}>Shop now</Link>
                                    </p>
                                ) : (
                                    cart.items.map((item) => (
                                        <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: "12px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e0e0e0" }}>
                                            <div style={{ width: "60px", height: "80px", background: "#fff", position: "relative", flexShrink: 0 }}>
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="60px" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#000", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.name}
                                                </p>
                                                {item.size && (
                                                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Size: {item.size}</p>
                                                )}
                                                <p style={{ fontSize: "12px", color: "#666" }}>Qty: {item.quantity}</p>
                                                <p style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginTop: "4px" }}>
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Totals */}
                            <div style={{ borderTop: "2px solid #ddd", paddingTop: "16px", marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                                    <span style={{ color: "#666" }}>Subtotal</span>
                                    <span style={{ fontWeight: 600, color: "#000" }}>{formatPrice(cart.subtotal)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "14px" }}>
                                    <span style={{ color: "#666" }}>Shipping</span>
                                    <span style={{ fontWeight: 600, color: shipping === 0 ? "#00a651" : "#000" }}>
                                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "2px solid #000", fontSize: "18px" }}>
                                    <span style={{ fontWeight: 700, color: "#000" }}>Total</span>
                                    <span style={{ fontWeight: 700, color: "#000" }}>{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                type="submit"
                                disabled={loading || cart.items.length === 0}
                                style={{
                                    width: "100%",
                                    background: cart.items.length === 0 ? "#ccc" : "#000",
                                    color: "#fff",
                                    border: "none",
                                    padding: "16px",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    letterSpacing: ".06em",
                                    textTransform: "uppercase",
                                    cursor: cart.items.length === 0 ? "not-allowed" : "pointer",
                                    transition: "background .2s",
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    borderRadius: "4px",
                                    opacity: loading ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (cart.items.length > 0 && !loading) e.currentTarget.style.background = "#333";
                                }}
                                onMouseLeave={(e) => {
                                    if (cart.items.length > 0) e.currentTarget.style.background = "#000";
                                }}
                            >
                                {loading ? "PROCESSING..." : "PAY WITH PAYSTACK"}
                            </button>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px" }}>
                                <span style={{ fontSize: "14px" }}>🔒</span>
                                <span style={{ fontSize: "11px", color: "#666" }}>Secured by Paystack</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
