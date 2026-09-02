"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SUB_NAV, SOCIAL_LINKS } from "@/lib/config";
import { getCurrentUser, logoutUser, type User } from "@/lib/auth";
import { getWishlistCount } from "@/lib/wishlist";
import { cartCount, getCart } from "@/lib/cart";
import { useCurrency, CURRENCIES } from "@/lib/currency";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onBagClick?: () => void;
    onSearchOpen?: () => void;
}

export default function MobileMenu({ isOpen, onClose, onBagClick, onSearchOpen }: MobileMenuProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [bagCount, setBagCount] = useState(0);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const { currency, setCurrency } = useCurrency();

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
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

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
                width: "100%",
                background: "#fff",
                zIndex: 200,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                animation: "mobileMenuIn .28s cubic-bezier(.4,0,.2,1) forwards",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
            }}>

                {/* -- Top bar -- */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    position: "sticky", top: 0, background: "#fff", zIndex: 2,
                }}>
                    <Link href="/" onClick={onClose}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/missus-logo.webp" alt="Missus" style={{ height: "42px", width: "auto" }} />
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

                    {/* -- Search  opens the same overlay as desktop -- */}
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
                        <button
                            onClick={() => { onClose(); setTimeout(() => onSearchOpen?.(), 50); }}
                            aria-label="Open search"
                            style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                width: "100%", border: "1.5px solid #e0e0e0",
                                borderRadius: "4px", padding: "10px 14px",
                                background: "#f8f8f8", cursor: "text", textAlign: "left",
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <span style={{ fontSize: "13px", color: "#aaa", fontFamily: "'Barlow', sans-serif" }}>
                                Search for dresses, tops, sets
                            </span>
                        </button>
                    </div>

                    {/* -- Account row -- */}
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

                    {/* -- Bag + Wishlist -- */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f0f0f0" }}>
                        <button
                            onClick={() => { onClose(); onBagClick?.(); }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", background: "none", border: "none", borderRight: "1px solid #f0f0f0", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#000", position: "relative" }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M19.5 8.25H16.5V7.75C16.5 6.55653 16.0259 5.41193 15.182 4.56802C14.3381 3.72411 13.1935 3.25 12 3.25C10.8065 3.25 9.66193 3.72411 8.81802 4.56802C7.97411 5.41193 7.5 6.55653 7.5 7.75V8.25H4.5C4.16848 8.25 3.85054 8.3817 3.61612 8.61612C3.3817 8.85054 3.25 9.16848 3.25 9.5V18C3.25 18.7293 3.53973 19.4288 4.05546 19.9445C4.57118 20.4603 5.27065 20.75 6 20.75H18C18.7293 20.75 19.4288 20.4603 19.9445 19.9445C20.4603 19.4288 20.75 18.7293 20.75 18V9.5C20.75 9.16848 20.6183 8.85054 20.3839 8.61612C20.1495 8.3817 19.8315 8.25 19.5 8.25ZM9 7.75C9 6.95435 9.31607 6.19129 9.87868 5.62868C10.4413 5.06607 11.2044 4.75 12 4.75C12.7956 4.75 13.5587 5.06607 14.1213 5.62868C14.6839 6.19129 15 6.95435 15 7.75V8.25H9V7.75ZM19.25 18C19.25 18.3315 19.1183 18.6495 18.8839 18.8839C18.6495 19.1183 18.3315 19.25 18 19.25H6C5.66848 19.25 5.35054 19.1183 5.11612 18.8839C4.8817 18.6495 4.75 18.3315 4.75 18V9.75H7.5V12C7.5 12.1989 7.57902 12.3897 7.71967 12.5303C7.86032 12.671 8.05109 12.75 8.25 12.75C8.44891 12.75 8.63968 12.671 8.78033 12.5303C8.92098 12.3897 9 12.1989 9 12V9.75H15V12C15 12.1989 15.079 12.3897 15.2197 12.5303C15.3603 12.671 15.5511 12.75 15.75 12.75C15.9489 12.75 16.1397 12.671 16.2803 12.5303C16.421 12.3897 16.5 12.1989 16.5 12V9.75H19.25V18Z" />
                            </svg>
                            Bag
                            {bagCount > 0 && (
                                <span style={{ background: "#7F0E12", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: "8px", right: "28px" }}>
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
                                <span style={{ background: "#7F0E12", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: "8px", right: "28px" }}>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* -- Currency switcher -- */}
                    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
                        {!currencyOpen ? (
                            <button
                                onClick={() => setCurrencyOpen(true)}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#000",
                                }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    Currency
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#555" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".06em" }}>{currency}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                                </span>
                            </button>
                        ) : (
                            <div style={{ padding: "12px 20px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                    <span style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#aaa" }}>Select Currency</span>
                                    <button onClick={() => setCurrencyOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "20px", lineHeight: 1, padding: 0 }}>×</button>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {CURRENCIES.map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: "9px 12px",
                                                border: `1.5px solid ${currency === c.code ? "#000" : "#e0e0e0"}`,
                                                background: currency === c.code ? "#000" : "#fff",
                                                color: currency === c.code ? "#fff" : "#333",
                                                borderRadius: "2px", cursor: "pointer",
                                                fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontSize: "12px", fontWeight: 600,
                                            }}
                                        >
                                            <span>{c.code}</span>
                                            <span style={{ opacity: .6, fontSize: "11px" }}>{c.symbol}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* -- Navigation -- */}
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
                                    color: link.sale ? "#7F0E12" : "#000",
                                    textDecoration: "none",
                                    borderBottom: "1px solid #f5f5f5",
                                    transition: "background .1s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <span>
                                    {link.hot && (
                                        <span style={{ marginRight: "6px", verticalAlign: "middle", fontSize: "15px" }}>🔥</span>
                                    )}
                                    {link.label}
                                </span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3, flexShrink: 0 }}>
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        ))}
                    </nav>

                    {/* -- Help links -- */}
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
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "#444", padding: "11px 0", textDecoration: "none", borderBottom: "1px solid #f5f5f5" }}
                            >
                                {link.label}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3, flexShrink: 0 }}>
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        ))}
                    </div>

                    {/* -- Social -- */}
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

                    {/* -- Trust bar -- */}
                    <div style={{ margin: "20px 20px 0", padding: "14px 16px", background: "#f5f5f5" }}>
                        <p style={{ fontSize: "12px", color: "#555", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                            Lagos 12 hour delivery
                        </p>
                        <p style={{ fontSize: "12px", color: "#555", display: "flex", alignItems: "center", gap: "6px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Free shipping over ?150,000
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
