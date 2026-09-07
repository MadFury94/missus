"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp, CreditCard, Banknote } from "lucide-react";
import type { Cart } from "@/types";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";
import type { ShippingRate } from "@/lib/delivery";

const STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara",
];

export default function CheckoutPage() {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });
    const [loading, setLoading] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [promoLabel, setPromoLabel] = useState("");
    const [promoInput, setPromoInput] = useState("");
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        address: "", apartment: "", city: "", state: "", postalCode: "",
        notes: "", newsletter: false, textUpdates: false,
    });

    // UI state
    const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");

    // Shipping rates state
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesFallback, setRatesFallback] = useState(false);
    const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
    const ratesDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setCart(getCart()); }, []);

    // Fetch rates whenever city + state are filled
    const fetchRates = useCallback(async (city: string, state: string) => {
        if (!city.trim() || !state.trim()) return;
        setRatesLoading(true);
        setSelectedRate(null);
        try {
            const items = cart.items.map((item) => ({
                name: item.name,
                weight: 0.5,
                value: item.price,
                quantity: item.quantity,
            }));
            const res = await fetch("/api/shipping/rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ city, state, items }),
            });
            const data = await res.json();
            setRates(data.rates || []);
            setRatesFallback(data.fallback || false);
            if (data.rates?.length === 1) setSelectedRate(data.rates[0]);
        } catch {
            setRates([]);
        } finally {
            setRatesLoading(false);
        }
    }, [cart.items]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));

        // Debounce rate fetch when city/state change
        if (name === "city" || name === "state") {
            if (ratesDebounce.current) clearTimeout(ratesDebounce.current);
            ratesDebounce.current = setTimeout(() => {
                const updated = name === "city"
                    ? { city: value, state: form.state }
                    : { city: form.city, state: value };
                if (updated.city && updated.state) fetchRates(updated.city, updated.state);
            }, 800);
        }
    }
    async function applyPromo() {
        const code = promoInput.trim().toUpperCase();
        if (!code) return;
        setPromoLoading(true);
        setPromoError("");
        try {
            const res = await fetch("/api/promo/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, subtotal: cart.subtotal }),
            });
            const data = await res.json();
            if (!data.valid) {
                setPromoError(data.error || "Invalid promo code.");
                setPromoDiscount(0); setPromoCode(""); setPromoLabel("");
            } else {
                setPromoDiscount(data.discount);
                setPromoCode(data.code);
                setPromoLabel(data.label);
                setPromoError("");
            }
        } catch {
            setPromoError("Could not validate code. Please try again.");
        } finally {
            setPromoLoading(false);
        }
    }

    function removePromo() {
        setPromoCode(""); setPromoLabel(""); setPromoInput(""); setPromoDiscount(0); setPromoError("");
    }

    const shippingCost = selectedRate?.amount ?? (rates.length > 0 ? null : 0);
    const shippingDisplay = shippingCost === null ? null : shippingCost === 0 ? "FREE" : formatPrice(shippingCost);
    const total = cart.total + (shippingCost ?? 0) - promoDiscount;

    async function handlePaystackCheckout() {
        if (!selectedRate) {
            document.getElementById("shipping-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/payment/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    amount: total,
                    metadata: {
                        cart: cart.items,
                        shipping: form,
                        promoCode,
                        promoDiscount,
                        selectedRateId: selectedRate.rate_id,
                        selectedCarrier: selectedRate.carrier_name,
                        shippingCost: selectedRate.amount,
                        giftCardCode: promoCode && promoLabel.toLowerCase().includes("gift") ? promoCode : "",
                        giftCardAmount: promoCode && promoLabel.toLowerCase().includes("gift") ? promoDiscount : 0,
                    },
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

    async function handleBankTransferCheckout() {
        if (!selectedRate) return;
        setLoading(true);
        const orderData = {
            cart: cart.items,
            shipping: form,
            promoCode,
            promoDiscount,
            selectedRate,
            total,
        };
        localStorage.setItem("pending_bank_order", JSON.stringify(orderData));
        window.location.href = "/checkout/bank-transfer";
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (paymentMethod === "card") {
            await handlePaystackCheckout();
        } else {
            await handleBankTransferCheckout();
        }
    }
    return (
        <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .order-summary-content { animation: fadeIn 0.2s ease; }
                
                /* Mobile styles */
                @media (max-width: 1023px) {
                    .checkout-container { padding: 16px !important; }
                    .checkout-form { padding: 20px !important; }
                    .desktop-layout { display: none !important; }
                    .mobile-layout { display: block !important; }
                }
                
                /* Desktop styles */
                @media (min-width: 1024px) {
                    .desktop-layout { display: block !important; }
                    .mobile-layout { display: none !important; }
                }
            `}</style>

            {/* Mobile Header & Collapsible Order Summary */}
            <div className="mobile-layout" style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "20px 0" }}>
                <div className="checkout-container" style={{ maxWidth: "480px", margin: "0 auto", padding: "0 24px" }}>
                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <Link href="/" style={{ display: "inline-block", fontFamily: "'Cormorant', serif", fontSize: "28px", fontWeight: 600, color: "#000", textDecoration: "none", letterSpacing: ".02em" }}>
                            MISSUS
                        </Link>
                    </div>

                    {/* Collapsible Order Summary */}
                    <div style={{ border: "1px solid #d9d9d9", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
                        <button
                            type="button"
                            onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
                            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#fff", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: 500 }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {orderSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                Order summary
                            </span>
                            <span style={{ fontSize: "18px", fontWeight: 600 }}>{formatPrice(Math.max(0, total))}</span>
                        </button>

                        {orderSummaryOpen && (
                            <div className="order-summary-content" style={{ borderTop: "1px solid #e5e5e5", padding: "20px", background: "#fafafa" }}>
                                {/* Items */}
                                <div style={{ marginBottom: "20px" }}>
                                    {cart.items.map((item) => (
                                        <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                                            <div style={{ position: "relative", width: "60px", height: "60px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="60px" />
                                                <div style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", background: "#666", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600 }}>
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: "14px", fontWeight: 500, color: "#000", marginBottom: "4px" }}>{item.name}</p>
                                                {item.size && <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Size: {item.size}</p>}
                                                <p style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Promo Code */}
                                <div style={{ marginBottom: "20px" }}>
                                    {promoCode ? (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "12px 16px", borderRadius: "6px" }}>
                                            <span style={{ fontSize: "13px", color: "#0369a1", fontWeight: 500 }}>✓ {promoCode} applied</span>
                                            <button onClick={removePromo} type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#666" }}>×</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <input
                                                type="text"
                                                value={promoInput}
                                                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                                                placeholder="Discount code or gift card"
                                                style={{ flex: 1, border: "1px solid #d9d9d9", borderRadius: "6px", padding: "12px 14px", fontSize: "14px", outline: "none" }}
                                            />
                                            <button
                                                type="button"
                                                onClick={applyPromo}
                                                disabled={promoLoading}
                                                style={{ background: "#000", color: "#fff", border: "none", borderRadius: "6px", padding: "12px 16px", fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", opacity: promoLoading ? 0.6 : 1 }}
                                            >
                                                {promoLoading ? "..." : "Apply"}
                                            </button>
                                        </div>
                                    )}
                                    {promoError && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "6px" }}>{promoError}</p>}
                                </div>
                                {/* Totals */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                        <span style={{ color: "#666" }}>Subtotal</span>
                                        <span>{formatPrice(cart.subtotal)}</span>
                                    </div>
                                    {promoDiscount > 0 && (
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                            <span style={{ color: "#10b981" }}>Discount</span>
                                            <span style={{ color: "#10b981" }}>-{formatPrice(promoDiscount)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
                                        <span style={{ color: "#666" }}>Shipping</span>
                                        <span>{shippingDisplay ?? "Calculated at next step"}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #e5e5e5", fontSize: "16px", fontWeight: 600 }}>
                                        <span>Total</span>
                                        <span>NGN {formatPrice(Math.max(0, total))}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="desktop-layout" style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "20px 0" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
                    <Link href="/" style={{ display: "inline-block", fontFamily: "'Cormorant', serif", fontSize: "32px", fontWeight: 600, color: "#000", textDecoration: "none", letterSpacing: ".02em" }}>
                        MISSUS
                    </Link>
                </div>
            </div>

            {/* Mobile Checkout Form */}
            <div className="mobile-layout">
                <div className="checkout-container" style={{ maxWidth: "480px", margin: "0 auto", padding: "0 24px 40px" }}>
                    <div className="checkout-form" style={{ background: "#fff", borderRadius: "8px", padding: "32px", marginTop: "24px", border: "1px solid #e5e5e5" }}>

                        <form onSubmit={handleSubmit}>
                            {/* Contact */}
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                    <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#000", margin: 0 }}>Contact</h2>
                                    <Link href="/account/login" style={{ fontSize: "14px", color: "#6366f1", textDecoration: "underline" }}>
                                        Sign in
                                    </Link>
                                </div>

                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "6px",
                                        padding: "14px 16px",
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "12px"
                                    }}
                                />

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={form.newsletter}
                                        onChange={(e) => setForm(f => ({ ...f, newsletter: e.target.checked }))}
                                        style={{ width: "16px", height: "16px" }}
                                    />
                                    Email me with news and offers
                                </label>
                            </div>
                            {/* Delivery */}
                            <div style={{ marginBottom: "24px" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "16px" }}>Delivery</h2>

                                <select
                                    name="country"
                                    defaultValue="Nigeria"
                                    disabled
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "6px",
                                        padding: "14px 16px",
                                        fontSize: "14px",
                                        background: "#f9f9f9",
                                        marginBottom: "12px",
                                        boxSizing: "border-box"
                                    }}
                                >
                                    <option>Nigeria</option>
                                </select>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                        required
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "6px",
                                            padding: "14px 16px",
                                            fontSize: "14px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        required
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "6px",
                                            padding: "14px 16px",
                                            fontSize: "14px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "6px",
                                        padding: "14px 16px",
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "12px"
                                    }}
                                />

                                <input
                                    name="apartment"
                                    value={form.apartment}
                                    onChange={handleChange}
                                    placeholder="Apartment, suite, etc. (optional)"
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "6px",
                                        padding: "14px 16px",
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "12px"
                                    }}
                                />

                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "6px",
                                        padding: "14px 16px",
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "12px"
                                    }}
                                />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                    <select
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "6px",
                                            padding: "14px 16px",
                                            fontSize: "14px",
                                            background: "#fff",
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        <option value="">State</option>
                                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <input
                                        name="postalCode"
                                        value={form.postalCode}
                                        onChange={handleChange}
                                        placeholder="Postal code"
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "6px",
                                            padding: "14px 16px",
                                            fontSize: "14px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <input
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "6px",
                                        padding: "14px 16px",
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "12px"
                                    }}
                                />

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#666", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={form.textUpdates}
                                        onChange={(e) => setForm(f => ({ ...f, textUpdates: e.target.checked }))}
                                        style={{ width: "16px", height: "16px" }}
                                    />
                                    Text me with news and offers
                                </label>
                            </div>

                            {/* Shipping Method */}
                            <div id="shipping-section" style={{ marginBottom: "24px" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "16px" }}>Shipping method</h2>

                                {!form.city || !form.state ? (
                                    <div style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "6px", padding: "16px", fontSize: "14px", color: "#666", textAlign: "center" }}>
                                        Enter your delivery address to see shipping options
                                    </div>
                                ) : ratesLoading ? (
                                    <div style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "6px", padding: "16px" }}>
                                        <div style={{ height: "60px", background: "#e5e5e5", borderRadius: "4px", animation: "pulse 1.5s ease infinite" }} />
                                        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
                                    </div>
                                ) : rates.length === 0 ? (
                                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "16px", fontSize: "14px", color: "#dc2626" }}>
                                        No shipping options available for this address
                                    </div>
                                ) : (
                                    <div style={{ border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden" }}>
                                        {rates.map((rate, index) => {
                                            const selected = selectedRate?.rate_id === rate.rate_id;
                                            return (
                                                <label
                                                    key={rate.rate_id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        padding: "16px",
                                                        cursor: "pointer",
                                                        borderTop: index > 0 ? "1px solid #e5e5e5" : "none",
                                                        background: selected ? "#f0f9ff" : "#fff"
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="shipping"
                                                        checked={selected}
                                                        onChange={() => setSelectedRate(rate)}
                                                        style={{ marginRight: "12px" }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <span style={{ fontSize: "14px", fontWeight: 500 }}>{rate.carrier_name}</span>
                                                            <span style={{ fontSize: "14px", fontWeight: 600 }}>{formatPrice(rate.amount)}</span>
                                                        </div>
                                                        <p style={{ fontSize: "12px", color: "#666", margin: "2px 0 0 0" }}>{rate.delivery_time}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {/* Payment */}
                            <div style={{ marginBottom: "24px" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "16px" }}>Payment</h2>
                                <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>All transactions are secure and encrypted.</p>

                                {/* Payment Method Selection */}
                                <div style={{ border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden", marginBottom: "16px" }}>
                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "16px",
                                            cursor: "pointer",
                                            background: paymentMethod === "card" ? "#f0f9ff" : "#fff",
                                            borderBottom: "1px solid #e5e5e5"
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === "card"}
                                            onChange={() => setPaymentMethod("card")}
                                            style={{ marginRight: "12px" }}
                                        />
                                        <CreditCard size={18} style={{ marginRight: "8px" }} />
                                        <span style={{ fontSize: "14px", fontWeight: 500 }}>Credit card</span>
                                        <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                                            <div style={{ background: "#1a1f71", color: "#fff", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: 600 }}>VISA</div>
                                            <div style={{ background: "#eb001b", color: "#fff", padding: "2px 6px", borderRadius: "2px", fontSize: "10px", fontWeight: 600 }}>MC</div>
                                            <div style={{ fontSize: "12px", color: "#666" }}>+5</div>
                                        </div>
                                    </label>
                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "16px",
                                            cursor: "pointer",
                                            background: paymentMethod === "bank_transfer" ? "#f0f9ff" : "#fff"
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === "bank_transfer"}
                                            onChange={() => setPaymentMethod("bank_transfer")}
                                            style={{ marginRight: "12px" }}
                                        />
                                        <Banknote size={18} style={{ marginRight: "8px" }} />
                                        <span style={{ fontSize: "14px", fontWeight: 500 }}>Bank transfer</span>
                                    </label>
                                </div>

                                {paymentMethod === "bank_transfer" && (
                                    <div style={{ background: "#fef7ff", border: "1px solid #e9d5ff", borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
                                        <p style={{ fontSize: "13px", color: "#7c3aed", margin: 0 }}>
                                            After clicking "Complete order", you will be redirected to view your order details and bank account information for payment.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || cart.items.length === 0 || !selectedRate}
                                style={{
                                    width: "100%",
                                    background: "#000",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "16px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    opacity: (loading || !selectedRate) ? 0.6 : 1,
                                    marginBottom: "16px"
                                }}
                            >
                                {loading ? "Processing..." : paymentMethod === "card" ? "Pay now" : "Complete order"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="desktop-layout" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "60px", alignItems: "start" }}>

                    {/* Left Column - Forms */}
                    <div>
                        <form onSubmit={handleSubmit}>
                            {/* Express Checkout */}
                            <div style={{ marginBottom: "32px" }}>
                                <p style={{ fontSize: "18px", fontWeight: 500, color: "#000", marginBottom: "20px" }}>Express checkout</p>

                                {/* Payment Methods Row */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                                    <button
                                        type="button"
                                        onClick={handlePaystackCheckout}
                                        disabled={loading || cart.items.length === 0 || !selectedRate}
                                        style={{
                                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "16px 20px",
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            opacity: (loading || !selectedRate) ? 0.6 : 1,
                                            transition: "all 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px"
                                        }}
                                    >
                                        <CreditCard size={18} />
                                        Paystack
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBankTransferCheckout}
                                        disabled={loading || cart.items.length === 0 || !selectedRate}
                                        style={{
                                            background: "#000",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "16px 20px",
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            opacity: (loading || !selectedRate) ? 0.6 : 1,
                                            transition: "all 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px"
                                        }}
                                    >
                                        <Banknote size={18} />
                                        Bank Transfer
                                    </button>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
                                    <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e5e5e5" }} />
                                    <span style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>OR</span>
                                    <hr style={{ flex: 1, border: "none", borderTop: "1px solid #e5e5e5" }} />
                                </div>
                            </div>

                            {/* Contact */}
                            <div style={{ marginBottom: "32px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", margin: 0 }}>Contact information</h2>
                                    <Link href="/account/login" style={{ fontSize: "14px", color: "#6366f1", textDecoration: "underline" }}>
                                        Sign in
                                    </Link>
                                </div>

                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        fontSize: "16px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "16px"
                                    }}
                                />

                                <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#666", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={form.newsletter}
                                        onChange={(e) => setForm(f => ({ ...f, newsletter: e.target.checked }))}
                                        style={{ width: "18px", height: "18px" }}
                                    />
                                    Email me with news and offers
                                </label>
                            </div>

                            {/* Delivery */}
                            <div style={{ marginBottom: "32px" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>Delivery information</h2>

                                <select
                                    name="country"
                                    defaultValue="Nigeria"
                                    disabled
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        fontSize: "16px",
                                        background: "#f9f9f9",
                                        marginBottom: "16px",
                                        boxSizing: "border-box"
                                    }}
                                >
                                    <option>Nigeria</option>
                                </select>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                        required
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            fontSize: "16px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        required
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            fontSize: "16px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        fontSize: "16px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "16px"
                                    }}
                                />

                                <input
                                    name="apartment"
                                    value={form.apartment}
                                    onChange={handleChange}
                                    placeholder="Apartment, suite, etc. (optional)"
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        fontSize: "16px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "16px"
                                    }}
                                />

                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        fontSize: "16px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "16px"
                                    }}
                                />

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                    <select
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            fontSize: "16px",
                                            background: "#fff",
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        <option value="">State</option>
                                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <input
                                        name="postalCode"
                                        value={form.postalCode}
                                        onChange={handleChange}
                                        placeholder="Postal code"
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            fontSize: "16px",
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <input
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone"
                                    required
                                    style={{
                                        width: "100%",
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "8px",
                                        padding: "16px",
                                        fontSize: "16px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        marginBottom: "16px"
                                    }}
                                />

                                <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#666", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={form.textUpdates}
                                        onChange={(e) => setForm(f => ({ ...f, textUpdates: e.target.checked }))}
                                        style={{ width: "18px", height: "18px" }}
                                    />
                                    Text me with news and offers
                                </label>
                            </div>

                            {/* Shipping Method */}
                            <div id="shipping-section-desktop" style={{ marginBottom: "32px" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>Shipping method</h2>

                                {!form.city || !form.state ? (
                                    <div style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "20px", fontSize: "16px", color: "#666", textAlign: "center" }}>
                                        Enter your delivery address to see shipping options
                                    </div>
                                ) : ratesLoading ? (
                                    <div style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "20px" }}>
                                        <div style={{ height: "60px", background: "#e5e5e5", borderRadius: "6px", animation: "pulse 1.5s ease infinite" }} />
                                        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
                                    </div>
                                ) : rates.length === 0 ? (
                                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "20px", fontSize: "16px", color: "#dc2626" }}>
                                        No shipping options available for this address
                                    </div>
                                ) : (
                                    <div style={{ border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden" }}>
                                        {rates.map((rate, index) => {
                                            const selected = selectedRate?.rate_id === rate.rate_id;
                                            return (
                                                <label
                                                    key={rate.rate_id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        padding: "20px",
                                                        cursor: "pointer",
                                                        borderTop: index > 0 ? "1px solid #e5e5e5" : "none",
                                                        background: selected ? "#f0f9ff" : "#fff",
                                                        transition: "background-color 0.2s"
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="shipping"
                                                        checked={selected}
                                                        onChange={() => setSelectedRate(rate)}
                                                        style={{ marginRight: "16px", width: "18px", height: "18px" }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <span style={{ fontSize: "16px", fontWeight: 500 }}>{rate.carrier_name}</span>
                                                            <span style={{ fontSize: "16px", fontWeight: 600 }}>{formatPrice(rate.amount)}</span>
                                                        </div>
                                                        <p style={{ fontSize: "14px", color: "#666", margin: "4px 0 0 0" }}>{rate.delivery_time}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Payment */}
                            <div style={{ marginBottom: "32px" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>Payment method</h2>
                                <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>All transactions are secure and encrypted.</p>

                                {/* Payment Method Selection */}
                                <div style={{ border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "20px",
                                            cursor: "pointer",
                                            background: paymentMethod === "card" ? "#f0f9ff" : "#fff",
                                            borderBottom: "1px solid #e5e5e5",
                                            transition: "background-color 0.2s"
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === "card"}
                                            onChange={() => setPaymentMethod("card")}
                                            style={{ marginRight: "16px", width: "18px", height: "18px" }}
                                        />
                                        <CreditCard size={20} style={{ marginRight: "12px" }} />
                                        <span style={{ fontSize: "16px", fontWeight: 500 }}>Credit card</span>
                                        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                                            <div style={{ background: "#1a1f71", color: "#fff", padding: "3px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: 600 }}>VISA</div>
                                            <div style={{ background: "#eb001b", color: "#fff", padding: "3px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: 600 }}>MC</div>
                                            <div style={{ fontSize: "12px", color: "#666" }}>+5</div>
                                        </div>
                                    </label>
                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "20px",
                                            cursor: "pointer",
                                            background: paymentMethod === "bank_transfer" ? "#f0f9ff" : "#fff",
                                            transition: "background-color 0.2s"
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === "bank_transfer"}
                                            onChange={() => setPaymentMethod("bank_transfer")}
                                            style={{ marginRight: "16px", width: "18px", height: "18px" }}
                                        />
                                        <Banknote size={20} style={{ marginRight: "12px" }} />
                                        <span style={{ fontSize: "16px", fontWeight: 500 }}>Bank transfer</span>
                                    </label>
                                </div>

                                {paymentMethod === "bank_transfer" && (
                                    <div style={{ background: "#fef7ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
                                        <p style={{ fontSize: "14px", color: "#7c3aed", margin: 0 }}>
                                            After clicking "Complete order", you will be redirected to view your order details and bank account information for payment.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || cart.items.length === 0 || !selectedRate}
                                style={{
                                    width: "100%",
                                    background: "#000",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    opacity: (loading || !selectedRate) ? 0.6 : 1,
                                    transition: "all 0.2s"
                                }}
                            >
                                {loading ? "Processing..." : paymentMethod === "card" ? "Pay now" : "Complete order"}
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div style={{ position: "sticky", top: "40px" }}>
                        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "32px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "24px" }}>Order summary</h2>

                            {/* Items */}
                            <div style={{ marginBottom: "24px" }}>
                                {cart.items.map((item) => (
                                    <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                                        <div style={{ position: "relative", width: "80px", height: "80px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                                            <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                                            <div style={{ position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", borderRadius: "50%", background: "#666", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600 }}>
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: "16px", fontWeight: 500, color: "#000", marginBottom: "6px" }}>{item.name}</p>
                                            {item.size && <p style={{ fontSize: "14px", color: "#666", marginBottom: "6px" }}>Size: {item.size}</p>}
                                            <p style={{ fontSize: "16px", fontWeight: 600, color: "#000" }}>{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code */}
                            <div style={{ marginBottom: "24px" }}>
                                {promoCode ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "16px", borderRadius: "8px" }}>
                                        <span style={{ fontSize: "14px", color: "#0369a1", fontWeight: 500 }}>✓ {promoCode} applied</span>
                                        <button onClick={removePromo} type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#666" }}>×</button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                                            placeholder="Discount code or gift card"
                                            style={{ flex: 1, border: "1px solid #d9d9d9", borderRadius: "8px", padding: "16px", fontSize: "16px", outline: "none" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={applyPromo}
                                            disabled={promoLoading}
                                            style={{ background: "#000", color: "#fff", border: "none", borderRadius: "8px", padding: "16px 20px", fontSize: "16px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", opacity: promoLoading ? 0.6 : 1 }}
                                        >
                                            {promoLoading ? "..." : "Apply"}
                                        </button>
                                    </div>
                                )}
                                {promoError && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "8px" }}>{promoError}</p>}
                            </div>

                            {/* Totals */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "16px" }}>
                                    <span style={{ color: "#666" }}>Subtotal</span>
                                    <span>{formatPrice(cart.subtotal)}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "16px" }}>
                                        <span style={{ color: "#10b981" }}>Discount</span>
                                        <span style={{ color: "#10b981" }}>-{formatPrice(promoDiscount)}</span>
                                    </div>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "16px" }}>
                                    <span style={{ color: "#666" }}>Shipping</span>
                                    <span>{shippingDisplay ?? "Calculated at next step"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "2px solid #e5e5e5", fontSize: "20px", fontWeight: 600 }}>
                                    <span>Total</span>
                                    <span>NGN {formatPrice(Math.max(0, total))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}