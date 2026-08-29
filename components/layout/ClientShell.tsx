"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CurrencyProvider } from "@/lib/currency";

// Heights of fixed layers — keep in sync with actual component heights
const ANN_H = 34;   // AnnouncementBar
const NAV_H = 52;   // Navbar
const CAT_H = 41;   // CategoryNav
const TOTAL_H = ANN_H + NAV_H + CAT_H; // 127px

export default function ClientShell({ children, announcement }: { children: React.ReactNode; announcement?: string }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");
    const isHome = pathname === "/";

    const [cartOpen, setCartOpen] = useState(false);
    const [annVisible, setAnnVisible] = useState(true);

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

    const annH = annVisible ? ANN_H : 0;
    const solidHeaderH = annH + NAV_H + CAT_H;

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
            </div>

            {/*
                Page content spacer:
                - On homepage: hero sits under the transparent header, no spacer needed
                - On all other pages: push content below the solid header
            */}
            {!isHome && <div style={{ height: `${solidHeaderH}px` }} />}
            {isHome && <div style={{ height: `${annH}px` }} />}

            <main style={{ flex: 1 }}>{children}</main>
            <Footer />

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </CurrencyProvider>
    );
}
