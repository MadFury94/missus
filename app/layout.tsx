import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { getHomepageContent } from "@/lib/homepage-content.server";
import { DEFAULT_METADATA } from "@/lib/seo-config";
import StructuredData from "@/components/seo/StructuredData";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/structured-data";

// Fix Unicode character encoding globally
export const charset = "utf-8";

// One self-hosted font for storefront and admin, including all variable weights.
const siteFont = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
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
      className={siteFont.variable}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
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
