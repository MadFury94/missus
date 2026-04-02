"use client";
import Link from "next/link";
import { SUB_NAV } from "@/lib/config";

export default function CategoryNav() {
    return (
        <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", overflowX: "auto", scrollbarWidth: "none" }} className="scrollbar-hide">
            <div style={{ display: "flex", alignItems: "center", padding: "0 20px", whiteSpace: "nowrap", gap: 0 }}>
                {SUB_NAV.map((link) => (
                    <Link
                        key={link.href + link.label}
                        href={link.href}
                        style={{
                            fontFamily: "'Barlow', sans-serif",
                            fontSize: "12px",
                            fontWeight: 500,
                            letterSpacing: ".04em",
                            color: link.sale ? "#e8002d" : link.hot ? "#e8002d" : "#111",
                            fontWeight: link.sale ? 700 : 500,
                            padding: "10px 14px",
                            borderBottom: "2px solid transparent",
                            display: "inline-block",
                            transition: "border-color .15s, color .15s",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                        }}
                        className="sub-link"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            <style>{`.sub-link:hover { border-bottom-color: #000 !important; color: #000 !important; }`}</style>
        </div>
    );
}
