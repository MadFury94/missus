"use client";

export default function ExpressCheckout() {
    return (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e8e8e8" }}>
            <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "10px", position: "relative" }}>
                <span style={{ position: "relative", zIndex: 10, background: "#fff", padding: "0 8px" }}>— Express Checkout —</span>
                <span style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "1px", background: "#e8e8e8", transform: "translateY(-50%)" }} />
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
                {["PAYSTACK", "OPAY", "KUDA"].map((method) => (
                    <button
                        key={method}
                        style={{
                            flex: 1,
                            height: "44px",
                            border: "1.5px solid #e0e0e0",
                            background: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-barlow-condensed)",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: ".06em",
                            transition: "all .15s",
                            color: "#767676"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#000";
                            e.currentTarget.style.color = "#000";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e0e0e0";
                            e.currentTarget.style.color = "#767676";
                        }}
                    >
                        {method}
                    </button>
                ))}
            </div>
        </div>
    );
}
