import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNegocio, getProdutosDoNegocio, getNegocios, getGoogleReviews } from "@/lib/fetchers";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackerView } from "@/components/negocios/TrackerView";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BusinessHero } from "@/components/negocios/BusinessHero";
import { StickyActionBar } from "@/components/negocios/StickyActionBar";
import { QuickActionsBar } from "@/components/negocios/QuickActionsBar";
import { BusinessMobileBottomNav } from "@/components/negocios/BusinessMobileBottomNav";
import { PaginaNegocioClient } from "@/components/negocios/PaginaNegocioClient";
import { BusinessSidebar } from "@/components/negocios/BusinessSidebar";
import { SimilarBusinesses } from "@/components/negocios/SimilarBusinesses";
import { GoogleReviews } from "@/components/negocios/GoogleReviews";

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

import type { GoogleReviewData } from "@/types";

function schemaLocalBusiness(
  negocio: NonNullable<Awaited<ReturnType<typeof getNegocio>>>,
  url: string,
  googleReviews: GoogleReviewData | null = null,
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
    sameAs: [
      negocio.redes_sociais?.instagram_url,
      negocio.redes_sociais?.facebook_url,
      negocio.redes_sociais?.tiktok_url,
      negocio.redes_sociais?.linkedin_url,
    ].filter(Boolean),
    ...(googleReviews && googleReviews.total > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: googleReviews.rating.toFixed(1),
        reviewCount: googleReviews.total,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };
}

export default async function PaginaNegocio({ params }: Props) {
  const { slug, cidade, categoria } = await params;
  const negocio = await getNegocio(slug);
  if (!negocio) notFound();

  const [produtos, similares, googleReviews] = await Promise.all([
    getProdutosDoNegocio(slug),
    getNegocios({ categoria, cidade }),
    negocio.google_place_id ? getGoogleReviews(slug) : Promise.resolve(null),
  ]);

  const similaresFiltrados = similares
    .filter((n) => n.slug !== slug)
    .slice(0, 4);

  const url = `https://descubrasul.com/negocios/${cidade}/${categoria}/${slug}`;

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: "#f8f9ff" }}>
      <JsonLd data={schemaLocalBusiness(negocio, url, googleReviews)} />
      <TrackerView negocioSlug={negocio.slug} />
      <Navbar />

      {/* Hero full-width */}
      <BusinessHero negocio={negocio} />

      {/* Mobile: quick action icon buttons floating below hero */}
      <div className="md:hidden">
        <QuickActionsBar negocio={negocio} />
      </div>

      {/* Desktop: sticky action bar */}
      <div className="hidden md:block">
        <StickyActionBar negocio={negocio} />
      </div>

      {/* Main content */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-12 flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Content column */}
        <div className="w-full md:w-[65%] space-y-8 md:space-y-12">
          <PaginaNegocioClient
            negocio={negocio}
            produtos={produtos}
            similares={similaresFiltrados}
          />
          {googleReviews && googleReviews.total > 0 && (
            <GoogleReviews data={googleReviews} nomeNegocio={negocio.nome} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-[35%]">
          <BusinessSidebar negocio={negocio} />
        </aside>
      </main>

      {/* Similar businesses — full width */}
      <SimilarBusinesses negocios={similaresFiltrados} />

      <Footer />

      {/* Mobile bottom nav */}
      <BusinessMobileBottomNav negocio={negocio} />
    </div>
  );
}
