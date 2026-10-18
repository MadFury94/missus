"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useNewsletter } from "@/lib/use-newsletter";
import { POPUP_CONFIG } from "@/lib/popup-config";

const CHIPS = ["Dresses", "Matching Sets", "Tops", "Bottoms", "Loungewear"];

// ── storage helpers ────────────────────────────────────────────────────────
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

// ── component ─────────────────────────────────────────────────────────────
export default function PopupA({ onDismissedWithoutSubscribe }: { onDismissedWithoutSubscribe?: () => void }) {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const { done, loading, error, subscribe } = useNewsletter("popup-a");
    const firstFocusRef = useRef<HTMLButtonElement>(null);
    const prevFocusRef = useRef<Element | null>(null);

    const dismiss = useCallback((subscribed = false) => {
        setVisible(false);
        suppress(POPUP_CONFIG.storageKeyA);
        if (!subscribed) onDismissedWithoutSubscribe?.();
        // return focus to trigger element
        if (prevFocusRef.current instanceof HTMLElement) prevFocusRef.current.focus();
    }, [onDismissedWithoutSubscribe]);

    useEffect(() => {
        // Don't show on suppressed paths
        if (POPUP_CONFIG.suppressPaths.some(p => window.location.pathname.startsWith(p))) return;
        // Don't show if suppressed or already subscribed
        if (isSuppressed(POPUP_CONFIG.storageKeyA)) return;
        if (isSuppressed(POPUP_CONFIG.storageKeySubscribed)) return;

        prevFocusRef.current = document.activeElement;

        let triggered = false;
        const trigger = () => {
            if (triggered) return;
            triggered = true;
            clearTimeout(timer);
            window.removeEventListener("scroll", onScroll);
            setVisible(true);
        };

        // Scroll trigger
        const onScroll = () => {
            const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (pct >= POPUP_CONFIG.popupAScrollPct) trigger();
        };

        const timer = setTimeout(trigger, POPUP_CONFIG.popupADelayMs);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
    }, []);

    // Focus trap
    useEffect(() => {
        if (!visible) return;
        setTimeout(() => firstFocusRef.current?.focus(), 60);
        const trap = (e: KeyboardEvent) => {
            if (e.key === "Escape") dismiss();
        };
        document.addEventListener("keydown", trap);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", trap);
            document.body.style.overflow = "";
        };
    }, [visible, dismiss]);

    useEffect(() => {
        if (!done) return;
        suppress(POPUP_CONFIG.storageKeySubscribed);
        suppress(POPUP_CONFIG.storageKeyA);
    }, [done]);

    function toggleChip(chip: string) {
        setSelected(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!agreed || !email) return;
        void subscribe(email, { tags: selected, popupVariant: "a" });
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
                aria-labelledby="popup-a-title"
                style={{
                    position: "fixed", inset: 0, zIndex: 901,
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                    pointerEvents: "none",
                }}
            >
                <div
                    className="popa-panel"
                    style={{ pointerEvents: "auto", width: "100%", maxWidth: "480px", background: "#fff", overflowY: "auto", maxHeight: "90vh" }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Photo */}
                    <div style={{ position: "relative", width: "100%", height: "34vh", minHeight: "200px", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/Desktop view 2.WEBP"
                            alt="Missus model in a warm lifestyle setting"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }}
                            loading="lazy"
                        />
                        {/* Close over photo */}
                        <button
                            ref={firstFocusRef}
                            onClick={() => dismiss()}
                            aria-label="Close"
                            style={{
                                position: "absolute", top: "16px", right: "16px",
                                width: "40px", height: "40px", borderRadius: "50%",
                                background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "32px 40px 36px" }} className="popa-body">
                        {done ? (
                            /* Success */
                            <div style={{ textAlign: "center", padding: "16px 0" }}>
                                <div style={{
                                    width: "52px", height: "52px", background: "#000", borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </div>
                                <p style={{ fontSize: "22px", fontWeight: 800, textTransform: "uppercase", marginBottom: "10px" }}>
                                    You&apos;re in!
                                </p>
                                <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6, marginBottom: "24px" }}>
                                    Check your inbox. Your {POPUP_CONFIG.discountLabel} code is on its way.
                                </p>
                                <button
                                    onClick={() => dismiss(true)}
                                    style={{ background: "#000", color: "#fff", border: "none", padding: "14px 36px", fontSize: "14px", fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: ".08em" }}
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Logo */}
                                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/missus-logo.webp" alt="Missus" style={{ height: "22px", width: "auto", display: "inline-block" }} />
                                </div>

                                {/* Headline */}
                                <p id="popup-a-title" style={{ textAlign: "center", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", lineHeight: 1.2, marginBottom: "6px" }}>
                                    Glamour Szn starts with an
                                </p>
                                <p style={{ textAlign: "center", fontSize: "clamp(42px,10vw,52px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 1, letterSpacing: "-.01em", marginBottom: "24px" }}>
                                    Extra {POPUP_CONFIG.discountPercent}% Off
                                </p>

                                {/* Preference chips */}
                                <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "12px" }}>
                                    What are you shopping for?
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
                                    {CHIPS.map(chip => {
                                        const active = selected.includes(chip);
                                        return (
                                            <button
                                                key={chip}
                                                type="button"
                                                onClick={() => toggleChip(chip)}
                                                aria-pressed={active}
                                                style={{
                                                    height: "28px", padding: "0 14px",
                                                    border: "1.5px solid #000", borderRadius: "8px",
                                                    background: active ? "#000" : "#fff",
                                                    color: active ? "#fff" : "#000",
                                                    fontSize: "12px", fontWeight: 500,
                                                    cursor: "pointer", transition: "background .15s, color .15s",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {chip}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Form */}
                                <form onSubmit={submit}>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Email"
                                        aria-label="Email address"
                                        style={{
                                            display: "block", width: "100%", height: "58px",
                                            border: "2px solid #e0e0e0", borderRadius: "8px",
                                            padding: "0 18px", fontSize: "17px", marginBottom: "14px",
                                            outline: "none", fontFamily: "inherit", background: "#fff",
                                            boxSizing: "border-box",
                                        }}
                                    />

                                    {/* Consent checkbox */}
                                    <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={e => setAgreed(e.target.checked)}
                                            style={{ width: "20px", height: "20px", flexShrink: 0, marginTop: "1px", accentColor: "#000", borderRadius: "4px", border: "1.5px solid #ccc", cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: "12px", lineHeight: 1.4, color: "#111" }}>
                                            Yes! Sign me up for Missus Insider emails with early drops, exclusive deals and style inspo.
                                            I agree to the{" "}
                                            <Link href="/terms" style={{ textDecoration: "underline", color: "#000" }}>Terms of Service</Link>
                                            {" "}and{" "}
                                            <Link href="/privacy" style={{ textDecoration: "underline", color: "#000" }}>Privacy Policy</Link>.
                                            Offer is for new subscribers only.
                                        </span>
                                    </label>

                                    {error && <p role="alert" style={{ fontSize: "12px", color: "#a00", marginBottom: "10px" }}>{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={!agreed || !email || loading}
                                        style={{
                                            display: "block", width: "100%", height: "58px",
                                            background: agreed && email ? "#000" : "#999",
                                            color: "#fff", border: "none", borderRadius: "999px",
                                            fontSize: "17px", fontWeight: 600, cursor: agreed && email ? "pointer" : "not-allowed",
                                            transition: "background .15s", fontFamily: "inherit",
                                        }}
                                    >
                                        {loading ? "Subscribing..." : "Get My Offer"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .popa-panel {
                    animation: popa-up .3s cubic-bezier(.4,0,.2,1) forwards;
                }
                @keyframes popa-up {
                    from { transform: translateY(60px); opacity: 0.6; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @media (min-width: 640px) {
                    .popa-panel {
                        margin-bottom: 0;
                        align-self: center;
                        border-radius: 0;
                    }
                }
                @media (max-width: 480px) {
                    .popa-body {
                        padding: 24px 20px 32px !important;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .popa-panel { animation: none !important; }
                }
            `}</style>
        </>
    );
}
