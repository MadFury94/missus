"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SUB_NAV, SOCIAL_LINKS } from "@/lib/config";
import { getCurrentUser, logoutUser, type User } from "@/lib/auth";
import { getWishlistCount } from "@/lib/wishlist";
import { cartCount, getCart } from "@/lib/cart";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onBagClick?: () => void;
}

export default function MobileMenu({ isOpen, onClose, onBagClick }: MobileMenuProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [bagCount, setBagCount] = useState(0);
    const [search, setSearch] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setUser(getCurrentUser());
        setWishlistCount(getWishlistCount());
        setBagCount(cartCount(getCart()));
        const syncWishlist = () => setWishlistCount(getWishlistCount());
        const syncCart = () => setBagCount(cartCount(getCart()));
        window.addEventListener("wishlistUpdated", syncWishlist);
        window.addEventListener("cart-updated", syncCart);
        return () => {
            window.removeEventListener("wishlistUpdated", syncWishlist);
            window.removeEventListener("cart-updated", syncCart);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            // Focus search input after animation
            setTimeout(() => searchRef.current?.focus(), 300);
        } else {
            document.body.style.overflow = "";
            setSearch("");
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const q = search.trim();
        if (!q) return;
        onClose();
        router.push(`/search?q=${encodeURIComponent(q)}`);
    }

    function handleLogout() {
        logoutUser();
        setUser(null);
        onClose();
        router.push("/");
    }

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    zIndex: 199,
                    backdropFilter: "blur(2px)",
                }}
            />

            {/* Drawer */}
            <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "min(88vw, 360px)",
                background: "#fff",
                zIndex: 200,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                animation: "mobileMenuIn .28s cubic-bezier(.4,0,.2,1) forwards",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
            }}>

                {/* ── Top bar ── */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    position: "sticky", top: 0, background: "#fff", zIndex: 2,
                }}>
                    <Link href="/" onClick={onClose}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/missus-logo.webp" alt="Missus" style={{ height: "30px", width: "auto" }} />
                    </Link>
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#000" }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div style={{ flex: 1, padding: "0 0 32px" }}>

                    {/* ── Search ── */}
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
                        <form onSubmit={handleSearch} style={{ display: "flex", border: "1.5px solid #000", height: "42px" }}>
                            <input
                                ref={searchRef}
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search women's clothing"
                                style={{ flex: 1, border: "none", outline: "none", padding: "0 14px", fontFamily: "'Barlow', sans-serif", fontSize: "13px", background: "#fff" }}
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                style={{ width: "44px", background: "#000", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* ── Account row ── */}
                    <div style={{ padding: "12px 20px 0", borderBottom: "1px solid #f0f0f0" }}>
                        {user ? (
                            <div style={{ paddingBottom: "12px" }}>
                                <p style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginBottom: "8px" }}>Signed in as</p>
                                <p style={{ fontSize: "14px", fontWeight: 700, color: "#000", marginBottom: "12px" }}>{user.displayName || user.email}</p>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <Link href="/account" onClick={onClose} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        My Account
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        style={{ padding: "9px 14px", border: "1.5px solid #e0e0e0", background: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", color: "#555" }}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", gap: "8px", paddingBottom: "12px" }}>
                                <Link href="/account/login" onClick={onClose} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", background: "#000", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    Sign In
                                </Link>
                                <Link href="/account/register" onClick={onClose} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", border: "1.5px solid #000", color: "#000", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ── Bag + Wishlist ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f0f0f0" }}>
                        <button
                            onClick={() => { onClose(); onBagClick?.(); }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", background: "none", border: "none", borderRight: "1px solid #f0f0f0", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#000", position: "relative" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            Bag
                            {bagCount > 0 && (
                                <span style={{ background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: "8px", right: "28px" }}>
                                    {bagCount}
                                </span>
                            )}
                        </button>
                        <Link
                            href="/wishlist"
                            onClick={onClose}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#000", textDecoration: "none", position: "relative" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            Wishlist
                            {wishlistCount > 0 && (
                                <span style={{ background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: "8px", right: "28px" }}>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* ── Navigation ── */}
                    <nav style={{ paddingTop: "8px" }}>
                        {SUB_NAV.map((link) => (
                            <Link
                                key={link.href + link.label}
                                href={link.href}
                                onClick={onClose}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "13px 20px",
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    letterSpacing: ".06em",
                                    textTransform: "uppercase",
                                    color: link.sale ? "#e8002d" : link.hot ? "#e8002d" : "#000",
                                    textDecoration: "none",
                                    borderBottom: "1px solid #f5f5f5",
                                    transition: "background .1s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <span>
                                    {link.hot && (
                                        <span style={{ background: "#e8002d", color: "#fff", fontSize: "8px", fontWeight: 700, letterSpacing: ".06em", padding: "2px 5px", marginRight: "6px", verticalAlign: "middle" }}>
                                            HOT
                                        </span>
                                    )}
                                    {link.label}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3, flexShrink: 0 }}>
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        ))}
                    </nav>

                    {/* ── Help links ── */}
                    <div style={{ padding: "20px 20px 0", borderTop: "1px solid #f0f0f0", marginTop: "8px" }}>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa", marginBottom: "10px" }}>Help</p>
                        {[
                            { label: "Contact Us", href: "/contact" },
                            { label: "Track My Order", href: "/account" },
                            { label: "Returns", href: "/returns" },
                            { label: "Size Guide", href: "/size-guide" },
                            { label: "FAQ", href: "/faq" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose}
                                style={{ display: "block", fontSize: "13px", color: "#555", padding: "6px 0", textDecoration: "none", borderBottom: "1px solid #f5f5f5" }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* ── Social ── */}
                    <div style={{ padding: "20px 20px 0" }}>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#aaa", marginBottom: "12px" }}>Follow Us</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {[
                                { href: SOCIAL_LINKS.instagram, label: "Instagram", icon: <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
                                { href: SOCIAL_LINKS.tiktok, label: "TikTok", icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" /></svg> },
                                { href: SOCIAL_LINKS.whatsapp, label: "WhatsApp", icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg> },
                            ].map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    style={{ width: "38px", height: "38px", border: "1.5px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", textDecoration: "none" }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Trust bar ── */}
                    <div style={{ margin: "20px 20px 0", padding: "14px 16px", background: "#f5f5f5" }}>
                        <p style={{ fontSize: "12px", color: "#555", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                            Lagos 1–2 hour delivery
                        </p>
                        <p style={{ fontSize: "12px", color: "#555", display: "flex", alignItems: "center", gap: "6px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Free shipping over ₦150,000
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes mobileMenuIn {
                    from { transform: translateX(100%); opacity: 0.6; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </>
    );
}
