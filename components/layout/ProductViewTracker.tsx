"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ProductViewTracker() {
    const pathname = usePathname();
    useEffect(() => {
        if (!pathname?.includes("/product/")) return;
        try {
            const count = parseInt(localStorage.getItem("missus_product_views") || "0", 10);
            localStorage.setItem("missus_product_views", String(count + 1));
        } catch { /* ignore */ }
    }, [pathname]);
    return null;
}
