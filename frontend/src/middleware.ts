import { NextRequest, NextResponse } from "next/server";

// CSP con nonce dinâmico para permitir os inline scripts que Next.js usa
// para hidratação, mantendo proteção contra XSS de terceiros.
// Doc oficial: https://nextjs.org/docs/app/guides/content-security-policy

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://api.descubrasul.com https://www.google-analytics.com`,
    `frame-src 'self' https://www.google.com https://maps.google.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // upgrade-insecure-requests rompe local (forza HTTPS en localhost que es HTTP)
    ...(process.env.NODE_ENV === 'development' ? [] : [`upgrade-insecure-requests`]),
  ].join("; ");

  // Pasa o nonce ao Next via header — App Router le e injeta nos <Script> automaticamente
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // E também no response, pra que o browser receba o CSP
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    // Aplica a todas as rotas, exceto assets estáticos e prefetches de RSC
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
