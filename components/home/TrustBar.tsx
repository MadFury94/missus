const ICONS = {
    truck: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    return: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" /></svg>,
    shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    chat: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
};

import { TRUST_ITEMS } from "@/lib/config";

export default function TrustBar() {
    return (
        <div className="trust-grid">
            {TRUST_ITEMS.map((item, i) => (
                <div key={i} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", borderRight: i < 3 ? "1px solid #e8e8e8" : "none" }}>
                    <div style={{ flexShrink: 0 }}>{ICONS[item.icon as keyof typeof ICONS]}</div>
                    <div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{item.title}</p>
                        <p style={{ fontSize: "11px", color: "#767676", marginTop: "1px" }}>{item.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
