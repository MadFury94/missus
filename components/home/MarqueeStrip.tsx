import { MARQUEE_ITEMS } from "@/lib/config";

export default function MarqueeStrip() {
    const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    return (
        <div style={{ background: "#000", padding: "11px 0", overflow: "hidden" }}>
            <div className="animate-marquee" style={{ display: "flex", whiteSpace: "nowrap" }}>
                {items.map((item, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "20px", padding: "0 20px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#fff" }}>
                        {item}
                        <span style={{ width: "5px", height: "5px", background: "#e8002d", borderRadius: "50%", flexShrink: 0, display: "inline-block" }} />
                    </span>
                ))}
            </div>
        </div>
    );
}
