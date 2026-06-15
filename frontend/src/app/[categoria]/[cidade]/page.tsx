import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getNegocios } from "@/lib/fetchers";
import { mediaUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Props {
  params: Promise<{ categoria: string; cidade: string }>;
}

function capitalizar(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, cidade } = await params;
  const cat = capitalizar(categoria);
  const cid = capitalizar(cidade);
  const url = `https://descubrasul.com/${categoria}/${cidade}`;

  return {
    title: `${cat} em ${cid} | DescubraSul`,
    description: `Encontre os melhores ${cat.toLowerCase()} em ${cid}. Veja produtos, horários e fale direto pelo WhatsApp no DescubraSul.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${cat} em ${cid} | DescubraSul`,
      description: `Os melhores ${cat.toLowerCase()} de ${cid} estão no DescubraSul.`,
      url,
    },
  };
}

export default async function PaginaCategoriaCidade({ params }: Props) {
  const { categoria, cidade } = await params;
  const negocios = await getNegocios({ categoria, cidade });
  const cat = capitalizar(categoria);
  const cid = capitalizar(cidade);

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Quais são os melhores ${cat.toLowerCase()} em ${cid}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `No DescubraSul você encontra ${negocios.length} ${cat.toLowerCase()} em ${cid}, com produtos, horários e contato direto pelo WhatsApp.`,
        },
      },
    ],
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://descubrasul.com" },
      { "@type": "ListItem", position: 2, name: cat, item: `https://descubrasul.com/${categoria}/${cidade}` },
    ],
  };

  return (
    <div className="min-h-screen bg-surface">
      <JsonLd data={schemaFAQ} />
      <JsonLd data={schemaBreadcrumb} />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="py-8">
          <h1 className="text-3xl font-bold">
            {cat} em {cid}
          </h1>
          <p className="mt-2 text-ink/60">
            {negocios.length === 0
              ? `Em breve, os melhores ${cat.toLowerCase()} de ${cid} estarão aqui.`
              : `${negocios.length} negócio(s) encontrado(s) em ${cid}.`}
          </p>
        </header>

        {negocios.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {negocios.map((negocio) => {
              const logoSrc = mediaUrl(negocio.logo);
              return (
                <Link
                  key={negocio.slug}
                  href={`/negocios/${cidade}/${categoria}/${negocio.slug}`}
                  className="overflow-hidden rounded-xl border border-ink/10 bg-white transition hover:border-primary hover:shadow-md"
                >
                  {logoSrc && (
                    <Image
                      src={logoSrc}
                      alt={negocio.alt_logo || `Logo de ${negocio.nome}`}
                      width={400}
                      height={200}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="font-semibold">
                      {negocio.nome}
                      {negocio.verificado && (
                        <span className="ml-1 text-primary" title="Verificado">✓</span>
                      )}
                    </h2>
                    <p className="mt-1 text-sm text-ink/60">
                      {negocio.bairro || negocio.cidade}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
