"use client";
import { usePathname } from "next/navigation";

export default function HeaderSearchBar({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const pathname = usePathname();
    const isProductPage = pathname?.includes("/product/");
    const isHome = pathname === "/";
    const isShopPage = pathname?.startsWith("/shop") || pathname?.startsWith("/new-in") || pathname?.startsWith("/category/") || pathname?.startsWith("/sale") || pathname?.startsWith("/search") || pathname?.startsWith("/product-tag/");

    // Show the mobile search row on homepage and catalog browsing pages only.
    if (!isHome && !isProductPage && !isShopPage) {
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
                background: "var(--sky)",
                padding: "0",
                margin: "0",
                borderBottom: "1px solid rgba(18,24,31,.18)"
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
                        color: "var(--ink)",
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
                            filter: "none"
                        }}
                    />
                </button>
            </div>

            <style>{`
                .mobile-search-bar { display: none; }
                @media (max-width: 768px) {
                    .mobile-search-bar { display: block; }
                }
            `}</style>
        </>
    );
}
