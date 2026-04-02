import Link from "next/link";

export default function ShipBar() {
    return (
        <div style={{ background: "#f5f5f5", borderBottom: "1px solid #e8e8e8", textAlign: "center", padding: "7px 20px", fontSize: "12px", fontWeight: 500, color: "#111" }}>
            Spend ₦150,000 or more to unlock{" "}
            <Link href="/shop" style={{ fontWeight: 700, textDecoration: "underline", color: "#000" }}>FREE SHIPPING!</Link>
            {"  "}
            <Link href="/new-in" style={{ fontWeight: 700, textDecoration: "underline", color: "#000" }}>Shop New →</Link>
        </div>
    );
}
