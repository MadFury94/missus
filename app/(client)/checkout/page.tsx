"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
        address: "", city: "", state: "", notes: "",
    });

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
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

    const shippingCost = selectedRate?.amount ?? (rates.length > 0 ? null : 0);
    const shippingDisplay = shippingCost === null ? null : shippingCost === 0 ? "FREE" : formatPrice(shippingCost);
    const total = cart.total + (shippingCost ?? 0) - promoDiscount;

    const inputCls: React.CSSProperties = {
        width: "100%", border: "1px solid #ddd", padding: "12px 14px",
        fontSize: "14px", outline: "none", transition: "border .2s",
        fontFamily: "var(--font-barlow, sans-serif)", boxSizing: "border-box",
    };
    const labelCls: React.CSSProperties = {
        display: "block", fontSize: "12px", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: ".04em",
        marginBottom: "8px", color: "#000",
    };

    return (
        <div style={{ background: "#fff", minHeight: "calc(100vh - 200px)" }}>
            <style>{`
                @media (max-width: 900px) {
                    .checkout-grid { grid-template-columns: 1fr !important; }
                    .checkout-summary { position: static !important; }
                    .checkout-form-row { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: "24px", color: "#000" }}>
                    CHECKOUT
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: "32px" }}>

                        {/* ── LEFT: Delivery form ── */}
                        <div>
                            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "20px", color: "#000" }}>
                                DELIVERY INFORMATION
                            </h2>

                            {/* Name row */}
                            <div className="checkout-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                {(["firstName", "lastName"] as const).map((field) => (
                                    <div key={field}>
                                        <label style={labelCls}>{field === "firstName" ? "FIRST NAME" : "LAST NAME"}</label>
                                        <input name={field} value={form[field]} onChange={handleChange} required
                                            style={inputCls}
                                            onFocus={(e) => (e.target.style.borderColor = "#000")}
                                            onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                                    </div>
                                ))}
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={labelCls}>EMAIL ADDRESS</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} required
                                    style={inputCls}
                                    onFocus={(e) => (e.target.style.borderColor = "#000")}
                                    onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                            </div>

                            {/* Phone */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={labelCls}>PHONE NUMBER</label>
                                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                                    placeholder="+2348012345678"
                                    style={inputCls}
                                    onFocus={(e) => (e.target.style.borderColor = "#000")}
                                    onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                            </div>

                            {/* Address */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={labelCls}>DELIVERY ADDRESS</label>
                                <input name="address" value={form.address} onChange={handleChange} required
                                    style={inputCls}
                                    onFocus={(e) => (e.target.style.borderColor = "#000")}
                                    onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                            </div>

                            {/* City + State */}
                            <div className="checkout-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                <div>
                                    <label style={labelCls}>CITY</label>
                                    <input name="city" value={form.city} onChange={handleChange} required
                                        style={inputCls}
                                        onFocus={(e) => (e.target.style.borderColor = "#000")}
                                        onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                                </div>
                                <div>
                                    <label style={labelCls}>STATE</label>
                                    <select name="state" value={form.state} onChange={handleChange} required
                                        style={{ ...inputCls, background: "#fff" }}
                                        onFocus={(e) => (e.target.style.borderColor = "#000")}
                                        onBlur={(e) => (e.target.style.borderColor = "#ddd")}>
                                        <option value="">Select State</option>
                                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* ── Shipping options ── */}
                            <div id="shipping-section" style={{ marginBottom: "24px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                    <label style={labelCls}>SHIPPING METHOD</label>
                                    {ratesLoading && (
                                        <span style={{ fontSize: "11px", color: "#aaa" }}>Fetching rates…</span>
                                    )}
                                </div>

                                {!form.city || !form.state ? (
                                    <div style={{ background: "#f8f8f8", border: "1px solid #e8e8e8", padding: "14px 16px", fontSize: "13px", color: "#aaa" }}>
                                        Enter your city and state to see delivery options
                                    </div>
                                ) : ratesLoading ? (
                                    <div style={{ background: "#f8f8f8", border: "1px solid #e8e8e8", padding: "14px 16px" }}>
                                        {[1, 2].map((i) => (
                                            <div key={i} style={{ height: "56px", background: "#ebebeb", borderRadius: "4px", marginBottom: i < 2 ? "8px" : 0, animation: "pulse 1.5s ease infinite" }} />
                                        ))}
                                        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
                                    </div>
                                ) : rates.length === 0 ? (
                                    <div style={{ background: "#fff5f5", border: "1px solid #fecaca", padding: "14px 16px", fontSize: "13px", color: "#7b1010" }}>
                                        Could not fetch rates for this address. Shipping will be calculated manually.
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {ratesFallback && (
                                            <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>
                                                Estimated rates — live rates unavailable right now
                                            </p>
                                        )}
                                        {rates.map((rate) => {
                                            const selected = selectedRate?.rate_id === rate.rate_id;
                                            return (
                                                <button
                                                    key={rate.rate_id}
                                                    type="button"
                                                    onClick={() => setSelectedRate(rate)}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: "12px",
                                                        padding: "14px 16px",
                                                        border: `2px solid ${selected ? "#000" : "#e0e0e0"}`,
                                                        background: selected ? "#000" : "#fff",
                                                        cursor: "pointer",
                                                        textAlign: "left",
                                                        transition: "all .15s",
                                                    }}
                                                >
                                                    {rate.carrier_logo && (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={rate.carrier_logo} alt="" style={{ width: "32px", height: "32px", objectFit: "contain", flexShrink: 0, filter: selected ? "brightness(0) invert(1)" : "none" }} />
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: "13px", fontWeight: 700, color: selected ? "#fff" : "#000", marginBottom: "2px" }}>
                                                            {rate.carrier_name}
                                                        </p>
                                                        <p style={{ fontSize: "11px", color: selected ? "rgba(255,255,255,.7)" : "#888" }}>
                                                            {rate.delivery_time}
                                                        </p>
                                                    </div>
                                                    <span style={{ fontSize: "15px", fontWeight: 700, color: selected ? "#fff" : "#000", flexShrink: 0 }}>
                                                        {formatPrice(rate.amount)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {rates.length > 0 && !selectedRate && (
                                    <p style={{ fontSize: "12px", color: "#e8002d", marginTop: "6px" }}>
                                        Please select a shipping method to continue
                                    </p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={labelCls}>ORDER NOTES (OPTIONAL)</label>
                                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                                    placeholder="Special delivery instructions..."
                                    style={{ ...inputCls, resize: "vertical" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#000")}
                                    onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                            </div>
                        </div>

                        {/* ── RIGHT: Order summary ── */}
                        <div className="checkout-summary" style={{ background: "#f8f8f8", padding: "24px", height: "fit-content", position: "sticky", top: "80px" }}>
                            <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "18px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: "20px", color: "#000" }}>
                                ORDER SUMMARY
                            </h2>

                            {/* Items */}
                            <div style={{ marginBottom: "20px", maxHeight: "280px", overflowY: "auto" }}>
                                {cart.items.length === 0 ? (
                                    <p style={{ fontSize: "14px", color: "#666", textAlign: "center", padding: "20px 0" }}>
                                        Your cart is empty. <Link href="/shop" style={{ color: "#7F0E12", textDecoration: "underline" }}>Shop now</Link>
                                    </p>
                                ) : (
                                    cart.items.map((item) => (
                                        <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: "12px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e0e0e0" }}>
                                            <div style={{ width: "60px", height: "80px", background: "#fff", position: "relative", flexShrink: 0 }}>
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="60px" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#000", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                                                {item.size && <p style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Size: {item.size}</p>}
                                                <p style={{ fontSize: "12px", color: "#666" }}>Qty: {item.quantity}</p>
                                                <p style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginTop: "4px" }}>{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Promo */}
                            <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e0e0e0" }}>
                                <label style={labelCls}>PROMO / DISCOUNT CODE</label>
                                {promoCode ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0faf4", border: "1px solid #c8e6d4", padding: "10px 14px", borderRadius: "4px" }}>
                                        <span style={{ fontSize: "13px", color: "#007a3d", fontWeight: 600 }}>✓ {promoCode} — {promoLabel}</span>
                                        <button onClick={removePromo} type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#555", lineHeight: 1 }}>×</button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: "flex" }}>
                                            <input type="text" value={promoInput}
                                                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                                                placeholder="Enter code"
                                                style={{ flex: 1, border: "1px solid #ddd", borderRight: "none", padding: "0 12px", height: "44px", fontSize: "13px", outline: "none", textTransform: "uppercase", letterSpacing: ".04em", borderRadius: "999px 0 0 999px", boxSizing: "border-box" }}
                                                onFocus={(e) => (e.target.style.borderColor = "#000")}
                                                onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                                            <button type="button" onClick={applyPromo} disabled={promoLoading}
                                                style={{ background: "#000", color: "#fff", border: "none", borderRadius: "0 999px 999px 0", padding: "0 18px", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", cursor: promoLoading ? "not-allowed" : "pointer", height: "44px", whiteSpace: "nowrap", opacity: promoLoading ? 0.6 : 1 }}>
                                                {promoLoading ? "…" : "Apply"}
                                            </button>
                                        </div>
                                        {promoError && <p style={{ fontSize: "12px", color: "#7F0E12", marginTop: "6px" }}>{promoError}</p>}
                                    </>
                                )}
                            </div>

                            {/* Totals */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                                    <span style={{ color: "#666" }}>Subtotal</span>
                                    <span style={{ fontWeight: 600 }}>{formatPrice(cart.subtotal)}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                                        <span style={{ color: "#007a3d" }}>Promo ({promoCode})</span>
                                        <span style={{ fontWeight: 600, color: "#007a3d" }}>−{formatPrice(promoDiscount)}</span>
                                    </div>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "14px" }}>
                                    <span style={{ color: "#666" }}>
                                        Shipping {selectedRate ? `· ${selectedRate.carrier_name}` : ""}
                                    </span>
                                    <span style={{ fontWeight: 600, color: shippingCost === 0 ? "#007a3d" : "#000" }}>
                                        {shippingDisplay ?? (ratesLoading ? "—" : "Select method")}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "14px", borderTop: "2px solid #000", fontSize: "18px" }}>
                                    <span style={{ fontWeight: 700 }}>Total</span>
                                    <span style={{ fontWeight: 700 }}>{formatPrice(Math.max(0, total))}</span>
                                </div>
                            </div>

                            {/* Pay button */}
                            <button
                                type="submit"
                                disabled={loading || cart.items.length === 0 || (rates.length > 0 && !selectedRate)}
                                style={{
                                    width: "100%", background: "#000", color: "#fff", border: "none",
                                    borderRadius: "999px", padding: "16px", fontSize: "14px", fontWeight: 700,
                                    letterSpacing: ".06em", textTransform: "uppercase",
                                    cursor: "pointer", transition: "background .2s",
                                    fontFamily: "var(--font-barlow-condensed)",
                                    opacity: (loading || (rates.length > 0 && !selectedRate)) ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#333"; }}
                                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#000"; }}
                            >
                                {loading ? "PROCESSING…" : "PAY WITH PAYSTACK"}
                            </button>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px" }}>
                                <span style={{ fontSize: "14px" }}>🔒</span>
                                <span style={{ fontSize: "11px", color: "#666" }}>Secured by Paystack · SSL Encrypted</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
