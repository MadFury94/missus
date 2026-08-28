"use client";
import Link from "next/link";
import { SUB_NAV } from "@/lib/config";

export default function CategoryNav() {
    return (
        <>
            <nav
                aria-label="Category navigation"
                style={{
                    background: "#fff",
                    borderBottom: "1px solid #e8e8e8",
                    overflowX: "auto",
                    overflowY: "hidden",
                    // iOS momentum scrolling
                    WebkitOverflowScrolling: "touch",
                    // hide scrollbar on all browsers
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    // force full viewport width — critical on mobile
                    width: "100%",
                    position: "relative",
                }}
                className="scrollbar-hide"
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "stretch",
                        // min-content keeps the row from wrapping — forces horizontal scroll
                        width: "max-content",
                        minWidth: "100%",
                        padding: "0 12px",
                    }}
                >
                    {SUB_NAV.map((link) => (
                        <Link
                            key={link.href + link.label}
                            href={link.href}
                            style={{
                                fontFamily: "'Barlow', sans-serif",
                                fontSize: "13px",
                                fontWeight: link.sale ? 700 : 500,
                                letterSpacing: ".02em",
                                color: link.sale ? "#e8002d" : link.hot ? "#000" : "#111",
                                // generous tap target — min 44px height
                                padding: "12px 14px",
                                borderBottom: "2px solid transparent",
                                display: "inline-flex",
                                alignItems: "center",
                                transition: "border-color .15s, color .15s",
                                whiteSpace: "nowrap",
                                textDecoration: "none",
                                flexShrink: 0,
                            }}
                            className="subnav-link"
                        >
                            {link.hot && (
                                <span style={{ marginRight: "4px", fontSize: "13px" }}>🔥</span>
                            )}
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>

            <style>{`
                /* Hide webkit scrollbar */
                nav[aria-label="Category navigation"]::-webkit-scrollbar { display: none; }
                /* Hover underline */
                .subnav-link:hover { border-bottom-color: #000 !important; color: #000 !important; }
                .subnav-link[style*="e8002d"]:hover { color: #c00020 !important; border-bottom-color: #e8002d !important; }
            `}</style>
        </>
    );
}
