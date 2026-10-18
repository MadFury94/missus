"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function Klaviyo() {
    const pathname = usePathname();
    const siteId = process.env.NEXT_PUBLIC_KLAVIYO_SITE_ID?.trim();
    if (!siteId || !/^[a-zA-Z0-9]+$/.test(siteId) || pathname?.startsWith("/admin")) return null;

    return <Script id="klaviyo-onsite" src={`https://static.klaviyo.com/onsite/js/${siteId}/klaviyo.js`} strategy="afterInteractive" />;
}
