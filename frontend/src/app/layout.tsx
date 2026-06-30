import type { Metadata } from "next";
import { Inter, Calistoga, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { CookieBanner } from "@/components/ui/CookieBanner";
import "./globals.css";

// Nonce-based CSP requer render dinâmico — sem isso, páginas prerenderizadas
// servem HTML cacheado sem nonce nos <script>, e o browser bloqueia toda a
// hidratação React. Trade-off: perdemos SSG/ISR mas garantimos que CSP
// estrito funcione. Ver src/middleware.ts.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair-base",
});

export const metadata: Metadata = {
  title: {
    default: "DescubraSul — Negócios Locais do Sul de SC",
    template: "%s | DescubraSul",
  },
  description:
    "Descubra os melhores negócios locais de Criciúma, Içara, Tubarão e região. Restaurantes, lojas, serviços e muito mais no Sul de Santa Catarina.",
  metadataBase: new URL("https://descubrasul.com"),
  openGraph: {
    siteName: "DescubraSul",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${calistoga.variable} ${playfair.variable} font-sans`}>
        <GoogleAnalytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
