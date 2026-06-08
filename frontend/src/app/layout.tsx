import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
