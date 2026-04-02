"use client";
import { useEffect, useState } from "react";
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

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-10">
            <h1 className="font-display text-3xl font-bold text-secondary uppercase mb-8">Checkout</h1>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Delivery form */}
                    <div className="lg:col-span-2 space-y-5">
                        <h2 className="font-bold text-secondary uppercase tracking-widest text-sm">Delivery Information</h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { name: "firstName", label: "First Name" },
                                { name: "lastName", label: "Last Name" },
                            ].map((f) => (
                                <div key={f.name}>
                                    <label className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-1.5">{f.label}</label>
                                    <input
                                        name={f.name}
                                        value={form[f.name as keyof typeof form]}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-secondary/20 px-4 py-3 text-sm outline-none focus:border-secondary transition-colors"
                                    />
                                </div>
                            ))}
                        </div>

                        {[
                            { name: "email", label: "Email Address", type: "email" },
                            { name: "phone", label: "Phone Number", type: "tel" },
                            { name: "address", label: "Delivery Address" },
                        ].map((f) => (
                            <div key={f.name}>
                                <label className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-1.5">{f.label}</label>
                                <input
                                    name={f.name}
                                    type={f.type ?? "text"}
                                    value={form[f.name as keyof typeof form]}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-secondary/20 px-4 py-3 text-sm outline-none focus:border-secondary transition-colors"
                                />
                            </div>
                        ))}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-1.5">City</label>
                                <input name="city" value={form.city} onChange={handleChange} required className="w-full border border-secondary/20 px-4 py-3 text-sm outline-none focus:border-secondary" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-1.5">State</label>
                                <select name="state" value={form.state} onChange={handleChange} required className="w-full border border-secondary/20 px-4 py-3 text-sm outline-none focus:border-secondary bg-white">
                                    <option value="">Select State</option>
                                    {["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Benin City", "Kaduna"].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-1.5">Order Notes (optional)</label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-secondary/20 px-4 py-3 text-sm outline-none focus:border-secondary resize-none" />
                        </div>
                    </div>

                    {/* Order summary */}
                    <div className="bg-muted p-6 h-fit">
                        <h2 className="font-bold text-secondary uppercase tracking-widest text-sm mb-6">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            {cart.items.map((item) => (
                                <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                                    <span className="text-secondary/70 line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                                    <span className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <div className="border-t border-secondary/10 pt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-secondary/60">Subtotal</span>
                                    <span>{formatPrice(cart.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary/60">Shipping</span>
                                    <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base border-t border-secondary/10 pt-2">
                                    <span>Total</span>
                                    <span>{formatPrice(cart.total + shipping)}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || cart.items.length === 0}
                            className="w-full bg-secondary text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-secondary/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : "Pay with Paystack"}
                        </button>
                        <p className="text-xs text-secondary/40 text-center mt-3">🔒 Secured by Paystack</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
