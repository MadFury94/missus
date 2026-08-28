"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCart, cartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import MobileMenu from "@/components/layout/MobileMenu";
import SearchOverlay from "@/components/layout/SearchOverlay";

export default function Navbar({ onBagClick }: { onBagClick?: () => void }) {
    const router = useRouter();
    const [bagCount, setBagCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    function handleSearch(q: string) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
    }

    useEffect(() => {
        setBagCount(cartCount(getCart()));
        setWishlistCount(getWishlistCount());
        const onCart = () => setBagCount(cartCount(getCart()));
        const onWishlist = () => setWishlistCount(getWishlistCount());
        window.addEventListener("cart-updated", onCart);
        window.addEventListener("wishlistUpdated", onWishlist);
        return () => {
            window.removeEventListener("cart-updated", onCart);
            window.removeEventListener("wishlistUpdated", onWishlist);
        };
    }, []);

    return (
        <>
            <style>{`
                .nav-gender { display: flex; align-items: center; }
                /* Search trigger — underline style, no box */
                .nav-search-trigger {
                    display: flex; align-items: center; gap: 8px;
                    border: none; border-bottom: 1px solid #ccc;
                    background: none; padding: 4px 0; cursor: pointer;
                    width: 220px; transition: border-color .2s;
                }
                .nav-search-trigger:hover,
                .nav-search-trigger:focus-visible { border-bottom-color: #000; outline: none; }
                .nav-search-trigger span {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 12px; font-weight: 300; letter-spacing: .04em;
                    color: #aaa; flex: 1; text-align: left;
                }
                .nav-label { font-size: 10px; font-weight: 400; letter-spacing: .06em; text-transform: uppercase; }
                .nav-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
                .nav-hamburger:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
                .gender-tab-link { font-family: var(--font-display, 'Cormorant', serif); font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: 0 14px; height: 68px; display: flex; align-items: center; border-bottom: 2px solid transparent; color: #555; white-space: nowrap; transition: border-color .15s, color .15s; }
                .gender-tab-link:hover { border-bottom-color: #000; color: #000; }
                .gender-tab-link:focus-visible { outline: 2px solid #000; outline-offset: -2px; }
                .nav-icon-link:focus-visible { outline: 2px solid #000; outline-offset: 2px; border-radius: 2px; }
                /* Mobile search — flat, borderless, matches brand aesthetic */
                .nav-mobile-search { display: none; padding: 0; border-top: 1px solid #f0f0f0; }
                @media (max-width: 768px) {
                    .nav-gender { display: none; }
                    .nav-search-trigger { display: none; }
                    .nav-label { display: none; }
                    .nav-hamburger { display: flex; align-items: center; justify-content: center; }
                    .nav-mobile-search { display: block; }
                }
            `}</style>

            <div
                style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 100 }}
                data-navbar
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: "68px", position: "relative" }}>

                    {/* Left: nav tabs (desktop) */}
                    <nav className="nav-gender" aria-label="Main navigation">
                        {[
                            { label: "NEW DROPS", href: "/new-in" },
                            { label: "GIFT SHOP", href: "/category/gift-shop" },
                        ].map(({ label, href }) => (
                            <Link key={label} href={href} className="gender-tab-link">
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Center: Logo */}
                    <Link
                        href="/"
                        aria-label="Missus — go to homepage"
                        style={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                            userSelect: "none",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/missus-logo.webp"
                            alt="Missus"
                            style={{ height: "67px", width: "auto", display: "block" }}
                        />
                    </Link>

                    {/* Right: search + icons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
                        {/* Search trigger (desktop) — overlay trigger, not a fake input */}
                        <button
                            className="nav-search-trigger"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Open search"
                            aria-haspopup="dialog"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" aria-hidden="true">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <span>Search…</span>
                        </button>

                        {/* Login */}
                        <Link href="/account" className="nav-icon-link" style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="nav-label">Account</span>
                        </Link>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="nav-icon-link" style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px", position: "relative", textDecoration: "none" }} aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="nav-label" aria-hidden="true">Wishlist</span>
                            {wishlistCount > 0 && (
                                <span aria-hidden="true" style={{ position: "absolute", top: "-6px", right: "-8px", background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Bag — opens drawer instead of navigating */}
                        <button
                            onClick={onBagClick}
                            className="nav-icon-link"
                            aria-label={`Shopping bag${bagCount > 0 ? `, ${bagCount} items` : ""}`}
                            style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px", position: "relative", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            <span className="nav-label" aria-hidden="true">Bag</span>
                            {bagCount > 0 && (
                                <span aria-hidden="true" style={{ position: "absolute", top: "-6px", right: "-8px", background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {bagCount}
                                </span>
                            )}
                        </button>

                        {/* Hamburger (mobile) */}
                        <button
                            className="nav-hamburger"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" aria-hidden="true">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile search bar — flat, full-width, no rounded corners */}
                <div className="nav-mobile-search">
                    <button
                        onClick={() => setSearchOpen(true)}
                        aria-label="Search products"
                        aria-haspopup="dialog"
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            width: "100%", border: "none", borderTop: "1px solid #f0f0f0",
                            padding: "10px 20px", background: "#fff", cursor: "pointer",
                            textAlign: "left",
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" aria-hidden="true" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <span style={{ fontSize: "13px", color: "#bbb", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontWeight: 300, flex: 1, letterSpacing: ".02em" }}>
                            Search…
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile menu — slide-in drawer with body scroll lock */}
            <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} onBagClick={onBagClick} onSearchOpen={() => setSearchOpen(true)} />

            {/* Search overlay */}
            <SearchOverlay
                isOpen={searchOpen}
                inputValue={searchVal}
                onInputChange={setSearchVal}
                onClose={() => { setSearchOpen(false); setSearchVal(""); }}
                onSubmit={(q) => { setSearchOpen(false); setSearchVal(""); handleSearch(q); }}
            />
        </>
    );
}
