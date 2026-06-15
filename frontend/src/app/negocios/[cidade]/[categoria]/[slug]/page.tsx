import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNegocio, getProdutosDoNegocio, getNegocios } from "@/lib/fetchers";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackerView } from "@/components/negocios/TrackerView";
import { BusinessSidebar } from "@/components/negocios/BusinessSidebar";
import { PaginaNegocioClient } from "@/components/negocios/PaginaNegocioClient";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <JsonLd data={schemaLocalBusiness(negocio, url)} />
      <TrackerView negocioSlug={negocio.slug} />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">

          {/* Coluna principal — client component com estado do carousel */}
          <PaginaNegocioClient
            negocio={negocio}
            produtos={produtos}
            similares={similaresFiltrados}
          />

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