import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getNegocios } from "@/lib/fetchers";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Negocio } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

function capitalizar(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cidade = capitalizar(slug);
  const url = `https://descubrasul.com/cidades/${slug}`;

  return {
    title: `Negocios em ${cidade} | DescubraSul`,
    description: `Descubra os melhores negocios de ${cidade}: restaurantes, lojas, servicos e muito mais. Fale direto pelo WhatsApp no DescubraSul.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Negocios em ${cidade} | DescubraSul`,
      description: `O comercio de ${cidade} esta no DescubraSul.`,
      url,
    },
  };
}

export default async function PaginaCidade({ params }: Props) {
  const { slug } = await params;
  const cidade = capitalizar(slug);
  const negocios = await getNegocios({ cidade: slug });

  // Agrupar por categoria
  const porCategoria = new Map<string, { nome: string; icone: string; itens: Negocio[] }>();
  for (const n of negocios) {
    const cat = n.categoria;
    if (!porCategoria.has(cat.slug)) {
      porCategoria.set(cat.slug, { nome: cat.nome, icone: cat.icone, itens: [] });
    }
    porCategoria.get(cat.slug)!.itens.push(n);
  }

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://descubrasul.com" },
      { "@type": "ListItem", position: 2, name: cidade, item: `https://descubrasul.com/cidades/${slug}` },
    ],
  };

  const schemaItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Negocios em ${cidade}`,
    numberOfItems: negocios.length,
    itemListElement: negocios.slice(0, 20).map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: n.nome,
      url: `https://descubrasul.com/negocios/${n.cidade}/${n.categoria.slug}/${n.slug}`,
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={schemaBreadcrumb} />
      <JsonLd data={schemaItemList} />

      <header className="py-8">
        <h1 className="text-3xl font-bold">Negocios em {cidade}</h1>
        <p className="mt-2 text-ink/60">
          {negocios.length === 0
            ? `Em breve, o comercio de ${cidade} estara aqui.`
            : `${negocios.length} negocio(s) em ${cidade}, organizados por categoria.`}
        </p>
      </header>

      {[...porCategoria.entries()].map(([catSlug, grupo]) => (
        <section key={catSlug} className="py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {grupo.icone} {grupo.nome}
            </h2>
            <Link
              href={`/${catSlug}/${slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {grupo.itens.slice(0, 6).map((negocio) => (
              <Link
                key={negocio.slug}
                href={`/negocios/${slug}/${catSlug}/${negocio.slug}`}
                className="overflow-hidden rounded-xl border border-ink/10 bg-white transition hover:border-primary hover:shadow-md"
              >
                {negocio.logo && (
                  <Image
                    src={negocio.logo}
                    alt={negocio.alt_logo || `Logo de ${negocio.nome}`}
                    width={400}
                    height={200}
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold">
                    {negocio.nome}
                    {negocio.verificado && (
                      <span className="ml-1 text-primary" title="Verificado">✓</span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60">
                    {negocio.bairro || negocio.cidade}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}