"use client";

import Image from "next/image";

interface RemovedItem {
    name: string;
    image?: string;
}

interface Props {
    items: RemovedItem[];
    onRestore?: (index: number) => void;
}

export default function RecentlyRemoved({ items, onRestore }: Props) {
    if (items.length === 0) return null;

    return (
        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e8e8e8" }}>
            <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#767676", marginBottom: "14px" }}>
                Recently Removed
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => onRestore?.(index)}
                        style={{ width: "72px", cursor: "pointer", opacity: 0.6, transition: "opacity .2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                    >
                        <div style={{ width: "72px", height: "96px", background: "#f0ece8", position: "relative", overflow: "hidden", marginBottom: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.image ? (
                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="72px" />
                            ) : (
                                <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "8px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(0,0,0,.25)", textAlign: "center", padding: "6px", lineHeight: 1.4 }}>
                                    {item.name}
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: "10px", color: "#555", lineHeight: 1.3 }}>
                            {item.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
