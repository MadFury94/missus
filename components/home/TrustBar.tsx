import { TRUST_ITEMS } from "@/lib/config";

const ICONS = {
    truck: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" aria-hidden="true">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    ),
    return: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" aria-hidden="true">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
        </svg>
    ),
    shield: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    chat: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
};

export default function TrustBar() {
    return (
        <>
            {/* Borders handled purely in CSS so they respond correctly at all breakpoints */}
            <style>{`
                .trust-bar {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    border: 1px solid #e8e8e8;
                    border-top: none;
                }
                .trust-item {
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-right: 1px solid #e8e8e8;
                }
                .trust-item:last-child { border-right: none; }

                @media (max-width: 768px) {
                    .trust-bar { grid-template-columns: repeat(2, 1fr); }
                    .trust-item { border-top: 1px solid #e8e8e8; }
                    /* Remove right border on even items; restore on all items */
                    .trust-item:nth-child(2n) { border-right: none; }
                    .trust-item:nth-child(2n+1) { border-right: 1px solid #e8e8e8; }
                    /* No top border on first two items */
                    .trust-item:nth-child(1),
                    .trust-item:nth-child(2) { border-top: none; }
                }

                @media (max-width: 480px) {
                    .trust-bar { grid-template-columns: 1fr; }
                    .trust-item { border-right: none !important; }
                    .trust-item:first-child { border-top: none; }
                }
            `}</style>

            <div className="trust-bar" role="list" aria-label="Shopping promises">
                {TRUST_ITEMS.map((item) => (
                    <div key={item.title} className="trust-item" role="listitem">
                        <div style={{ flexShrink: 0 }}>
                            {ICONS[item.icon as keyof typeof ICONS]}
                        </div>
                        <div>
                            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                                {item.title}
                            </p>
                            <p style={{ fontSize: "11px", color: "#767676", marginTop: "1px" }}>
                                {item.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
