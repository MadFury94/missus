"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import type { CartItem } from "@/types";

export default function StockNotice({ items, empty, onClose }: {
    items: CartItem[]; empty: boolean; onClose: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (items.length) dialog.current?.showModal();
        else dialog.current?.close();
    }, [items]);
    return <dialog ref={dialog} onCancel={onClose} aria-labelledby="stock-notice-title"
        style={{ margin: "auto", width: "min(440px, calc(100vw - 32px))", maxHeight: "80vh", padding: "28px", border: "none", borderRadius: "12px", color: "#111", background: "#fff" }}>
        <style>{`dialog::backdrop { background: rgba(0,0,0,.55); }`}</style>
        <h2 id="stock-notice-title" style={{ fontSize: "22px", margin: "0 0 16px" }}>Your bag has been updated</h2>
        {items.map((item, index) => <p key={index} style={{ fontSize: "14px", lineHeight: 1.6 }}>
            <strong>{item.name}{[item.size, item.color].filter(Boolean).length ? ` (${[item.size, item.color].filter(Boolean).join(", ")})` : ""}</strong> is out of stock and has been removed from your cart. It has been added to your wishlist.
        </p>)}
        {empty && <p>Your bag is now empty. Your saved items are in your wishlist.</p>}
        <Link href="/wishlist" onClick={onClose} style={{ display: "block", margin: "20px 0", color: "#111", textDecoration: "underline" }}>View your wishlist</Link>
        {empty ? <Link href="/shop" style={{ borderRadius: "999px", display: "block", padding: "14px", background: "#111", color: "white", textAlign: "center" }}>Continue shopping</Link>
            : <button type="button" onClick={onClose} style={{ borderRadius: "999px", width: "100%", padding: "14px", border: 0, background: "#111", color: "white", cursor: "pointer" }}>Continue to checkout</button>}
    </dialog>;
}
