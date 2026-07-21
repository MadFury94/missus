"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import CategoryNav from "@/components/layout/CategoryNav";
import ShipBar from "@/components/layout/ShipBar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");

    const [cartOpen, setCartOpen] = useState(false);

    // Listen for a custom "open-cart-drawer" event dispatched when items are added
    const openDrawer = useCallback(() => setCartOpen(true), []);
    useEffect(() => {
        window.addEventListener("open-cart-drawer", openDrawer);
        return () => window.removeEventListener("open-cart-drawer", openDrawer);
    }, [openDrawer]);

    return (
        <>
            {!isAdminRoute && (
                <>
                    <AnnouncementBar />
                    <Navbar onBagClick={() => setCartOpen(true)} />
                    <CategoryNav />
                    <ShipBar />
                </>
            )}
            <main style={{ flex: 1 }}>{children}</main>
            {!isAdminRoute && <Footer />}

            {/* Global cart drawer — rendered outside main so it overlays everything */}
            {!isAdminRoute && (
                <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
            )}
        </>
    );
}
