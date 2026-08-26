interface Props {
    items?: string[];
}

const DEFAULT_ITEMS = [
    "Miss Us With The Ugly Clothes",
    "New Drops Weekly",
    "It-Girl Approved",
    "Shop Dresses · Tops · Sets",
    "Lagos Same Day Delivery",
];

export default function MarqueeStrip({ items = DEFAULT_ITEMS }: Props) {
    const doubled = [...items, ...items];
    return (
        <div style={{ background: "#000", padding: "11px 0", overflow: "hidden" }}>
            <div className="animate-marquee" style={{ display: "flex", whiteSpace: "nowrap" }}>
                {doubled.map((item, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "20px", padding: "0 20px", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#fff" }}>
                        {item}
                        <span style={{ width: "5px", height: "5px", background: "#fff", borderRadius: "50%", flexShrink: 0, display: "inline-block" }} />
                    </span>
                ))}
            </div>
        </div>
    );
}
