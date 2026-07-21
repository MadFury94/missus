"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to your error tracking service here if you add one (e.g. Sentry)
        console.error(error);
    }, [error]);

    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(32px, 5vw, 48px)",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    marginBottom: "12px",
                    color: "#000",
                }}
            >
                Something went wrong
            </h1>
            <p style={{ fontSize: "14px", color: "#767676", marginBottom: "32px", maxWidth: "400px", lineHeight: 1.6 }}>
                We hit an unexpected error. It&apos;s not you — try refreshing or head back to the shop.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <button
                    onClick={reset}
                    style={{
                        background: "#000",
                        color: "#fff",
                        border: "none",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        padding: "14px 32px",
                        cursor: "pointer",
                    }}
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    style={{
                        background: "#fff",
                        color: "#000",
                        border: "1.5px solid #000",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        padding: "14px 32px",
                        textDecoration: "none",
                    }}
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
