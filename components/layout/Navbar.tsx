"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SITE_NAME, SUB_NAV } from "@/lib/config";
import { getCart, cartCount } from "@/lib/cart";

export default function Navbar() {
    const [bagCount, setBagCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setBagCount(cartCount(getCart()));
        const handler = () => setBagCount(cartCount(getCart()));
        window.addEventListener("cart-updated", handler);
        return () => window.removeEventListener("cart-updated", handler);
    }, []);

    return (
        <>
            <style>{`
        .nav-gender { display: flex; align-items: center; }
        .nav-search-wrap { display: flex; border: 1.5px solid #000; height: 36px; overflow: hidden; max-width: 280px; flex: 1; }
        .nav-search-wrap input { flex: 1; border: none; outline: none; font-family: 'Barlow', sans-serif; font-size: 13px; padding: 0 12px; background: #fff; }
        .nav-search-wrap button { background: #000; border: none; width: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .nav-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
        .nav-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: #fff; z-index: 200; overflow-y: auto; padding: 20px; }
        .mobile-menu.open { display: block; }
        .gender-tab-link { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 0 14px; height: 52px; display: flex; align-items: center; border-bottom: 3px solid transparent; color: #555; white-space: nowrap; transition: border-color .15s, color .15s; }
        .gender-tab-link:hover { border-bottom-color: #000; color: #000; }
        @media (max-width: 768px) {
          .nav-gender { display: none; }
          .nav-search-wrap { display: none; }
          .nav-label { display: none; }
          .nav-hamburger { display: flex; align-items: center; justify-content: center; }
        }
      `}</style>

            <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: "52px", position: "relative" }}>

                    {/* Left: gender tabs (desktop) */}
                    <nav className="nav-gender">
                        {["WOMEN", "CURVE+", "NEW DROPS", "GIFT SHOP"].map((label, i) => (
                            <Link key={i} href={i === 2 ? "/category/whats-new" : i === 3 ? "/category/gift-shop" : "/shop"} className="gender-tab-link">
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Center: Logo */}
                    <Link href="/" style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900,
                        letterSpacing: ".04em", textTransform: "uppercase", color: "#000",
                        position: "absolute", left: "50%", transform: "translateX(-50%)", userSelect: "none",
                    }}>
                        {SITE_NAME}<span style={{ color: "#e8002d" }}>.</span>
                    </Link>

                    {/* Right: search + icons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
                        {/* Search (desktop) */}
                        <form action="/search" method="get" className="nav-search-wrap">
                            <input name="q" type="text" placeholder="Search women's clothing" />
                            <button type="submit" aria-label="Search">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </button>
                        </form>

                        {/* Login */}
                        <Link href="/account/login" style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="nav-label">Login</span>
                        </Link>

                        {/* Wishlist */}
                        <Link href="/wishlist" style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="nav-label">Wishlist</span>
                        </Link>

                        {/* Bag */}
                        <Link href="/cart" style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px", position: "relative" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            <span className="nav-label">Bag</span>
                            {bagCount > 0 && (
                                <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {bagCount}
                                </span>
                            )}
                        </Link>

                        {/* Hamburger (mobile) */}
                        <button className="nav-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu drawer */}
            <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <Link href="/" onClick={() => setMobileOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "24px", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase" }}>
                        {SITE_NAME}<span style={{ color: "#e8002d" }}>.</span>
                    </Link>
                    <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
                </div>

                {/* Mobile search */}
                <form action="/search" method="get" style={{ display: "flex", border: "1.5px solid #000", height: "44px", marginBottom: "24px" }}>
                    <input name="q" type="text" placeholder="Search..." style={{ flex: 1, border: "none", outline: "none", padding: "0 14px", fontFamily: "'Barlow', sans-serif", fontSize: "14px" }} />
                    <button type="submit" style={{ background: "#000", border: "none", width: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    </button>
                </form>

                {/* Mobile nav links */}
                <nav>
                    {SUB_NAV.map((link) => (
                        <Link key={link.href + link.label} href={link.href} onClick={() => setMobileOpen(false)} style={{
                            display: "block", padding: "14px 0", borderBottom: "1px solid #f0f0f0",
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 700,
                            letterSpacing: ".06em", textTransform: "uppercase",
                            color: link.sale ? "#e8002d" : "#000",
                        }}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
                    <Link href="/account/login" onClick={() => setMobileOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000" }}>
                        Login
                    </Link>
                    <Link href="/wishlist" onClick={() => setMobileOpen(false)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#000" }}>
                        Wishlist
                    </Link>
                </div>
            </div>
        </>
    );
}
