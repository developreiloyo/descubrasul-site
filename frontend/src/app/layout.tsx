import type { Metadata } from "next";
import { Inter, Calistoga } from "next/font/google";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { CookieBanner } from "@/components/ui/CookieBanner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
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
      <body className={`${inter.variable} ${calistoga.variable} font-sans`}>
        <GoogleAnalytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
