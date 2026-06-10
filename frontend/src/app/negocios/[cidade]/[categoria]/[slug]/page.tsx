import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getNegocio, getProdutosDoNegocio } from "@/lib/fetchers";
import { JsonLd } from "@/components/seo/JsonLd";
import { BotaoWhatsApp } from "@/components/negocios/BotaoWhatsApp";
import { formatarPreco, truncar } from "@/lib/utils";

interface Props {
  params: Promise<{ cidade: string; categoria: string; slug: string }>;
}

// ─── Metadata dinâmica (SEO) ──────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, cidade, categoria } = await params;
  const negocio = await getNegocio(slug);
  if (!negocio) return { title: "Negócio não encontrado" };

  const url = `https://descubrasul.com/negocios/${cidade}/${categoria}/${slug}`;

  return {
    title: negocio.seo_title,
    description: negocio.seo_description,
    alternates: { canonical: url },
    openGraph: {
      title: negocio.seo_title,
      description: negocio.seo_description,
      url,
      images: negocio.og_image ? [negocio.og_image] : [],
      type: "website",
    },
  };
}

// ─── Schema JSON-LD ───────────────────────────────────────────────
function schemaLocalBusiness(negocio: NonNullable<Awaited<ReturnType<typeof getNegocio>>>, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": negocio.categoria_tipo || "LocalBusiness",
    name: negocio.nome,
    description: negocio.seo_description,
    url,
    telephone: negocio.whatsapp,
    image: negocio.logo ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: negocio.cidade,
      addressRegion: "SC",
      addressCountry: "BR",
      ...(negocio.localizacao?.direccao_fmt && {
        streetAddress: negocio.localizacao.direccao_fmt,
      }),
    },
    ...(negocio.localizacao?.lat && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: negocio.localizacao.lat,
        longitude: negocio.localizacao.lng,
      },
    }),
    ...(negocio.horario_abertura && {
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: negocio.dias_funcionamento,
        opens: negocio.horario_abertura,
        closes: negocio.horario_fechamento,
      },
    }),
    ...(negocio.total_avaliacoes > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: negocio.media_nota,
        reviewCount: negocio.total_avaliacoes,
      },
    }),
    sameAs: [
      negocio.redes_sociais?.instagram_url,
      negocio.redes_sociais?.facebook_url,
      negocio.redes_sociais?.tiktok_url,
      negocio.redes_sociais?.youtube_url,
    ].filter(Boolean),
  };
}

// ─── Página ───────────────────────────────────────────────────────
export default async function PaginaNegocio({ params }: Props) {
  const { slug, cidade, categoria } = await params;
  const negocio = await getNegocio(slug);
  if (!negocio) notFound();

  const produtos = await getProdutosDoNegocio(slug);
  const url = `https://descubrasul.com/negocios/${cidade}/${categoria}/${slug}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <JsonLd data={schemaLocalBusiness(negocio, url)} />

      {/* ─── Cabeçalho do negócio ─────────────────────── */}
      <header className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
        {negocio.logo && (
          <Image
            src={negocio.logo}
            alt={negocio.alt_logo || `Logo de ${negocio.nome}`}
            width={120}
            height={120}
            priority
            className="rounded-2xl border border-ink/10 object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {negocio.nome}
            {negocio.verificado && (
              <span className="ml-2 text-primary" title="Negócio verificado">✓</span>
            )}
          </h1>
          <p className="mt-1 text-ink/60">
            {negocio.categoria?.nome} · {negocio.cidade}
            {negocio.bairro && ` · ${negocio.bairro}`}
          </p>
          {negocio.descricao && (
            <p className="mt-3 max-w-2xl text-ink/80">{negocio.descricao}</p>
          )}
        </div>
        <BotaoWhatsApp
          numero={negocio.whatsapp}
          mensagem={`Olá! Vi o perfil de ${negocio.nome} no DescubraSul e gostaria de mais informações.`}
          negocioSlug={negocio.slug}
        />
      </header>

      {/* ─── Produtos ─────────────────────────────────── */}
      <section className="py-8">
        <h2 className="mb-6 text-2xl font-semibold">Produtos</h2>
        {produtos.length === 0 ? (
          <p className="text-ink/50">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((produto) => (
              <article
                key={produto.slug}
                className="overflow-hidden rounded-xl border border-ink/10 bg-white transition hover:shadow-md"
              >
                {produto.foto && (
                  <Image
                    src={produto.foto}
                    alt={produto.alt_foto || produto.nome}
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{produto.nome}</h3>
                  {produto.descricao && (
                    <p className="mt-1 text-sm text-ink/60">
                      {truncar(produto.descricao, 100)}
                    </p>
                  )}
                  {produto.preco && (
                    <p className="mt-2 font-bold text-primary">
                      {formatarPreco(produto.preco)}
                    </p>
                  )}
                  <div className="mt-3">
                    <BotaoWhatsApp
                      numero={negocio.whatsapp}
                      mensagem={`Olá! Tenho interesse no produto "${produto.nome}" que vi no DescubraSul.`}
                      texto="Pedir pelo WhatsApp"
                      negocioSlug={negocio.slug}
                      produtoSlug={produto.slug}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
