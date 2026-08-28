"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SUB_NAV } from "@/lib/config";

const SALE_COLOR = "#6b2737"; // burgundy

export default function CategoryNav() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (!isHome) { setScrolled(true); return; }
        setScrolled(window.scrollY > 10);
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isHome]);

    const transparent = isHome && !scrolled;
    const bg = transparent ? "transparent" : "#fff";
    const border = transparent ? "rgba(255,255,255,.12)" : "#e8e8e8";

    return (
        <>
            <nav
                aria-label="Category navigation"
                style={{
                    background: bg,
                    borderBottom: `1px solid ${border}`,
                    overflowX: "auto",
                    overflowY: "hidden",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    width: "100%",
                    transition: "background .3s, border-color .3s",
                }}
                className="scrollbar-hide cat-nav"
            >
                <div style={{
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "center",
                    width: "100%",
                    padding: "0 12px",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                }}>
                    {SUB_NAV.map((link) => {
                        const color = link.sale
                            ? SALE_COLOR
                            : transparent
                                ? "rgba(255,255,255,.85)"
                                : link.hot ? "#000" : "#333";

                        return (
                            <Link
                                key={link.href + link.label}
                                href={link.href}
                                style={{
                                    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                    fontSize: "12px",
                                    fontWeight: link.sale ? 600 : 400,
                                    letterSpacing: ".04em",
                                    color,
                                    padding: "11px 13px",
                                    borderBottom: "2px solid transparent",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    transition: "border-color .15s, color .3s",
                                    whiteSpace: "nowrap",
                                    textDecoration: "none",
                                    flexShrink: 0,
                                }}
                                className="subnav-link"
                            >
                                {link.hot && (
                                    <span style={{ marginRight: "4px", fontSize: "12px" }}>🔥</span>
                                )}
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <style>{`
                nav[aria-label="Category navigation"]::-webkit-scrollbar { display: none; }
                .subnav-link:hover { border-bottom-color: currentColor !important; opacity: .75; }
                @media (max-width: 768px) {
                    .cat-nav { display: none !important; }
                }
            `}</style>
        </>
    );
}
