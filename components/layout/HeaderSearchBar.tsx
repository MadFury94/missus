"use client";
import { usePathname } from "next/navigation";

export default function HeaderSearchBar({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const pathname = usePathname();
    const isProductPage = pathname?.includes("/product/");
    const isHome = pathname === "/";

    // Only show search bar on homepage and product pages
    if (!isHome && !isProductPage) {
        return null;
    }
    const showMobileSearch = pathname === "/" || isProductPage;

    if (!showMobileSearch) return null;

    const handleSearchClick = () => {
        onSearchOpen?.();
    };

    return (
        <>
            {/* Mobile-only search bar */}
            <div className="mobile-search-bar" style={{
                width: "100%",
                background: isProductPage ? "#f5f5f5" : "transparent",
                padding: "0",
                margin: "0"
            }}>
                <button
                    onClick={handleSearchClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: "transparent",
                        border: "none",
                        borderRadius: "0",
                        padding: isProductPage ? "8px 20px" : "12px 20px",
                        width: "100%",
                        cursor: "pointer"
                    }}
                >
                    {/* Placeholder Text */}
                    <span style={{
                        flex: 1,
                        fontSize: "14px",
                        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                        color: isProductPage ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
                        fontWeight: 400,
                        textAlign: "left"
                    }}>
                        Try searching for... White Dress
                    </span>

                    {/* Search Icon on RIGHT */}
                    <img
                        src="/search.svg"
                        alt=""
                        width={16}
                        height={16}
                        style={{
                            flexShrink: 0,
                            marginLeft: "12px",
                            filter: isProductPage ? "none" : "brightness(0) invert(1)"
                        }}
                    />
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
