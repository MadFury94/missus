"use client";
import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Geist } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import CategoryNav from "@/components/layout/CategoryNav";
import ShipBar from "@/components/layout/ShipBar";
import Footer from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <html lang="en" className={cn(barlow.variable, barlowCondensed.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="font-body" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }} suppressHydrationWarning>
        {!isAdminRoute && (
          <>
            <AnnouncementBar />
            <Navbar />
            <CategoryNav />
            <ShipBar />
          </>
        )}
        <main style={{ flex: 1 }}>{children}</main>
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  );
}
