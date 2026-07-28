import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.autohome.com.cn" },
      { protocol: "https", hostname: "car3.autoimg.cn" },
    ],
  },
};

export default nextConfig;