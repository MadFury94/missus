"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCart, cartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import MobileMenu from "@/components/layout/MobileMenu";

export default function Navbar({ onBagClick }: { onBagClick?: () => void }) {
    const router = useRouter();
    const [bagCount, setBagCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const q = searchVal.trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
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
                .nav-search-wrap { display: flex; border: 1.5px solid #000; height: 36px; overflow: hidden; max-width: 280px; flex: 1; }
                .nav-search-wrap input { flex: 1; border: none; outline: none; font-family: 'Barlow', sans-serif; font-size: 13px; padding: 0 12px; background: #fff; }
                .nav-search-wrap input:focus { outline: 2px solid #000; outline-offset: -2px; }
                .nav-search-wrap button { background: #000; border: none; width: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .nav-search-wrap button:focus-visible { outline: 2px solid #e8002d; outline-offset: 2px; }
                .nav-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
                .nav-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
                .nav-hamburger:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
                .gender-tab-link { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 0 14px; height: 52px; display: flex; align-items: center; border-bottom: 3px solid transparent; color: #555; white-space: nowrap; transition: border-color .15s, color .15s; }
                .gender-tab-link:hover { border-bottom-color: #000; color: #000; }
                .gender-tab-link:focus-visible { outline: 2px solid #000; outline-offset: -2px; }
                .nav-icon-link:focus-visible { outline: 2px solid #000; outline-offset: 2px; border-radius: 2px; }
                @media (max-width: 768px) {
                    .nav-gender { display: none; }
                    .nav-search-wrap { display: none; }
                    .nav-label { display: none; }
                    .nav-hamburger { display: flex; align-items: center; justify-content: center; }
                }
            `}</style>

            <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: "52px", position: "relative" }}>

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
                            style={{ height: "45px", width: "auto", display: "block" }}
                        />
                    </Link>

                    {/* Right: search + icons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
                        {/* Search (desktop) */}
                        <form onSubmit={handleSearch} className="nav-search-wrap" role="search">
                            <input
                                name="q"
                                type="search"
                                placeholder="Search women's clothing"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                aria-label="Search products"
                            />
                            <button type="submit" aria-label="Submit search">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </button>
                        </form>

                        {/* Login */}
                        <Link href="/account" className="nav-icon-link" style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="nav-label">Account</span>
                        </Link>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="nav-icon-link" style={{ color: "#000", display: "flex", alignItems: "center", gap: "5px", position: "relative", textDecoration: "none" }} aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
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
            </div>

            {/* Mobile menu — slide-in drawer with body scroll lock */}
            <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} onBagClick={onBagClick} />
        </>
    );
}
