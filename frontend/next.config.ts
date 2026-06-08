import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // S3 para imagens de produtos e logos
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      // Permitir imagens locais em desenvolvimento
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // Variáveis de ambiente expostas ao browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  },
};

export default nextConfig;
