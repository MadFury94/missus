export default function ProductSkeleton() {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                .skeleton-shimmer {
                    background: linear-gradient(
                        90deg,
                        #efefef 25%,
                        #e0e0e0 50%,
                        #efefef 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.6s ease-in-out infinite;
                }
            `}</style>

            <div style={{ position: "relative", background: "#fff" }}>
                {/* Image placeholder */}
                <div
                    className="skeleton-shimmer"
                    style={{
                        aspectRatio: "2/3",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {/* Missus logo watermark — same treatment as FashionNova */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/missus-logo.webp"
                        alt=""
                        aria-hidden="true"
                        style={{
                            height: "28px",
                            width: "auto",
                            opacity: 0.18,
                            filter: "brightness(0)",
                            userSelect: "none",
                            pointerEvents: "none",
                        }}
                    />
                </div>

                {/* Text placeholders */}
                <div style={{ padding: "8px 8px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {/* Product name */}
                    <div className="skeleton-shimmer" style={{ height: "13px", width: "75%", borderRadius: "2px" }} />
                    {/* Price */}
                    <div className="skeleton-shimmer" style={{ height: "14px", width: "40%", borderRadius: "2px" }} />
                    {/* Swatches */}
                    <div style={{ display: "flex", gap: "5px", marginTop: "2px" }}>
                        {[1, 2].map((i) => (
                            <div key={i} className="skeleton-shimmer" style={{ width: "14px", height: "14px", borderRadius: "50%" }} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
