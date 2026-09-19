"use client";

import { useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";

const PRESETS = [10000, 25000, 50000, 100000, 150000];
// Matches the current WordPress gift-card product price range (10,000–150,000 NGN).
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 150000;
const money = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
interface GiftProduct { id: number; name: string; slug: string; image: string; }

export default function GiftCardsPage() {
    const [product, setProduct] = useState<GiftProduct | null>(null);
    const [amount, setAmount] = useState(25000);
    const [custom, setCustom] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [added, setAdded] = useState(false);
    useEffect(() => {
        fetch("/api/gift-card/product", { cache: "no-store" }).then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error); return data; }).then(setProduct).catch((e) => setError(e instanceof Error ? e.message : "Gift cards are temporarily unavailable.")).finally(() => setLoading(false));
    }, []);
    const customValue = Number(custom.replace(/[^0-9]/g, ""));
    const selectedAmount = custom ? customValue : amount;
    const validAmount = Number.isInteger(selectedAmount) && selectedAmount >= MIN_AMOUNT && selectedAmount <= MAX_AMOUNT;
    const addGiftCard = () => {
        if (!product || !validAmount) return;
        addToCart({ productId: product.id, name: `${product.name} — ${money(selectedAmount)}`, slug: product.slug, image: product.image, price: selectedAmount, regularPrice: selectedAmount, quantity: 1, stockStatus: "instock" });
        window.dispatchEvent(new Event("cart-updated"));
        window.dispatchEvent(new Event("open-cart-drawer"));
        setAdded(true);
    };
    return <div style={{ minHeight: "60vh", padding: "60px 20px" }}><div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "16px", fontFamily: "var(--font-display, 'DM Sans', sans-serif)" }}>Gift Cards</h1>
        <p style={{ fontSize: "16px", color: "#666", margin: "0 auto 40px", maxWidth: "600px" }}>Give the perfect gift of fashion choice. Choose any amount and we’ll deliver your digital gift card instantly.</p>
        {loading ? <p style={{ color: "#666" }}>Loading gift card options…</p> : error ? <p role="alert" style={{ color: "#7F0E12" }}>{error}</p> : <div style={{ maxWidth: "560px", margin: "0 auto 40px", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "30px 20px", background: "#fff" }}>
            <h2 style={{ fontSize: "28px", margin: "0 0 22px" }}>{money(selectedAmount || 0)}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "8px", marginBottom: "18px" }}>{PRESETS.map((value) => <button key={value} type="button" onClick={() => { setAmount(value); setCustom(""); setAdded(false); }} style={{ padding: "12px 6px", border: `1.5px solid ${!custom && amount === value ? "#7F0E12" : "#ddd"}`, background: !custom && amount === value ? "#fff7f7" : "#fff", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>{money(value)}</button>)}</div>
            <label style={{ display: "block", textAlign: "left", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Choose another amount</label>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}><span style={{ paddingLeft: "12px", color: "#555" }}>₦</span><input inputMode="numeric" value={custom} onChange={(e) => { setCustom(e.target.value.replace(/[^0-9]/g, "")); setAdded(false); }} placeholder="Enter amount" style={{ flex: 1, border: 0, padding: "12px 8px", fontSize: "15px", outline: "none" }} /></div>
            <p style={{ textAlign: "left", fontSize: "11px", color: validAmount ? "#777" : "#7F0E12", margin: "0 0 18px" }}>Enter between {money(MIN_AMOUNT)} and {money(MAX_AMOUNT)}.</p>
            <button type="button" disabled={!validAmount} onClick={addGiftCard} style={{ width: "100%", background: !validAmount ? "#ccc" : (added ? "#2d7a2d" : "#7F0E12"), color: "#fff", border: 0, padding: "14px 24px", borderRadius: "25px", fontSize: "14px", fontWeight: 700, cursor: !validAmount ? "not-allowed" : "pointer" }}>{added ? "Added to Bag ✓" : "Add Gift Card to Bag"}</button>
        </div>}
        <div style={{ background: "#f8f8f8", padding: "30px", borderRadius: "8px", textAlign: "left", maxWidth: "700px", margin: "0 auto" }}><h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>How Gift Cards Work</h3><ul style={{ fontSize: "14px", color: "#555", lineHeight: 1.8, margin: 0, paddingLeft: "20px" }}><li>Choose any amount from ₦1,000 to ₦1,000,000.</li><li>Digital delivery is sent instantly to the recipient email at checkout.</li><li>Use the balance on eligible items across the website.</li><li>Check the balance anytime online.</li></ul></div>
    </div></div>;
}
