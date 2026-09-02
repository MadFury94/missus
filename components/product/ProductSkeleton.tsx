export default function ProductSkeleton() {
    return (
        <div style={{ position: "relative", background: "#fff" }}>
            {/* Image placeholder with shimmer */}
            <div
                style={{
                    aspectRatio: "2/3",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    background: "linear-gradient(90deg, #efefef 25%, #e5e5e5 50%, #efefef 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.6s ease-in-out infinite",
                }}
            >
                {/* Missus wordmark — rendered as styled text, always visible */}
                <span
                    aria-hidden="true"
                    style={{
                        fontFamily: "var(--font-display, 'Cormorant', serif)",
                        fontSize: "clamp(14px, 2.5vw, 18px)",
                        fontWeight: 600,
                        letterSpacing: ".22em",
                        textTransform: "uppercase",
                        color: "rgba(0,0,0,.13)",
                        userSelect: "none",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    MISSUS
                </span>
            </div>

            {/* Text placeholders */}
            <div style={{ padding: "8px 8px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "13px", width: "75%", borderRadius: "2px", background: "linear-gradient(90deg, #efefef 25%, #e5e5e5 50%, #efefef 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s ease-in-out infinite" }} />
                <div style={{ height: "14px", width: "40%", borderRadius: "2px", background: "linear-gradient(90deg, #efefef 25%, #e5e5e5 50%, #efefef 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s ease-in-out infinite" }} />
                <div style={{ display: "flex", gap: "5px", marginTop: "2px" }}>
                    {[1, 2].map((i) => (
                        <div key={i} style={{ width: "14px", height: "14px", borderRadius: "50%", background: "linear-gradient(90deg, #efefef 25%, #e5e5e5 50%, #efefef 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s ease-in-out infinite" }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
