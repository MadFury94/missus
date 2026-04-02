import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "missusoutfits.com" },
      { protocol: "https", hostname: "**.missusoutfits.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "goya.everthemes.com" },
    ],
  },
};

export default nextConfig;
