"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IS_DEMO_STORE } from "@/lib/store-config";
import { useCurrency } from "@/lib/currency";
import type { CartItem } from "@/types";

type Receipt = { reference: string; items: CartItem[]; subtotal: number; discount: number; shipping: number; total: number; deliveryMethod: string };

export default function DemoSuccessPage() {
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [ready, setReady] = useState(false);
    const { convert } = useCurrency();
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("wearlux_demo_receipt");
            const value = raw ? JSON.parse(raw) : null;
            if (IS_DEMO_STORE && value?.status === "demo" && Array.isArray(value.items)) setReceipt(value);
        } catch { /* A missing receipt is a normal empty state. */ }
        setReady(true);
    }, []);
    return <main style={{ maxWidth: 640, margin: "60px auto", padding: 24 }}>
        <Link href="/" style={{ letterSpacing: 4, fontSize: 24 }}>WEARLUX</Link>
        <h1 style={{ fontSize: 32, margin: "32px 0 16px" }}>{!ready ? "Loading receipt…" : receipt ? "Demo order complete" : "No demo order yet"}</h1>
        <p>No payment has been taken. This is a sample order and will not be fulfilled or emailed.</p>
        {receipt && <>
            <p style={{ margin: "24px 0", overflowWrap: "anywhere" }}>Reference: {receipt.reference}</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {receipt.items.map((item, index) => <li key={index} style={{ padding: "16px 0", borderBottom: "1px solid #ddd" }}>
                    <strong>{item.name}</strong><br />{item.size} · {item.color} · Qty {item.quantity}<br />{convert(item.price * item.quantity)}
                </li>)}
            </ul>
            <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, margin: "24px 0" }}>
                <dt>Subtotal</dt><dd>{convert(receipt.subtotal)}</dd>
                <dt>Discount</dt><dd>−{convert(receipt.discount)}</dd>
                <dt>{receipt.deliveryMethod}</dt><dd>{convert(receipt.shipping)}</dd>
                <dt><strong>Demo total</strong></dt><dd><strong>{convert(receipt.total)}</strong></dd>
            </dl>
            <p style={{ marginBottom: 24 }}>Your bag is now empty. This receipt is available in this browser tab until the tab is closed.</p>
        </>}
        <Link href="/shop" style={{ display: "inline-block", marginTop: 24, padding: "14px 24px", background: "#111", color: "white", borderRadius: 28 }}>Continue shopping</Link>
    </main>;
}
