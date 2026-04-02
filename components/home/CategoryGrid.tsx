import Link from "next/link";
import Image from "next/image";
import { CATEGORY_CARDS } from "@/lib/config";

export default function CategoryGrid() {
    return (
        <>
            <div style={{ padding: "32px 20px 0" }}>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "#000", marginBottom: "16px" }}>
                    Shop By Category
                </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: "8px", padding: "0 20px", marginBottom: "32px" }}>
                {CATEGORY_CARDS.map((cat) => (
                    <Link
                        key={cat.href}
                        href={cat.href}
                        style={{ position: "relative", overflow: "hidden", cursor: "pointer", background: "#f0ece8", gridRow: cat.tall ? "span 2" : undefined, display: "block" }}
                    >
                        <div style={{ width: "100%", minHeight: cat.tall ? "420px" : "200px", position: "relative", overflow: "hidden", background: cat.bg }}>
                            {cat.img ? (
                                <Image
                                    src={cat.img}
                                    alt={cat.label}
                                    fill
                                    style={{ objectFit: "cover", objectPosition: "top" }}
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            ) : (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: cat.tall ? "80px" : "60px", fontWeight: 900, color: "rgba(255,255,255,.08)" }}>
                                        {cat.abbr}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px", zIndex: 2 }}>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "4px" }}>{cat.label}</span>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", textDecoration: "underline" }}>{cat.sub}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
