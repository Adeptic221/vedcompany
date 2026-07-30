import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.autohome.com.cn" },
      { protocol: "https", hostname: "car3.autoimg.cn" },
      { protocol: "https", hostname: "**.autoimg.cn" },
      { protocol: "https", hostname: "**.carapis.com" },
    ],
  },
};

export default nextConfig;