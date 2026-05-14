import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Size Guide — Missus",
    description: "Find your perfect fit with the Missus size guide for dresses, tops, bottoms and sets.",
};

const SIZES = [
    { size: "XS", uk: "6", us: "2", eu: "34", bust: "80–83", waist: "60–63", hips: "86–89" },
    { size: "S", uk: "8", us: "4", eu: "36", bust: "84–87", waist: "64–67", hips: "90–93" },
    { size: "M", uk: "10", us: "6", eu: "38", bust: "88–91", waist: "68–71", hips: "94–97" },
    { size: "L", uk: "12", us: "8", eu: "40", bust: "92–95", waist: "72–75", hips: "98–101" },
    { size: "XL", uk: "14", us: "10", eu: "42", bust: "96–99", waist: "76–79", hips: "102–105" },
    { size: "XXL", uk: "16", us: "12", eu: "44", bust: "100–103", waist: "80–83", hips: "106–109" },
    { size: "3XL", uk: "18", us: "14", eu: "46", bust: "104–107", waist: "84–87", hips: "110–113" },
];

const TIPS = [
    { icon: "📏", title: "Measure Yourself", body: "Use a soft measuring tape. Measure over your underwear, not over clothing. Keep the tape snug but not tight." },
    { icon: "👗", title: "Bust", body: "Measure around the fullest part of your chest, keeping the tape parallel to the floor." },
    { icon: "⌛", title: "Waist", body: "Measure around your natural waistline — the narrowest part of your torso, usually just above your belly button." },
    { icon: "🍑", title: "Hips", body: "Measure around the fullest part of your hips and bottom, about 20cm below your waist." },
];

export default function SizeGuidePage() {
    return (
        <div style={{ background: "#fff" }}>
            {/* Header */}
            <div style={{ background: "#000", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#e8002d", marginBottom: "10px" }}>
                    Find Your Fit
                </p>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 0.9 }}>
                    Size Guide
                </h1>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", marginTop: "14px" }}>
                    All measurements in centimetres (cm)
                </p>
            </div>

            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 64px" }}>

                {/* How to measure */}
                <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "20px" }}>
                    How to Measure
                </h2>
                <div className="size-tips-grid">
                    {TIPS.map((tip) => (
                        <div key={tip.title} style={{ background: "#f5f5f5", padding: "20px", borderLeft: "3px solid #000" }}>
                            <div style={{ fontSize: "22px", marginBottom: "8px" }}>{tip.icon}</div>
                            <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "6px" }}>{tip.title}</p>
                            <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.7 }}>{tip.body}</p>
                        </div>
                    ))}
                </div>

                {/* Size table */}
                <h2 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "22px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "16px" }}>
                    Women&apos;s Size Chart
                </h2>
                <div style={{ overflowX: "auto", marginBottom: "40px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "560px" }}>
                        <thead>
                            <tr style={{ background: "#000", color: "#fff" }}>
                                {["Missus Size", "UK", "US", "EU", "Bust (cm)", "Waist (cm)", "Hips (cm)"].map((h) => (
                                    <th key={h} style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 14px", textAlign: "left" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SIZES.map((row, i) => (
                                <tr key={row.size} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "12px 14px", fontFamily: "var(--font-barlow-condensed)", fontSize: "15px", fontWeight: 800, letterSpacing: ".04em" }}>{row.size}</td>
                                    <td style={{ padding: "12px 14px", color: "#555" }}>{row.uk}</td>
                                    <td style={{ padding: "12px 14px", color: "#555" }}>{row.us}</td>
                                    <td style={{ padding: "12px 14px", color: "#555" }}>{row.eu}</td>
                                    <td style={{ padding: "12px 14px", color: "#333" }}>{row.bust}</td>
                                    <td style={{ padding: "12px 14px", color: "#333" }}>{row.waist}</td>
                                    <td style={{ padding: "12px 14px", color: "#333" }}>{row.hips}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Fit notes */}
                <div style={{ background: "#f5f5f5", padding: "24px", marginBottom: "32px" }}>
                    <h3 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "12px" }}>
                        Fit Notes
                    </h3>
                    <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                            "If you're between sizes, we recommend sizing up for a more comfortable fit.",
                            "Bodycon and fitted styles run true to size — size up if you prefer a relaxed fit.",
                            "Dresses with stretch fabric are more forgiving — go with your usual size.",
                            "For matching sets, size based on your largest measurement.",
                            "Still unsure? DM us on Instagram @missusoutfits and we'll help you pick.",
                        ].map((note) => (
                            <li key={note} style={{ fontSize: "13px", color: "#444", lineHeight: 1.7 }}>{note}</li>
                        ))}
                    </ul>
                </div>

                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "13px", color: "#555", marginBottom: "16px" }}>
                        Still not sure about your size?
                    </p>
                    <Link href="/contact" style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none", display: "inline-block" }}>
                        Ask Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
