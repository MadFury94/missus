"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import CategoryNav from "@/components/layout/CategoryNav";
import HeaderSearchBar from "@/components/layout/HeaderSearchBar";
import SearchOverlay from "@/components/layout/SearchOverlay";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CurrencyProvider } from "@/lib/currency";

// Heights of fixed layers — keep in sync with actual component heights
const ANN_H = 34;   // AnnouncementBar
const NAV_H = 52;   // Navbar
const CAT_H = 46;   // CategoryNav: 11px top padding + ~22px text + 11px bottom padding + 1px border + 1px scroll overflow ≈ 46px (desktop only, hidden on mobile)
const SEARCH_H = 42; // HeaderSearchBar (mobile only): 12px top+bottom padding + 14px font + ~4px line height

export default function ClientShell({ children, announcement }: { children: React.ReactNode; announcement?: string }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");
    const isCheckoutRoute = pathname?.startsWith("/checkout");
    const isHome = pathname === "/";
    const isProductPage = pathname?.includes("/product/");
    const hasMobileSearch = isHome || isProductPage;

    const [cartOpen, setCartOpen] = useState(false);
    const [annVisible, setAnnVisible] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");

    const openDrawer = useCallback(() => setCartOpen(true), []);
    useEffect(() => {
        window.addEventListener("open-cart-drawer", openDrawer);
        return () => window.removeEventListener("open-cart-drawer", openDrawer);
    }, [openDrawer]);

    if (isAdminRoute) {
        return (
            <>
                <main style={{ flex: 1 }}>{children}</main>
                <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            </>
        );
    }

    // Checkout routes get minimal layout - no navbar, no announcement, no category nav
    if (isCheckoutRoute) {
        return (
            <CurrencyProvider>
                <main style={{ flex: 1 }}>{children}</main>
                <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            </CurrencyProvider>
        );
    }

    const annH = annVisible ? ANN_H : 0;
    // Desktop total: announcement + navbar + category nav
    // Mobile total: announcement + navbar only (cat nav hidden) + search bar if applicable
    const desktopHeaderH = annH + NAV_H + CAT_H;
    const mobileHeaderH = annH + NAV_H + (hasMobileSearch ? SEARCH_H : 0);

    return (
        <CurrencyProvider>
            {/* ── Fixed header stack ─────────────────────── */}
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
                {/* 1. Announcement bar */}
                <AnnouncementBar text={announcement} onDismiss={() => setAnnVisible(false)} />

                {/* 2. Main navbar — transparent on homepage until scrolled */}
                <Navbar
                    onBagClick={() => setCartOpen(true)}
                    annHeight={annVisible ? ANN_H : 0}
                />

                {/* 3. Category nav — solid white, always visible on desktop */}
                <CategoryNav />

                {/* 4. Full-width search bar */}
                <HeaderSearchBar onSearchOpen={() => setSearchOpen(true)} />
            </div>

            {/*
                Page content spacer:
                - On homepage: hero sits under the transparent header, no spacer needed
                - On all other pages: push content below the solid header
                - Mobile: cat nav is hidden so spacer is smaller; search bar added if applicable
            */}
            {!isHome && !isProductPage && (
                <div
                    style={{ height: `${desktopHeaderH}px` }}
                    className="page-spacer"
                />
            )}
            {isProductPage && (
                <div
                    style={{ height: `${desktopHeaderH}px` }}
                    className="product-page-spacer"
                />
            )}
            {isHome && <div style={{ height: `${annH}px` }} />}

            <style>{`
                @media (max-width: 768px) {
                    .page-spacer {
                        height: ${mobileHeaderH}px !important;
                    }
                    .product-page-spacer {
                        height: ${mobileHeaderH}px !important;
                    }
                }
            `}</style>

            <main style={{ flex: 1 }}>{children}</main>
            <Footer />

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            <SearchOverlay
                isOpen={searchOpen}
                inputValue={searchVal}
                onInputChange={setSearchVal}
                onClose={() => { setSearchOpen(false); setSearchVal(""); }}
                onSubmit={(q) => {
                    setSearchOpen(false);
                    setSearchVal("");
                    // Handle search submission - could navigate to search results
                    window.location.href = `/search?q=${encodeURIComponent(q)}`;
                }}
            />
        </CurrencyProvider>
    );
}
