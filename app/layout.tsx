import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Geist } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { getHomepageContent } from "@/lib/homepage-content.server";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const barlow = Barlow({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
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
    icon: [{ url: "/icon.webp", type: "image/webp" }],
    shortcut: "/icon.webp",
    apple: "/icon.webp",
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
      className={cn(barlow.variable, barlowCondensed.variable, "font-sans", geist.variable)}
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
