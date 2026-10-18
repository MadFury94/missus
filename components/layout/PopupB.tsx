"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useNewsletter } from "@/lib/use-newsletter";
import { POPUP_CONFIG } from "@/lib/popup-config";

// ── storage helpers (duplicated to keep file self-contained) ──────────────
function getStored(key: string) {
    try { return localStorage.getItem(key); } catch { return null; }
}
function setStored(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
}
function suppress(key: string) {
    const until = Date.now() + POPUP_CONFIG.suppressDays * 86_400_000;
    setStored(key, String(until));
}
function isSuppressed(key: string) {
    const raw = getStored(key);
    return raw ? Date.now() < Number(raw) : false;
}

export default function PopupB() {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState("");
    const { done, loading, error, subscribe } = useNewsletter("popup-b");
    const firstFocusRef = useRef<HTMLButtonElement>(null);
    const prevFocusRef = useRef<Element | null>(null);
    const productViewsRef = useRef(0);

    const dismiss = useCallback((subscribed = false) => {
        setVisible(false);
        if (!subscribed) suppress(POPUP_CONFIG.storageKeyB);
        if (subscribed) { suppress(POPUP_CONFIG.storageKeySubscribed); suppress(POPUP_CONFIG.storageKeyB); }
        if (prevFocusRef.current instanceof HTMLElement) prevFocusRef.current.focus();
    }, []);

    useEffect(() => {
        // Only show if Popup A was dismissed without subscribing
        if (!isSuppressed(POPUP_CONFIG.storageKeyA)) return;
        if (isSuppressed(POPUP_CONFIG.storageKeyB)) return;
        if (isSuppressed(POPUP_CONFIG.storageKeySubscribed)) return;
        if (POPUP_CONFIG.suppressPaths.some(p => window.location.pathname.startsWith(p))) return;

        prevFocusRef.current = document.activeElement;

        const isDesktop = window.matchMedia("(min-width: 768px)").matches;

        if (isDesktop) {
            // Exit intent on desktop
            const onMouseOut = (e: MouseEvent) => {
                if (e.clientY <= 0) { setVisible(true); document.removeEventListener("mouseleave", onMouseOut); }
            };
            document.addEventListener("mouseleave", onMouseOut);
            return () => document.removeEventListener("mouseleave", onMouseOut);
        } else {
            // Mobile: count product page views across sessions
            if (window.location.pathname.includes("/product/")) {
                productViewsRef.current++;
                try { localStorage.setItem("missus_pdp_views", String(productViewsRef.current)); } catch { /* ignore */ }
            }
            const views = Number(getStored("missus_pdp_views") ?? 0);
            if (views >= 3) {
                const t = setTimeout(() => setVisible(true), 1500);
                return () => clearTimeout(t);
            }
        }
    }, []);

    // Keyboard trap
    useEffect(() => {
        if (!visible) return;
        setTimeout(() => firstFocusRef.current?.focus(), 60);
        const trap = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
        document.addEventListener("keydown", trap);
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", trap); document.body.style.overflow = ""; };
    }, [visible, dismiss]);

    useEffect(() => {
        if (!done) { suppress(POPUP_CONFIG.storageKeySubscribed); suppress(POPUP_CONFIG.storageKeyB); }
    }, [done]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        void subscribe(email, { popupVariant: "b" });
    }

    if (!visible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={() => dismiss()}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 900 }}
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="popup-b-title"
                style={{
                    position: "fixed", inset: 0, zIndex: 901,
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                    pointerEvents: "none",
                }}
            >
                <div
                    className="popb-panel"
                    style={{
                        pointerEvents: "auto", width: "100%", maxWidth: "480px",
                        position: "relative", overflowY: "auto", maxHeight: "90vh",
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Full-bleed background image */}
                    <div style={{ position: "relative", minHeight: "100vh" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/Desktop view 3.WEBP"
                            alt="Missus models in night-out outfits"
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                            loading="lazy"
                        />
                        {/* Dark overlay */}
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} aria-hidden="true" />

                        {/* Content */}
                        <div style={{ position: "relative", zIndex: 1, padding: "0 20px 40px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>

                            {/* Close */}
                            <button
                                ref={firstFocusRef}
                                onClick={() => dismiss()}
                                aria-label="Close"
                                style={{
                                    alignSelf: "flex-end", marginTop: "20px",
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "#fff", padding: "4px",
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>

                            {done ? (
                                /* Success */
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px 0" }}>
                                    <div style={{ width: "56px", height: "56px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <p style={{ fontSize: "24px", fontWeight: 800, textTransform: "uppercase", color: "#fff", marginBottom: "12px" }}>
                                        You&apos;re in!
                                    </p>
                                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: "28px" }}>
                                        Check your inbox. Your {POPUP_CONFIG.discountLabel} code is on its way.
                                    </p>
                                    <button
                                        onClick={() => dismiss(true)}
                                        style={{ background: "#fff", color: "#000", border: "none", padding: "16px 40px", fontSize: "15px", fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: ".08em" }}
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Logo */}
                                    <div style={{ textAlign: "center", marginTop: "100px", marginBottom: "28px" }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/missus-light.png" alt="Missus" style={{ width: "190px", height: "auto", display: "inline-block" }} />
                                    </div>

                                    {/* Discount */}
                                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                        <p style={{ fontSize: "26px", fontWeight: 700, textTransform: "uppercase", color: "#fff", letterSpacing: ".02em", marginBottom: "4px" }}>
                                            Enjoy
                                        </p>
                                        <p id="popup-b-title" style={{ fontSize: "clamp(60px,18vw,76px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 1, letterSpacing: "-.02em", marginBottom: "6px" }}>
                                            {POPUP_CONFIG.discountPercent}% Off
                                        </p>
                                        <p style={{ fontSize: "22px", fontWeight: 700, textTransform: "uppercase", color: "#fff", letterSpacing: ".06em" }}>
                                            Your First Order
                                        </p>
                                    </div>

                                    {/* Legal box */}
                                    <div style={{ background: "rgba(0,0,0,0.55)", padding: "12px 16px", marginBottom: "14px" }}>
                                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.88)", lineHeight: 1.45, textAlign: "center" }}>
                                            By signing up, you agree to receive marketing emails from Missus Outfits with new drops, deals and style inspo.
                                            Consent is not a condition of any purchase. You can unsubscribe at any time using the link in any email.
                                            By signing up you also agree to our{" "}
                                            <Link href="/terms" style={{ color: "#fff", textDecoration: "underline" }}>Terms</Link>
                                            {" "}and{" "}
                                            <Link href="/privacy" style={{ color: "#fff", textDecoration: "underline" }}>Privacy Policy</Link>.
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={submit} style={{ marginTop: "4px" }}>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            aria-label="Email address"
                                            style={{
                                                display: "block", width: "100%", height: "56px",
                                                background: "#fff", border: "none",
                                                padding: "0 18px", fontSize: "17px",
                                                marginBottom: "0", fontFamily: "inherit",
                                                color: "#111",
                                            }}
                                        />

                                        {error && <p role="alert" style={{ fontSize: "12px", color: "#ffb3b3", margin: "8px 0 0" }}>{error}</p>}

                                        <button
                                            type="submit"
                                            disabled={!email || loading}
                                            style={{
                                                display: "block", width: "100%", height: "76px",
                                                background: "#000", color: "#fff",
                                                border: "1.5px solid #fff",
                                                fontSize: "15px", fontFamily: "inherit",
                                                cursor: email ? "pointer" : "not-allowed",
                                                marginTop: "0",
                                            }}
                                        >
                                            <span style={{ display: "block", fontWeight: 700, fontSize: "20px", textTransform: "uppercase", letterSpacing: ".06em", lineHeight: 1.1 }}>
                                                {loading ? "Subscribing..." : `Get My ${POPUP_CONFIG.discountPercent}% Off Code`}
                                            </span>
                                            {!loading && (
                                                <span style={{ display: "block", fontWeight: 400, fontSize: "13px", marginTop: "4px", opacity: 0.8 }}>
                                                    when you join the Missus Insider list
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .popb-panel {
                    animation: popb-up .3s cubic-bezier(.4,0,.2,1) forwards;
                }
                @keyframes popb-up {
                    from { transform: translateY(60px); opacity: 0.6; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @media (min-width: 640px) {
                    .popb-panel { align-self: center; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .popb-panel { animation: none !important; }
                }
            `}</style>
        </>
    );
}
