"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCart, cartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import MobileMenu from "@/components/layout/MobileMenu";
import SearchOverlay from "@/components/layout/SearchOverlay";
import { useCurrency, CURRENCIES } from "@/lib/currency";

// ── Currency & Region modal ────────────────────────────────────────────────

const CURRENCY_REGIONS: { code: string; flag: string; name: string; recommended?: boolean }[] = [
    { code: "NGN", flag: "NG", name: "Nigeria", recommended: true },
    { code: "USD", flag: "US", name: "United States" },
    { code: "GBP", flag: "GB", name: "United Kingdom" },
    { code: "EUR", flag: "EU", name: "Europe" },
    { code: "CAD", flag: "CA", name: "Canada" },
    { code: "GHS", flag: "GH", name: "Ghana" },
    { code: "KES", flag: "KE", name: "Kenya" },
    { code: "ZAR", flag: "ZA", name: "South Africa" },
];

function CurrencyModal({
    currency,
    setCurrency,
    onClose,
}: {
    currency: string;
    setCurrency: (code: string) => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => searchRef.current?.focus(), 60);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const q = search.trim().toLowerCase();
    const filtered = CURRENCY_REGIONS.filter((r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.flag.toLowerCase().includes(q)
    );

    const symbolFor = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol ?? code;

    return (
        <>
            <style>{`
                .cur-backdrop {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,.52);
                    z-index: 700;
                    display: flex; align-items: center; justify-content: center;
                    animation: curFadeIn .18s ease forwards;
                }
                @keyframes curFadeIn { from { opacity: 0; } to { opacity: 1; } }
                .cur-modal {
                    background: #fff;
                    width: 100%; max-width: 460px;
                    max-height: 85vh;
                    display: flex; flex-direction: column;
                    border-radius: 2px;
                    animation: curSlideUp .2s ease forwards;
                    margin: 16px;
                    overflow: hidden;
                }
                @keyframes curSlideUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cur-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 22px 24px 18px;
                    border-bottom: 1px solid #ebebeb;
                    flex-shrink: 0;
                }
                .cur-title {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 13px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
                    color: #111;
                }
                .cur-close {
                    background: none; border: none; cursor: pointer; padding: 4px;
                    display: flex; align-items: center; color: #555;
                    transition: color .15s;
                }
                .cur-close:hover { color: #000; }
                .cur-close:focus-visible { outline: 2px solid #000; outline-offset: 2px; border-radius: 2px; }
                .cur-body { overflow-y: auto; flex: 1; }
                .cur-body::-webkit-scrollbar { width: 4px; }
                .cur-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
                .cur-section-label {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
                    color: #888; padding: 20px 24px 10px;
                }
                .cur-lang-list { padding: 0 24px 8px; }
                .cur-lang-opt {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 11px 0;
                    border: none; border-bottom: 1px solid #f2f2f2;
                    background: none; cursor: default;
                    width: 100%; text-align: left;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 14px; color: #222; font-weight: 600;
                }
                .cur-check {
                    width: 22px; height: 22px; border-radius: 50%;
                    background: #111; display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .cur-search-wrap {
                    margin: 6px 24px 8px;
                    border: 1px solid #ddd;
                    display: flex; align-items: center; gap: 8px;
                    padding: 9px 12px; border-radius: 2px;
                }
                .cur-search-wrap:focus-within { border-color: #999; }
                .cur-search-input {
                    border: none; outline: none; flex: 1;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 13px; color: #222; background: none;
                }
                .cur-search-input::placeholder { color: #aaa; }
                .cur-opt {
                    display: flex; align-items: center;
                    padding: 13px 24px;
                    background: none; border: none; border-bottom: 1px solid #f4f4f4;
                    cursor: pointer; width: 100%; text-align: left; gap: 10px;
                    transition: background .1s;
                }
                .cur-opt:last-child { border-bottom: none; }
                .cur-opt:hover { background: #fafafa; }
                .cur-opt-flag {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 11px; font-weight: 700; letter-spacing: .06em;
                    color: #777; min-width: 26px; flex-shrink: 0;
                }
                .cur-opt-info { display: flex; flex-direction: column; flex: 1; min-width: 0; text-align: left; }
                .cur-opt-name {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 13px; color: #222;
                }
                .cur-opt-rec {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 11px; color: #888; margin-top: 2px;
                }
                .cur-opt-code {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 12px; color: #888; letter-spacing: .04em;
                    padding-right: 10px; flex-shrink: 0;
                }
                .cur-opt.cur-opt-active .cur-opt-name { font-weight: 600; color: #111; }
                .cur-opt.cur-opt-active .cur-opt-code { color: #111; font-weight: 600; }
                .cur-no-results {
                    padding: 20px 24px;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 13px; color: #999;
                }
                @media (max-width: 600px) {
                    .cur-modal { max-height: 92vh; margin: 0; border-radius: 0; align-self: flex-end; }
                    .cur-backdrop { align-items: flex-end; }
                }
            `}</style>

            <div
                className="cur-backdrop"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-label="Select currency and region"
            >
                <div className="cur-modal" onClick={(e) => e.stopPropagation()}>

                    {/* Header */}
                    <div className="cur-header">
                        <span className="cur-title">Your Currency and Region</span>
                        <button className="cur-close" onClick={onClose} aria-label="Close">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="cur-body">

                        {/* Language */}
                        <div className="cur-section-label">Select Language</div>
                        <div className="cur-lang-list">
                            <div className="cur-lang-opt">
                                <span>English</span>
                                <span className="cur-check" aria-hidden="true">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        {/* Region / Currency */}
                        <div className="cur-section-label">Select Region/Currency</div>

                        {/* Search */}
                        <div className="cur-search-wrap">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" aria-hidden="true">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                ref={searchRef}
                                className="cur-search-input"
                                type="text"
                                placeholder="Search for currency or region"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                aria-label="Search currency or region"
                            />
                        </div>

                        {/* List */}
                        <div role="listbox" aria-label="Currencies">
                            {filtered.map((r) => {
                                const isActive = currency === r.code;
                                const sym = symbolFor(r.code);
                                return (
                                    <button
                                        key={r.code}
                                        className={`cur-opt${isActive ? " cur-opt-active" : ""}`}
                                        onClick={() => { setCurrency(r.code); onClose(); }}
                                        role="option"
                                        aria-selected={isActive}
                                    >
                                        <span className="cur-opt-flag">{r.flag}</span>
                                        <span className="cur-opt-info">
                                            <span className="cur-opt-name">
                                                {r.name}{r.recommended ? " (Recommended)" : ""}
                                            </span>
                                            {isActive && (
                                                <span className="cur-opt-rec">
                                                    Your order will be billed in {r.code} {sym}.
                                                </span>
                                            )}
                                        </span>
                                        <span className="cur-opt-code">{r.code} {sym}</span>
                                        {isActive && (
                                            <span className="cur-check" aria-hidden="true">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            {filtered.length === 0 && (
                                <p className="cur-no-results">No results for &ldquo;{search}&rdquo;</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Navbar ─────────────────────────────────────────────────────────────────

export default function Navbar({ onBagClick, annHeight = 34 }: { onBagClick?: () => void; annHeight?: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const isHome = pathname === "/";

    const [bagCount, setBagCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);

    const { currency, setCurrency } = useCurrency();

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

    useEffect(() => {
        if (!isHome) { setScrolled(true); return; }
        setScrolled(window.scrollY > annHeight + 10);
        const onScroll = () => setScrolled(window.scrollY > annHeight + 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isHome, annHeight]);

    // Lock body scroll when currency modal is open
    useEffect(() => {
        document.body.style.overflow = currencyOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [currencyOpen]);

    const transparent = isHome && !scrolled;
    const iconColor = transparent ? "#fff" : "#000";
    const borderColor = transparent ? "rgba(255,255,255,.15)" : "#e0e0e0";
    const bg = transparent ? "transparent" : "#fff";

    return (
        <>
            <style>{`
                .nav-gender { display: flex; align-items: center; }
                .nav-search-trigger {
                    display: flex; align-items: center; gap: 8px;
                    border: none; border-bottom: 1px solid ${transparent ? "rgba(255,255,255,.4)" : "#ccc"};
                    background: none; padding: 4px 0; cursor: pointer;
                    width: 200px; transition: border-color .2s;
                }
                .nav-search-trigger:hover { border-bottom-color: ${transparent ? "#fff" : "#000"}; outline: none; }
                .nav-search-trigger span {
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    font-size: 12px; font-weight: 300; letter-spacing: .04em;
                    color: ${transparent ? "rgba(255,255,255,.6)" : "#aaa"}; flex: 1; text-align: left;
                }
                .nav-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
                .nav-hamburger:focus-visible { outline: 2px solid ${iconColor}; outline-offset: 2px; }
                .gender-tab-link {
                    font-family: var(--font-display, 'Cormorant', serif);
                    font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
                    padding: 0 14px; height: 52px; display: flex; align-items: center;
                    border-bottom: 2px solid transparent;
                    color: ${transparent ? "rgba(255,255,255,.9)" : "#555"};
                    white-space: nowrap; transition: border-color .15s, color .3s;
                }
                .gender-tab-link:hover { border-bottom-color: ${transparent ? "#fff" : "#000"}; color: ${transparent ? "#fff" : "#000"}; }
                .nav-icon-link:focus-visible { outline: 2px solid ${iconColor}; outline-offset: 2px; border-radius: 2px; }
                @media (max-width: 768px) {
                    .nav-gender { display: none; }
                    .nav-search-trigger { display: none; }
                    .nav-hamburger { display: flex; align-items: center; justify-content: center; }
                    .currency-btn-desktop { display: none !important; }
                }
            `}</style>

            <div
                style={{ background: bg, borderBottom: `1px solid ${borderColor}`, transition: "background .3s, border-color .3s" }}
                data-navbar
            >
                <div style={{ display: "flex", alignItems: "center", padding: "0 20px", height: "52px", position: "relative" }}>

                    {/* LEFT: hamburger (mobile) + nav tabs (desktop) */}
                    <div style={{ display: "flex", alignItems: "center", minWidth: "120px" }}>
                        <button
                            className="nav-hamburger"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" aria-hidden="true">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <nav className="nav-gender" aria-label="Main navigation">
                            {[
                                { label: "NEW DROPS", href: "/new-in" },
                                { label: "GIFT SHOP", href: "/category/gift-shop" },
                            ].map(({ label, href }) => (
                                <Link key={label} href={href} className="gender-tab-link">{label}</Link>
                            ))}
                        </nav>
                    </div>

                    {/* CENTER: Logo */}
                    <Link href="/" aria-label="Missus — go to homepage" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", textDecoration: "none", userSelect: "none" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/missus-logo.webp" alt="Missus" style={{ height: "55px", width: "auto", display: "block", filter: transparent ? "brightness(0) invert(1)" : "none", transition: "filter .3s" }} />
                    </Link>

                    {/* RIGHT: search + icons + currency */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginLeft: "auto" }}>

                        {/* Search — desktop */}
                        <button className="nav-search-trigger" onClick={() => setSearchOpen(true)} aria-label="Open search" aria-haspopup="dialog">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={transparent ? "rgba(255,255,255,.6)" : "#999"} strokeWidth="1.8" aria-hidden="true">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <span>Search…</span>
                        </button>

                        {/* Account */}
                        <Link href="/account" className="nav-icon-link" style={{ color: iconColor, display: "flex", alignItems: "center", textDecoration: "none", transition: "color .3s" }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="nav-icon-link" style={{ color: iconColor, display: "flex", alignItems: "center", position: "relative", textDecoration: "none", transition: "color .3s" }} aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {wishlistCount > 0 && (
                                <span aria-hidden="true" style={{ position: "absolute", top: "-6px", right: "-6px", background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{wishlistCount}</span>
                            )}
                        </Link>

                        {/* Bag */}
                        <button onClick={onBagClick} className="nav-icon-link" aria-label={`Shopping bag${bagCount > 0 ? `, ${bagCount} items` : ""}`} style={{ display: "flex", alignItems: "center", position: "relative", background: "none", border: "none", cursor: "pointer", padding: 0, color: iconColor, transition: "color .3s" }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M19.5 8.25H16.5V7.75C16.5 6.55653 16.0259 5.41193 15.182 4.56802C14.3381 3.72411 13.1935 3.25 12 3.25C10.8065 3.25 9.66193 3.72411 8.81802 4.56802C7.97411 5.41193 7.5 6.55653 7.5 7.75V8.25H4.5C4.16848 8.25 3.85054 8.3817 3.61612 8.61612C3.3817 8.85054 3.25 9.16848 3.25 9.5V18C3.25 18.7293 3.53973 19.4288 4.05546 19.9445C4.57118 20.4603 5.27065 20.75 6 20.75H18C18.7293 20.75 19.4288 20.4603 19.9445 19.9445C20.4603 19.4288 20.75 18.7293 20.75 18V9.5C20.75 9.16848 20.6183 8.85054 20.3839 8.61612C20.1495 8.3817 19.8315 8.25 19.5 8.25ZM9 7.75C9 6.95435 9.31607 6.19129 9.87868 5.62868C10.4413 5.06607 11.2044 4.75 12 4.75C12.7956 4.75 13.5587 5.06607 14.1213 5.62868C14.6839 6.19129 15 6.95435 15 7.75V8.25H9V7.75ZM19.25 18C19.25 18.3315 19.1183 18.6495 18.8839 18.8839C18.6495 19.1183 18.3315 19.25 18 19.25H6C5.66848 19.25 5.35054 19.1183 5.11612 18.8839C4.8817 18.6495 4.75 18.3315 4.75 18V9.75H7.5V12C7.5 12.1989 7.57902 12.3897 7.71967 12.5303C7.86032 12.671 8.05109 12.75 8.25 12.75C8.44891 12.75 8.63968 12.671 8.78033 12.5303C8.92098 12.3897 9 12.1989 9 12V9.75H15V12C15 12.1989 15.079 12.3897 15.2197 12.5303C15.3603 12.671 15.5511 12.75 15.75 12.75C15.9489 12.75 16.1397 12.671 16.2803 12.5303C16.421 12.3897 16.5 12.1989 16.5 12V9.75H19.25V18Z" />
                            </svg>
                            {bagCount > 0 && (
                                <span aria-hidden="true" style={{ position: "absolute", top: "-6px", right: "-6px", background: "#e8002d", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{bagCount}</span>
                            )}
                        </button>

                        {/* Currency selector — desktop only */}
                        <div className="currency-btn-desktop">
                            <button
                                onClick={() => setCurrencyOpen(true)}
                                aria-label="Select currency and region"
                                aria-haspopup="dialog"
                                style={{
                                    display: "flex", alignItems: "center", gap: "4px",
                                    background: "none", border: "none", cursor: "pointer",
                                    color: iconColor, transition: "color .3s",
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                    fontSize: "11px", fontWeight: 500, letterSpacing: ".08em",
                                    padding: "4px 0",
                                }}
                            >
                                {currency}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {currencyOpen && (
                <CurrencyModal
                    currency={currency}
                    setCurrency={setCurrency}
                    onClose={() => setCurrencyOpen(false)}
                />
            )}

            <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} onBagClick={onBagClick} onSearchOpen={() => setSearchOpen(true)} />
            <SearchOverlay isOpen={searchOpen} inputValue={searchVal} onInputChange={setSearchVal} onClose={() => { setSearchOpen(false); setSearchVal(""); }} onSubmit={(q) => { setSearchOpen(false); setSearchVal(""); handleSearch(q); }} />
        </>
    );
}
