import type { NextConfig } from "next";
import { STORE_CONFIG } from "./lib/store-config";

const nextConfig: NextConfig = {
  typescript: {
    // During builds, ignore TypeScript errors for faster deployment
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    maximumRedirects: 3,
    // In dev, if the WordPress host blocks outbound connections from localhost,
    // set NEXT_PUBLIC_UNOPTIMIZED_IMAGES=true in .env.local to serve images
    // directly from the browser (bypasses next/image server-side fetching).
    // Remove this in production — next/image optimisation should work on the server.
    unoptimized: process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === "true",
    remotePatterns: [
      { protocol: "https", hostname: new URL(STORE_CONFIG.wordpressUrl).hostname },
      ...(STORE_CONFIG.endpoints.media ? [{ protocol: "https" as const, hostname: new URL(STORE_CONFIG.endpoints.media).hostname }] : []),
      { protocol: "https", hostname: "missusoutfits.com" },
      { protocol: "https", hostname: "**.missusoutfits.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "goya.everthemes.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
