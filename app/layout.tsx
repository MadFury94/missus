import type { Metadata } from "next";
import { Cormorant, DM_Sans, Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { getHomepageContent } from "@/lib/homepage-content.server";
import { cn } from "@/lib/utils";
import { DEFAULT_METADATA } from "@/lib/seo-config";
import StructuredData from "@/components/seo/StructuredData";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/structured-data";

// ── FONT CONFIGURATION ───────────────────────────────────────
// ★ DM SANS SITEWIDE: Using DM Sans for all text as agreed
// --font-display → headings, hero, labels, nav display text (DM Sans)
// --font-body    → body copy, UI, inputs, prices (DM Sans)
// Primary & secondary brand colors: globals.css → :root → --color-brand-primary / --color-brand-secondary

const displayFont = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// ── ADMIN FONTS ──────────────────────────────────────────────
// --font-admin-serif → Fraunces: page titles, stat values, section titles
// --font-admin-sans  → Public Sans: nav, tables, labels, buttons, inputs
const adminSerif = Fraunces({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-admin-serif",
  display: "swap",
});

const adminSans = Public_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-admin-sans",
  display: "swap",
});

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  icons: {
    icon: [{ url: "/IMG_4389.PNG", type: "image/png" }],
    shortcut: "/IMG_4389.PNG",
    apple: "/IMG_4389.PNG",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { announcement } = await getHomepageContent();

  return (
    <html
      lang="en"
      className={cn(displayFont.variable, bodyFont.variable, adminSerif.variable, adminSans.variable)}
      suppressHydrationWarning
    >
      <head>
        <StructuredData schema={[getOrganizationSchema(), getWebsiteSchema()]} />
        <link rel="canonical" href={SITE_URL} />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.woocommerce.com" />
      </head>
      <body
        className="font-body"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
        suppressHydrationWarning
      >
        <ClientShell announcement={announcement}>{children}</ClientShell>
      </body>
    </html>
  );
}
