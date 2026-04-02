import { STATIC_REVIEWS } from "@/lib/config";

export default function ReviewsSection() {
    return (
        <div style={{ background: "#f5f5f5", padding: "40px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                    <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "#000" }}>THE GIRLS LOVE MISSUS</h2>
                    <p style={{ fontSize: "12px", color: "#767676", marginTop: "2px" }}>Real reviews from real customers</p>
                </div>
                <button style={{ background: "none", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "3px", color: "#000", padding: 0, cursor: "pointer" }}>
                    Read All Reviews
                </button>
            </div>
            <div className="reviews-grid">
                {STATIC_REVIEWS.map((r, i) => (
                    <div key={i} style={{ background: "#fff", padding: "20px", border: "1px solid #e8e8e8" }}>
                        <div style={{ display: "flex", gap: "2px", marginBottom: "10px" }}>
                            {"★★★★★".split("").map((s, j) => <span key={j} style={{ color: "#ffc107", fontSize: "14px" }}>{s}</span>)}
                        </div>
                        <p style={{ fontSize: "13px", color: "#333", lineHeight: 1.65, fontStyle: "italic", marginBottom: "12px" }}>&ldquo;{r.text}&rdquo;</p>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000" }}>{r.name}</p>
                        <p style={{ fontSize: "11px", color: "#767676", marginTop: "2px" }}>{r.meta}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
