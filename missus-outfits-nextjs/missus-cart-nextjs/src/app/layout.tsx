import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "Your Bag — Missus Outfits",
  description:
    "Trendy, affordable women's fashion built for the modern Nigerian woman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-black antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
