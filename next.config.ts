import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP only — AVIF takes 50% longer to encode and the origin is already slow
    formats: ["image/webp"],
    // Cache optimized images for 31 days to avoid hammering the slow WooCommerce origin
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Reduce redirects to cut round-trips on slow origin
    maximumRedirects: 1,
    remotePatterns: [
      { protocol: "https", hostname: "missusoutfits.com" },
      { protocol: "https", hostname: "**.missusoutfits.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "goya.everthemes.com" },
    ],
  },
};

export default nextConfig;
