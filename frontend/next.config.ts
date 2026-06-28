import type { NextConfig } from "next";

// CSP é gerado dinamicamente no middleware (src/middleware.ts) com nonce por request.
// Os headers de segurança aqui são os estáticos — que não precisam ser dinâmicos.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  // Source maps apenas em desenvolvimento — não vazar lógica do cliente em produção
  output: 'standalone',
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "http", hostname: "backend", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "http://backend:8000/media/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  },
};

export default nextConfig;
