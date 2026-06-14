import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNegocio, getProdutosDoNegocio, getNegocios } from "@/lib/fetchers";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackerView } from "@/components/negocios/TrackerView";
import { BusinessActions } from "@/components/negocios/BusinessActions";
import { BusinessSidebar } from "@/components/negocios/BusinessSidebar";
import { ServicosSection } from "@/components/negocios/ServicosSection";
import { SimilarBusinesses } from "@/components/negocios/SimilarBusinesses";
import { PhotoGallery } from "@/components/negocios/PhotoGallery";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BadgeCheck, MapPin, Star } from "lucide-react";

interface Props {
  params: Promise<{ cidade: string; categoria: string; slug: string }>;
}

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
    },
  };
}

function schemaLocalBusiness(
  negocio: NonNullable<Awaited<ReturnType<typeof getNegocio>>>,
  url: string
) {
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
    ].filter(Boolean),
  };
}

export default async function PaginaNegocio({ params }: Props) {
  const { slug, cidade, categoria } = await params;
  const negocio = await getNegocio(slug);
  if (!negocio) notFound();

  const [produtos, similares] = await Promise.all([
    getProdutosDoNegocio(slug),
    getNegocios({ categoria, cidade }),
  ]);

  const similaresFiltrados = similares
    .filter((n) => n.slug !== slug)
    .slice(0, 4);

  const url = `https://descubrasul.com/negocios/${cidade}/${categoria}/${slug}`;
  const cidadeFormatada = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <JsonLd data={schemaLocalBusiness(negocio, url)} />
      <TrackerView negocioSlug={negocio.slug} />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">

          {/* Coluna principal */}
          <div className="flex flex-col gap-6">

            {/* Galeria */}
            <PhotoGallery
              mainPhoto={negocio.logo}
              altText={negocio.alt_logo}
              icone={negocio.categoria?.icone}
              nome={negocio.nome}
            />

            {/* Nome e meta — abaixo da foto como na referencia */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                  {negocio.nome}
                </h1>
                {negocio.verificado && (
                  <BadgeCheck className="size-7 text-primary" fill="#0d9488" stroke="white" />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-medium text-primary">
                  {negocio.categoria?.nome}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-ink/50">
                  <MapPin className="size-3.5" />
                  {cidadeFormatada} · SC
                </span>
                {negocio.total_avaliacoes > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{negocio.media_nota}</span>
                    <span className="text-ink/50">({negocio.total_avaliacoes} avaliações)</span>
                  </span>
                )}
              </div>

              {negocio.descricao && (
                <p className="mt-3 leading-relaxed text-ink/70">{negocio.descricao}</p>
              )}

              <BusinessActions
                negocioSlug={negocio.slug}
                whatsapp={negocio.whatsapp}
                nome={negocio.nome}
              />
            </div>

            {/* Produtos / Servicos */}
            <ServicosSection negocio={negocio} produtos={produtos} />

            {/* Sidebar mobile */}
            <div className="lg:hidden">
              <BusinessSidebar negocio={negocio} />
            </div>

            {/* Similares */}
            <SimilarBusinesses negocios={similaresFiltrados} />
          </div>

          {/* Sidebar desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <BusinessSidebar negocio={negocio} />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}