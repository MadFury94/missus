import type { Metadata } from "next";
import { Cormorant, DM_Sans } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { getHomepageContent } from "@/lib/homepage-content.server";
import { cn } from "@/lib/utils";

// ── FONT CONFIGURATION ───────────────────────────────────────
// ★ SWAP FONTS SITEWIDE: change only these two imports.
// --font-display → headings, hero, labels, nav display text
// --font-body    → body copy, UI, inputs, prices
// Primary & secondary brand colors: globals.css → :root → --color-brand-primary / --color-brand-secondary

const displayFont = Cormorant({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Trend-forward, affordable fashion for the modern Nigerian girl. Shop dresses, tops, sets and more.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/IMG_4389.PNG", type: "image/png" }],
    shortcut: "/IMG_4389.PNG",
    apple: "/IMG_4389.PNG",
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: "/missus-logo.webp" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { announcement } = getHomepageContent();
  return (
    <html
      lang="en"
      className={cn(displayFont.variable, bodyFont.variable)}
      suppressHydrationWarning
    >
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
