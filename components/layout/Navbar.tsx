"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SITE_NAME, TOP_NAV } from "@/lib/config";
import { getCart, cartCount } from "@/lib/cart";

export default function Navbar() {
    const [bagCount, setBagCount] = useState(0);

    useEffect(() => {
        setBagCount(cartCount(getCart()));
        const handler = () => setBagCount(cartCount(getCart()));
        window.addEventListener("cart-updated", handler);
        return () => window.removeEventListener("cart-updated", handler);
    }, []);

    return (
        <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: "52px" }}>

                {/* Left: gender tabs */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    {TOP_NAV.map((item) => (
                        <Link key={item.href} href={item.href} style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "13px", fontWeight: 700, letterSpacing: ".08em",
                            textTransform: "uppercase", padding: "0 14px", height: "52px",
                            display: "flex", alignItems: "center", borderBottom: "3px solid transparent",
                            color: "#555", position: "relative", whiteSpace: "nowrap",
                        }}
                            className="gender-tab"
                        >
                            {item.label}
                            {item.isNew && (
                                <span style={{ position: "absolute", top: "8px", right: "2px", background: "#e8002d", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 4px", borderRadius: "2px", letterSpacing: ".05em" }}>NEW</span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Center: Logo */}
                <Link href="/" style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "30px", fontWeight: 900, letterSpacing: ".04em",
                    textTransform: "uppercase", color: "#000", textAlign: "center",
                    position: "absolute", left: "50%", transform: "translateX(-50%)",
                    userSelect: "none",
                }}>
                    {SITE_NAME}<span style={{ color: "#e8002d" }}>.</span>
                </Link>

                {/* Right: search + icons */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    {/* Search bar */}
                    <form action="/search" method="get" style={{ display: "flex", border: "1.5px solid #000", height: "36px", overflow: "hidden", maxWidth: "340px" }}>
                        <input name="q" type="text" placeholder="Search women's clothing" style={{ flex: 1, border: "none", outline: "none", fontFamily: "'Barlow', sans-serif", fontSize: "13px", padding: "0 12px", background: "#fff" }} />
                        <button type="submit" style={{ background: "#000", border: "none", width: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        </button>
                    </form>

                    <Link href="/account/login" style={{ background: "none", border: "none", color: "#000", display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Login
                    </Link>

                    <Link href="/wishlist" style={{ background: "none", border: "none", color: "#000", display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        Wishlist
                    </Link>

                    <Link href="/cart" style={{ background: "none", border: "none", color: "#000", display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", position: "relative" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                        Bag
                        {bagCount > 0 && (
                            <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {bagCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            <style>{`
        .gender-tab:hover { border-bottom-color: #000 !important; color: #000 !important; }
      `}</style>
        </div>
    );
}
