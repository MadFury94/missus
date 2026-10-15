import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "missusoutfits.com" }], destination: "https://www.missusoutfits.com/:path*", statusCode: 301 },
      { source: "/category/shop-all", destination: "/shop", statusCode: 301 },
      { source: "/category/whats-new", destination: "/new-in", statusCode: 301 },
      { source: "/category/discount-sale", destination: "/sale", statusCode: 301 },
    ];
  },
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
    unoptimized: process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === "true",
    remotePatterns: [
      { protocol: "https", hostname: "missusoutfits.com" },
      { protocol: "https", hostname: "**.missusoutfits.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "goya.everthemes.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
