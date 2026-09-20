"use client";
import { usePathname } from "next/navigation";

export default function HeaderSearchBar({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const pathname = usePathname();
    const isProductPage = pathname?.includes("/product/");

    // Don't show search bar on product pages
    if (isProductPage) {
        return null;
    }

    const handleSearchClick = () => {
        onSearchOpen?.();
    };

    return (
        <>
            {/* Mobile-only search bar */}
            <div className="mobile-search-bar" style={{
                width: "100%",
                background: "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                padding: "8px 20px 12px", // Reduced from 16px to 8px
                transition: "border-color 0.3s"
            }}>
                <button
                    onClick={handleSearchClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: "transparent",
                        border: "none",
                        borderRadius: "0",
                        padding: "8px 0 8px 4px", // Reduced vertical padding from 12px to 8px
                        transition: "border-color 0.2s ease",
                        width: "100%",
                        cursor: "pointer"
                    }}
                >
                    {/* Search Icon on LEFT */}
                    <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="2"
                        style={{ flexShrink: 0, marginRight: "12px", transition: "color 0.3s" }}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>

                    {/* Placeholder Text */}
                    <span style={{
                        flex: 1,
                        fontSize: "14px",
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: 300,
                        textAlign: "left"
                    }}>
                        Try searching for... White Dress
                    </span>
                </button>
            </div>

            <style>{`
                .mobile-search-bar {
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .mobile-search-bar {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
}