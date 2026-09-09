"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp, CreditCard, Banknote } from "lucide-react";
import type { Cart } from "@/types";
import { getCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import type { ShippingRate } from "@/lib/woocommerce-shipping";
import DynamicTitle from "@/components/layout/DynamicTitle";

const STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara",
];

export default function CheckoutPage() {
    const { convert } = useCurrency();
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
        country: "Nigeria", notes: "", newsletter: false, textUpdates: false,
    });

    // UI state
    const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");

    // Shipping rates state
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState("");
    const [ratesRetry, setRatesRetry] = useState(0);
    const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);


    useEffect(() => {
        const currentCart = getCart();
        setCart(currentCart);

        // Add cart change listener to detect if cart gets modified during checkout
        const handleCartUpdate = () => {
            const updatedCart = getCart();
            const cartChanged = JSON.stringify(updatedCart.items) !== JSON.stringify(currentCart.items);

            if (cartChanged) {
                console.warn("[checkout] Cart contents changed during checkout:", {
                    original: currentCart.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
                    updated: updatedCart.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))
                });

                // Update the cart state but warn user
                setCart(updatedCart);

                // Clear shipping rates to force recalculation
                setRates([]);
                setSelectedRate(null);
            }
        };

        window.addEventListener("cart-updated", handleCartUpdate);
        return () => window.removeEventListener("cart-updated", handleCartUpdate);
    }, []);

    // Invalidate old quotes immediately; ignore responses for an earlier address/cart.
    useEffect(() => {
        const controller = new AbortController();
        setRates([]);
        setSelectedRate(null);
        setRatesError("");
        if (!form.city.trim() || !form.state.trim() || !cart.items.length) {
            setRatesLoading(false);
            return;
        }
        setRatesLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch("/api/shipping/woocommerce-rates", {
                    method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
                    body: JSON.stringify({
                        city: form.city, state: form.state, items: cart.items,
                        address_1: form.address, postcode: form.postalCode, country: form.country,
                        coupon: promoLabel.toLowerCase().includes("gift") ? "" : promoCode
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                if (!controller.signal.aborted) {
                    setRates(data.rates || []);
                    if (data.rates?.length === 1) setSelectedRate(data.rates[0]);
                }
            } catch (error) {
                if (!controller.signal.aborted) setRatesError(error instanceof Error ? error.message : "Shipping options could not be loaded.");
            } finally {
                if (!controller.signal.aborted) setRatesLoading(false);
            }
        }, 600);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [cart.items, form.city, form.state, form.address, form.postalCode, form.country, promoCode, promoLabel, ratesRetry]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        if (["city", "state", "address", "postalCode", "country"].includes(name)) {
            setSelectedRate(null);
            setRates([]);
        }
        setForm(f => ({ ...f, [name]: value }));
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

    const shippingCost = selectedRate?.amount ?? null;
    const shippingDisplay = shippingCost === null ? null : shippingCost === 0 ? "FREE" : convert(shippingCost / 100);
    const shippingCostInNaira = shippingCost ? shippingCost / 100 : 0; // Convert kobo to naira
    const total = cart.total + shippingCostInNaira - promoDiscount;

    async function handlePaystackCheckout() {
        if (!selectedRate || ratesLoading) {
            document.getElementById("shipping-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // Validate cart contents and amounts before payment
        const currentCart = getCart();
        const cartSubtotal = currentCart.subtotal;
        const shippingCost = selectedRate.amount / 100; // Convert kobo to naira
        const expectedTotal = cartSubtotal + shippingCost - promoDiscount;

        // Check if displayed total matches calculated total
        if (Math.abs(total - expectedTotal) > 1) {
            console.error("[checkout] Total mismatch detected:", {
                displayedTotal: total,
                calculatedTotal: expectedTotal,
                cartSubtotal,
                shippingCost,
                promoDiscount,
                difference: total - expectedTotal
            });

            alert(`Payment amount mismatch detected. Please refresh the page and try again.\n\nDisplayed: ₦${total.toLocaleString()}\nExpected: ₦${expectedTotal.toLocaleString()}`);
            return;
        }

        console.log("[checkout] Processing payment with validated amounts:", {
            selectedRate,
            total: expectedTotal,
            cartItems: currentCart.items.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
            shippingCostInNaira: selectedRate.amount / 100
        });

        setLoading(true);
        try {
            const res = await fetch("/api/payment/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    amount: expectedTotal, // Use calculated total, not displayed total
                    metadata: {
                        cart: currentCart.items, // Use current cart, not cached cart
                        shipping: form,
                        promoCode,
                        promoDiscount,
                        selectedRate, // Pass the full rate object
                        giftCardCode: promoCode && promoLabel.toLowerCase().includes("gift") ? promoCode : "",
                        giftCardAmount: promoCode && promoLabel.toLowerCase().includes("gift") ? promoDiscount : 0,
                        // Add validation metadata
                        validationInfo: {
                            cartSubtotal,
                            shippingCost,
                            expectedTotal,
                            timestamp: Date.now()
                        }
                    },
                }),
            });
            const data = await res.json();
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                setRatesError(data.error || "Payment could not be started. Please retry.");
                setSelectedRate(null);
                setRatesRetry(value => value + 1);
                alert(data.error || "Payment could not be started. Please retry.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleBankTransferCheckout() {
        if (!selectedRate || ratesLoading) return;

        // Validate cart contents and amounts (same as Paystack)
        const currentCart = getCart();
        const cartSubtotal = currentCart.subtotal;
        const shippingCost = selectedRate.amount / 100;
        const expectedTotal = cartSubtotal + shippingCost - promoDiscount;

        if (Math.abs(total - expectedTotal) > 1) {
            console.error("[checkout] Bank transfer total mismatch:", {
                displayedTotal: total,
                calculatedTotal: expectedTotal
            });
            alert(`Payment amount mismatch detected. Please refresh the page and try again.`);
            return;
        }

        setLoading(true);
        const orderData = {
            cart: currentCart.items, // Use current cart
            shipping: form,
            promoCode,
            promoDiscount,
            selectedRate,
            total: expectedTotal, // Use calculated total
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
        <>
            <DynamicTitle prefix="Checkout - " enabled={true} />
            <div style={{ background: "#f9f9f9", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
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
                
                /* DM Sans font family override */
                * {
                    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                }
            `}</style>

                {/* Mobile Header & Collapsible Order Summary */}
                <div className="mobile-layout" style={{ background: "#fff", padding: "16px 0", borderBottom: "1px solid #e5e5e5", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <div className="checkout-container" style={{ maxWidth: "480px", margin: "0 auto", padding: "0 24px" }}>
                        {/* Header with security indicator */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <Link href="/" style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
                                <Image src="/missus-logo.webp" alt="MISSUS" width={100} height={32} style={{ height: "auto" }} />
                            </Link>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {/* Security indicator */}
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#000", fontSize: "11px", fontWeight: 500 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z" />
                                        <circle cx="9" cy="9" r="1" />
                                    </svg>
                                    SECURE
                                </div>
                                {/* Cart with better styling */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8f9fa", color: "#374151", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, border: "1px solid #e5e7eb" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M6 9h12l-1.5 10H7.5L6 9z" />
                                        <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                                    </svg>
                                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
                                </div>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                            <div style={{ flex: 1, height: "2px", background: "#000", borderRadius: "1px" }}></div>
                            <span style={{ color: "#000", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px" }}>CHECKOUT</span>
                            <div style={{ flex: 1, height: "2px", background: "#e5e7eb", borderRadius: "1px" }}></div>
                            <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px" }}>PAYMENT</span>
                            <div style={{ flex: 1, height: "2px", background: "#e5e7eb", borderRadius: "1px" }}></div>
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
                                <span style={{ fontSize: "18px", fontWeight: 600 }}>{convert(Math.max(0, total))}</span>
                            </button>

                            {orderSummaryOpen && (
                                <div className="order-summary-content" style={{ borderTop: "1px solid #e5e5e5", padding: "20px", background: "#fafafa" }}>
                                    {/* Items */}
                                    <div style={{ marginBottom: "20px" }}>
                                        {cart.items.map((item) => (
                                            <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: "12px", marginBottom: "16px", position: "relative" }}>
                                                <div style={{ position: "relative", width: "60px", height: "60px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                                                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="60px" />
                                                </div>
                                                <div style={{
                                                    position: "absolute",
                                                    top: "-8px",
                                                    right: "auto",
                                                    left: "52px",
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%",
                                                    background: "#1a1a1a",
                                                    color: "#ffffff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    fontWeight: 700,
                                                    border: "2px solid #ffffff",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                                                    zIndex: 100,
                                                    lineHeight: "1",
                                                    fontFamily: "'DM Sans', sans-serif"
                                                }}>
                                                    {item.quantity}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#000", marginBottom: "4px" }}>{item.name}</p>
                                                    {item.size && <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Size: {item.size}</p>}
                                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>{convert(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Promo Code */}
                                    <div style={{ marginBottom: "20px" }}>
                                        {promoCode ? (
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "12px 16px", borderRadius: "6px" }}>
                                                <span style={{ fontSize: "13px", color: "#0369a1", fontWeight: 500 }}>✓ {promoCode} applied</span>
                                                <button onClick={removePromo} type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#666" }}>X</button>
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
                                                    style={{ background: "#000", color: "#fff", border: "none", borderRadius: "25px", padding: "12px 16px", fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", opacity: promoLoading ? 0.6 : 1 }}
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
                                            <span>{convert(cart.subtotal)}</span>
                                        </div>
                                        {promoDiscount > 0 && (
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                                <span style={{ color: "#000" }}>Discount</span>
                                                <span style={{ color: "#000" }}>-{convert(promoDiscount)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
                                            <span style={{ color: "#666" }}>Shipping</span>
                                            <span>{shippingDisplay ?? "Calculated at next step"}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #e5e5e5", fontSize: "16px", fontWeight: 600 }}>
                                            <span>Total</span>
                                            <span>{convert(Math.max(0, total))}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="desktop-layout" style={{ background: "#fff", padding: "20px 0", borderBottom: "1px solid #e5e5e5", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
                        {/* Header row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                            <Link href="/" style={{ display: "flex", alignItems: "center", padding: "12px 0" }}>
                                <Image src="/missus-logo.webp" alt="MISSUS" width={120} height={40} style={{ height: "auto" }} />
                            </Link>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                {/* Security indicator */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#000", fontSize: "12px", fontWeight: 600 }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z" />
                                        <circle cx="9" cy="9" r="1" />
                                    </svg>
                                    SECURE CHECKOUT
                                </div>
                                {/* Cart */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8f9fa", color: "#374151", padding: "10px 16px", borderRadius: "25px", fontSize: "14px", fontWeight: 600, border: "1px solid #e5e7eb" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M6 9h12l-1.5 10H7.5L6 9z" />
                                        <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                                    </svg>
                                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
                                </div>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ flex: 1, height: "3px", background: "#000", borderRadius: "2px" }}></div>
                            <span style={{ color: "#000", fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px" }}>INFORMATION</span>
                            <div style={{ flex: 1, height: "3px", background: "#e5e7eb", borderRadius: "2px" }}></div>
                            <span style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px" }}>PAYMENT</span>
                            <div style={{ flex: 1, height: "3px", background: "#e5e7eb", borderRadius: "2px" }}></div>
                            <span style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px" }}>COMPLETE</span>
                            <div style={{ flex: 1, height: "3px", background: "#e5e7eb", borderRadius: "2px" }}></div>
                        </div>
                    </div>
                </div>

                {/* Mobile Checkout Form */}
                <div className="mobile-layout">
                    <div className="checkout-container" style={{ maxWidth: "480px", margin: "0 auto", padding: "0 24px 60px", background: "#f8f9fa", minHeight: "100vh" }}>
                        <div className="checkout-form" style={{ background: "transparent", borderRadius: "0", padding: "24px 0", marginTop: "0", border: "none" }}>

                            <form onSubmit={handleSubmit}>
                                {/* Contact */}
                                <div style={{ marginBottom: "24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#000", margin: 0 }}>Contact</h2>
                                        <Link href="/account/login" style={{ fontSize: "14px", color: "#6366f1", textDecoration: "underline" }}>
                                            Sign in
                                        </Link>
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "12px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.email ? "-6px" : "50%",
                                            transform: form.email ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 4px",
                                            fontSize: form.email ? "11px" : "14px",
                                            color: form.email ? "#6366f1" : "#666",
                                            fontWeight: form.email ? 500 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Email address
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "14px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease",
                                                background: "#fff",
                                                fontFamily: "'DM Sans', sans-serif"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

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

                                    <div style={{ position: "relative", marginBottom: "12px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: "-6px",
                                            background: "#fff",
                                            padding: "0 4px",
                                            fontSize: "11px",
                                            color: "#666",
                                            fontWeight: 500,
                                            zIndex: 1
                                        }}>
                                            Country
                                        </label>
                                        <select
                                            name="country"
                                            value={form.country || "Nigeria"}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "14px",
                                                background: "#fff",
                                                boxSizing: "border-box",
                                                color: "#000",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        >
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="Ghana">Ghana</option>
                                            <option value="Kenya">Kenya</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                        </select>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.firstName ? "-6px" : "50%",
                                                transform: form.firstName ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 4px",
                                                fontSize: form.firstName ? "11px" : "14px",
                                                color: form.firstName ? "#6366f1" : "#666",
                                                fontWeight: form.firstName ? 500 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                First name
                                            </label>
                                            <input
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "14px",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            />
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.lastName ? "-6px" : "50%",
                                                transform: form.lastName ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 4px",
                                                fontSize: form.lastName ? "11px" : "14px",
                                                color: form.lastName ? "#6366f1" : "#666",
                                                fontWeight: form.lastName ? 500 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                Last name
                                            </label>
                                            <input
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "14px",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "12px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.address ? "-6px" : "50%",
                                            transform: form.address ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 4px",
                                            fontSize: form.address ? "11px" : "14px",
                                            color: form.address ? "#6366f1" : "#666",
                                            fontWeight: form.address ? 500 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Address
                                        </label>
                                        <input
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "14px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "12px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.apartment ? "-6px" : "50%",
                                            transform: form.apartment ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 4px",
                                            fontSize: form.apartment ? "11px" : "14px",
                                            color: form.apartment ? "#6366f1" : "#666",
                                            fontWeight: form.apartment ? 500 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Apartment, suite, etc. (optional)
                                        </label>
                                        <input
                                            name="apartment"
                                            value={form.apartment}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "14px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "12px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.city ? "-6px" : "50%",
                                            transform: form.city ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 4px",
                                            fontSize: form.city ? "11px" : "14px",
                                            color: form.city ? "#6366f1" : "#666",
                                            fontWeight: form.city ? 500 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            City
                                        </label>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "14px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.state ? "-6px" : "50%",
                                                transform: form.state ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 4px",
                                                fontSize: form.state ? "11px" : "14px",
                                                color: form.state ? "#6366f1" : "#666",
                                                fontWeight: form.state ? 500 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                State
                                            </label>
                                            <select
                                                name="state"
                                                value={form.state}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "14px",
                                                    background: "#fff",
                                                    boxSizing: "border-box",
                                                    outline: "none",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            >
                                                <option value=""></option>
                                                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.postalCode ? "-6px" : "50%",
                                                transform: form.postalCode ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 4px",
                                                fontSize: form.postalCode ? "11px" : "14px",
                                                color: form.postalCode ? "#6366f1" : "#666",
                                                fontWeight: form.postalCode ? 500 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                Postal code
                                            </label>
                                            <input
                                                name="postalCode"
                                                value={form.postalCode}
                                                onChange={handleChange}
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "14px",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "12px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.phone ? "-6px" : "50%",
                                            transform: form.phone ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 4px",
                                            fontSize: form.phone ? "11px" : "14px",
                                            color: form.phone ? "#6366f1" : "#666",
                                            fontWeight: form.phone ? 500 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Phone
                                        </label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "14px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

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
                                            {ratesError || "No shipping options available for this address"}
                                            <button type="button" onClick={() => setRatesRetry(value => value + 1)} style={{ marginLeft: "8px", textDecoration: "underline" }}>Retry</button>
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
                                                                <span style={{ fontSize: "14px", fontWeight: 600 }}>{convert(rate.amount / 100)}</span>
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
                                            <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
                                                {/* Visa */}
                                                <div style={{
                                                    background: "#fff",
                                                    border: "1px solid #e5e5e5",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    height: "24px"
                                                }}>
                                                    <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
                                                        <path d="M13.3 8.7L15.1 1.3h2.8L16.1 8.7h-2.8zM23.1 1.3l-2.7 7.4h-2.8l1.4-7.4h2.8l.3 3.7L22.8 1.3h.3zM8.2 1.3L5.7 7.1 5.2 4.5 4.4 1.7c-.1-.4-.4-.4-.7-.4H0l0 .2c.7.1 1.4.4 1.9.7l2.3 6.2h2.9L10.9 1.3H8.2zM26.8 1.3c-.5 0-.9.3-1.1.7l-4.1 6.7h2.9l.6-1.6h3.6l.3 1.6h2.6L29.3 1.3h-2.5zm.4 2.1l.9 2.5h-2.3l1.4-2.5z" fill="#1434CB" />
                                                    </svg>
                                                </div>

                                                {/* Mastercard */}
                                                <div style={{
                                                    background: "#fff",
                                                    border: "1px solid #e5e5e5",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    height: "24px"
                                                }}>
                                                    <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                                                        <circle cx="7" cy="7" r="7" fill="#EB001B" />
                                                        <circle cx="17" cy="7" r="7" fill="#F79E1B" fillOpacity="0.8" />
                                                        <path d="M12 2.8c1.3 1.2 2.1 2.9 2.1 4.7s-.8 3.5-2.1 4.7c-1.3-1.2-2.1-2.9-2.1-4.7s.8-3.5 2.1-4.7z" fill="#FF5F00" />
                                                    </svg>
                                                </div>

                                                {/* Verve */}
                                                <div style={{
                                                    background: "#fff",
                                                    border: "1px solid #e5e5e5",
                                                    borderRadius: "4px",
                                                    padding: "4px 6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    height: "24px"
                                                }}>
                                                    <span style={{ color: "#00425A", fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px" }}>VERVE</span>
                                                </div>

                                                <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>& more</span>
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
                                    disabled={loading || ratesLoading || cart.items.length === 0 || !selectedRate}
                                    style={{
                                        width: "100%",
                                        background: "#000",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "25px", // Oval shape
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
                <div className="desktop-layout" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px", background: "#f8f9fa", minHeight: "100vh" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "80px", alignItems: "start" }}>

                        {/* Left Column - Forms */}
                        <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", border: "1px solid #e5e5e5", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                            <form onSubmit={handleSubmit}>
                                {/* Contact */}
                                <div style={{
                                    marginBottom: "40px",
                                    background: "#fff",
                                    border: "1px solid #e5e5e5",
                                    borderRadius: "12px",
                                    padding: "32px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                                        <div>
                                            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#000", margin: "0 0 4px 0" }}>Contact information</h2>
                                            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>We'll use this to send you order updates</p>
                                        </div>
                                        <Link
                                            href="/account/login"
                                            style={{
                                                fontSize: "13px",
                                                color: "#6366f1",
                                                textDecoration: "none",
                                                fontWeight: 500,
                                                padding: "8px 16px",
                                                border: "1px solid #6366f1",
                                                borderRadius: "6px",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            Sign in
                                        </Link>
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "20px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.email ? "-8px" : "50%",
                                            transform: form.email ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 6px",
                                            fontSize: form.email ? "12px" : "16px",
                                            color: form.email ? "#6366f1" : "#666",
                                            fontWeight: form.email ? 600 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Email address
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px 50px 16px 16px",
                                                fontSize: "16px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s",
                                                fontFamily: "'DM Sans', sans-serif"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                        <div style={{
                                            position: "absolute",
                                            top: "0",
                                            right: "12px",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            color: "#000"
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z" />
                                                <circle cx="9" cy="9" r="1" />
                                            </svg>
                                        </div>
                                    </div>

                                    <label style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                        fontSize: "14px",
                                        color: "#666",
                                        cursor: "pointer",
                                        padding: "8px 0"
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={form.newsletter}
                                            onChange={(e) => setForm(f => ({ ...f, newsletter: e.target.checked }))}
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                marginTop: "2px",
                                                accentColor: "#6366f1"
                                            }}
                                        />
                                        <span>Email me with news and exclusive offers</span>
                                    </label>
                                </div>

                                {/* Delivery */}
                                <div style={{ marginBottom: "32px" }}>
                                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>Delivery information</h2>

                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: "-8px",
                                            background: "#fff",
                                            padding: "0 6px",
                                            fontSize: "12px",
                                            color: "#666",
                                            fontWeight: 500,
                                            zIndex: 1
                                        }}>
                                            Country
                                        </label>
                                        <select
                                            name="country"
                                            value={form.country || "Nigeria"}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "16px",
                                                background: "#fff",
                                                boxSizing: "border-box",
                                                color: "#000",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        >
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="Ghana">Ghana</option>
                                            <option value="Kenya">Kenya</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                        </select>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.firstName ? "-8px" : "50%",
                                                transform: form.firstName ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 6px",
                                                fontSize: form.firstName ? "12px" : "16px",
                                                color: form.firstName ? "#6366f1" : "#666",
                                                fontWeight: form.firstName ? 600 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                First name
                                            </label>
                                            <input
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "16px",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            />
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.lastName ? "-8px" : "50%",
                                                transform: form.lastName ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 6px",
                                                fontSize: form.lastName ? "12px" : "16px",
                                                color: form.lastName ? "#6366f1" : "#666",
                                                fontWeight: form.lastName ? 600 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                Last name
                                            </label>
                                            <input
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "16px",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.address ? "-8px" : "50%",
                                            transform: form.address ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 6px",
                                            fontSize: form.address ? "12px" : "16px",
                                            color: form.address ? "#6366f1" : "#666",
                                            fontWeight: form.address ? 600 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Address
                                        </label>
                                        <input
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "16px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.apartment ? "-8px" : "50%",
                                            transform: form.apartment ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 6px",
                                            fontSize: form.apartment ? "12px" : "16px",
                                            color: form.apartment ? "#6366f1" : "#666",
                                            fontWeight: form.apartment ? 600 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Apartment, suite, etc. (optional)
                                        </label>
                                        <input
                                            name="apartment"
                                            value={form.apartment}
                                            onChange={handleChange}
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "16px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.city ? "-8px" : "50%",
                                            transform: form.city ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 6px",
                                            fontSize: form.city ? "12px" : "16px",
                                            color: form.city ? "#6366f1" : "#666",
                                            fontWeight: form.city ? 600 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            City
                                        </label>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "16px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.state ? "-8px" : "50%",
                                                transform: form.state ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 6px",
                                                fontSize: form.state ? "12px" : "16px",
                                                color: form.state ? "#6366f1" : "#666",
                                                fontWeight: form.state ? 600 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                State
                                            </label>
                                            <select
                                                name="state"
                                                value={form.state}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "16px",
                                                    background: "#fff",
                                                    boxSizing: "border-box",
                                                    outline: "none",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            >
                                                <option value=""></option>
                                                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <label style={{
                                                position: "absolute",
                                                left: "16px",
                                                top: form.postalCode ? "-8px" : "50%",
                                                transform: form.postalCode ? "translateY(0)" : "translateY(-50%)",
                                                background: "#fff",
                                                padding: "0 6px",
                                                fontSize: form.postalCode ? "12px" : "16px",
                                                color: form.postalCode ? "#6366f1" : "#666",
                                                fontWeight: form.postalCode ? 600 : 400,
                                                transition: "all 0.2s ease",
                                                pointerEvents: "none",
                                                zIndex: 1
                                            }}>
                                                Postal code
                                            </label>
                                            <input
                                                name="postalCode"
                                                value={form.postalCode}
                                                onChange={handleChange}
                                                style={{
                                                    width: "100%",
                                                    border: "2px solid #e5e5e5",
                                                    borderRadius: "8px",
                                                    padding: "16px",
                                                    fontSize: "16px",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                    transition: "border-color 0.2s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#6366f1";
                                                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = "#e5e5e5";
                                                    e.target.style.boxShadow = "none";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ position: "relative", marginBottom: "16px" }}>
                                        <label style={{
                                            position: "absolute",
                                            left: "16px",
                                            top: form.phone ? "-8px" : "50%",
                                            transform: form.phone ? "translateY(0)" : "translateY(-50%)",
                                            background: "#fff",
                                            padding: "0 6px",
                                            fontSize: form.phone ? "12px" : "16px",
                                            color: form.phone ? "#6366f1" : "#666",
                                            fontWeight: form.phone ? 600 : 400,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                            zIndex: 1
                                        }}>
                                            Phone
                                        </label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: "100%",
                                                border: "2px solid #e5e5e5",
                                                borderRadius: "8px",
                                                padding: "16px",
                                                fontSize: "16px",
                                                outline: "none",
                                                boxSizing: "border-box",
                                                transition: "border-color 0.2s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#6366f1";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "#e5e5e5";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

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
                                            {ratesError || "No shipping options available for this address"}
                                            <button type="button" onClick={() => setRatesRetry(value => value + 1)} style={{ marginLeft: "8px", textDecoration: "underline" }}>Retry</button>
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
                                                                <span style={{ fontSize: "16px", fontWeight: 600 }}>{convert(rate.amount / 100)}</span>
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
                                            <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
                                                {/* Visa */}
                                                <div style={{
                                                    background: "#fff",
                                                    border: "1px solid #e5e5e5",
                                                    borderRadius: "4px",
                                                    padding: "6px 10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    height: "28px"
                                                }}>
                                                    <svg width="36" height="12" viewBox="0 0 32 10" fill="none">
                                                        <path d="M13.3 8.7L15.1 1.3h2.8L16.1 8.7h-2.8zM23.1 1.3l-2.7 7.4h-2.8l1.4-7.4h2.8l.3 3.7L22.8 1.3h.3zM8.2 1.3L5.7 7.1 5.2 4.5 4.4 1.7c-.1-.4-.4-.4-.7-.4H0l0 .2c.7.1 1.4.4 1.9.7l2.3 6.2h2.9L10.9 1.3H8.2zM26.8 1.3c-.5 0-.9.3-1.1.7l-4.1 6.7h2.9l.6-1.6h3.6l.3 1.6h2.6L29.3 1.3h-2.5zm.4 2.1l.9 2.5h-2.3l1.4-2.5z" fill="#1434CB" />
                                                    </svg>
                                                </div>

                                                {/* Mastercard */}
                                                <div style={{
                                                    background: "#fff",
                                                    border: "1px solid #e5e5e5",
                                                    borderRadius: "4px",
                                                    padding: "6px 10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    height: "28px"
                                                }}>
                                                    <svg width="28" height="16" viewBox="0 0 24 14" fill="none">
                                                        <circle cx="7" cy="7" r="7" fill="#EB001B" />
                                                        <circle cx="17" cy="7" r="7" fill="#F79E1B" fillOpacity="0.8" />
                                                        <path d="M12 2.8c1.3 1.2 2.1 2.9 2.1 4.7s-.8 3.5-2.1 4.7c-1.3-1.2-2.1-2.9-2.1-4.7s.8-3.5 2.1-4.7z" fill="#FF5F00" />
                                                    </svg>
                                                </div>

                                                {/* Verve */}
                                                <div style={{
                                                    background: "#fff",
                                                    border: "1px solid #e5e5e5",
                                                    borderRadius: "4px",
                                                    padding: "6px 8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    height: "28px"
                                                }}>
                                                    <span style={{ color: "#00425A", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>VERVE</span>
                                                </div>

                                                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>& more</span>
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
                                    disabled={loading || ratesLoading || cart.items.length === 0 || !selectedRate}
                                    style={{
                                        width: "100%",
                                        background: "#000",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "25px", // Oval shape
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
                            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                                    <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#000", margin: 0 }}>Order summary</h2>
                                    <div style={{ background: "#f3f4f6", color: "#374151", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                                        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                                    </div>
                                </div>

                                {/* Items */}
                                <div style={{ marginBottom: "24px" }}>
                                    {cart.items.map((item) => (
                                        <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: "16px", marginBottom: "20px", position: "relative" }}>
                                            <div style={{ position: "relative", width: "80px", height: "80px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                                            </div>
                                            <div style={{
                                                position: "absolute",
                                                top: "-10px",
                                                right: "auto",
                                                left: "70px",
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "50%",
                                                background: "#1a1a1a",
                                                color: "#ffffff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "14px",
                                                fontWeight: 700,
                                                border: "3px solid #ffffff",
                                                boxShadow: "0 3px 10px rgba(0,0,0,0.4)",
                                                zIndex: 100,
                                                lineHeight: "1",
                                                fontFamily: "'DM Sans', sans-serif"
                                            }}>
                                                {item.quantity}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: "16px", fontWeight: 500, color: "#000", marginBottom: "6px" }}>{item.name}</p>
                                                {item.size && <p style={{ fontSize: "14px", color: "#666", marginBottom: "6px" }}>Size: {item.size}</p>}
                                                <p style={{ fontSize: "16px", fontWeight: 600, color: "#000" }}>{convert(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Promo Code */}
                                <div style={{ marginBottom: "24px" }}>
                                    {promoCode ? (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "16px", borderRadius: "8px" }}>
                                            <span style={{ fontSize: "14px", color: "#0369a1", fontWeight: 500 }}>✓ {promoCode} applied</span>
                                            <button onClick={removePromo} type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#666" }}>X</button>
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
                                        <span>{convert(cart.subtotal)}</span>
                                    </div>
                                    {promoDiscount > 0 && (
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "16px" }}>
                                            <span style={{ color: "#000" }}>Discount</span>
                                            <span style={{ color: "#000" }}>-{convert(promoDiscount)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "16px" }}>
                                        <span style={{ color: "#666" }}>Shipping</span>
                                        <span>{shippingDisplay ?? "Calculated at next step"}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "2px solid #e5e5e5", fontSize: "20px", fontWeight: 600 }}>
                                        <span>Total</span>
                                        <span>{convert(Math.max(0, total))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust & Security Footer */}
                <div style={{
                    background: "#fff",
                    borderTop: "1px solid #e5e5e5",
                    padding: "32px 0",
                    marginTop: "40px"
                }}>
                    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "32px",
                            textAlign: "center"
                        }}>
                            {/* Security */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#000",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "4px"
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z" />
                                        <circle cx="9" cy="9" r="1" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#000", margin: 0 }}>SSL SECURED</h3>
                                <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>Your payment info is safe</p>
                            </div>

                            {/* Fast Shipping */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#000",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "4px"
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                        <rect x="1" y="3" width="15" height="13" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#000", margin: 0 }}>FAST DELIVERY</h3>
                                <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>2-5 business days</p>
                            </div>

                            {/* Customer Support */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "#000",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "4px"
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#000", margin: 0 }}>24/7 SUPPORT</h3>
                                <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>We're here to help</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
