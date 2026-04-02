import type { Metadata } from "next";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import CategoryNav from "@/components/layout/CategoryNav";
import ShipBar from "@/components/layout/ShipBar";
import Footer from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: `${SITE_NAME}. | Trendy Women's Fashion Nigeria`, template: `%s | ${SITE_NAME}.` },
  description: "Trend-forward, affordable fashion for the modern Nigerian girl. Shop dresses, tops, sets and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AnnouncementBar />
        <Navbar />
        <CategoryNav />
        <ShipBar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
