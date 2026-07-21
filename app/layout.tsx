import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Geist } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { SITE_NAME, SITE_URL } from "@/lib/config";
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
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
