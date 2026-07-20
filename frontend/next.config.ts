import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // SiliconFlow 的结构化回答通常需要 30 秒以上，避免 rewrite 代理提前断开。
    proxyTimeout: 120_000,
  },
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
