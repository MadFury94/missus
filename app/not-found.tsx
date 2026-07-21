import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found",
};

export default function NotFound() {
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
            <p
                style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "120px",
                    fontWeight: 900,
                    color: "#f0f0f0",
                    lineHeight: 1,
                    marginBottom: "0",
                    letterSpacing: "-.02em",
                }}
            >
                404
            </p>
            <h1
                style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(28px, 5vw, 42px)",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    marginBottom: "12px",
                    color: "#000",
                    marginTop: "-16px",
                }}
            >
                Page Not Found
            </h1>
            <p
                style={{
                    fontSize: "14px",
                    color: "#767676",
                    marginBottom: "32px",
                    maxWidth: "380px",
                    lineHeight: 1.6,
                }}
            >
                The page you&apos;re looking for has moved, been removed, or never existed. Let&apos;s get you back on track.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <Link
                    href="/shop"
                    style={{
                        background: "#000",
                        color: "#fff",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        padding: "14px 32px",
                        textDecoration: "none",
                    }}
                >
                    Shop All
                </Link>
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
