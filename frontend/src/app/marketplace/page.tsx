import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, BadgeCheck, Star } from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategorias, getNegocios } from "@/lib/fetchers";
import { mediaUrl } from "@/lib/utils";
import type { Negocio } from "@/types";

const CIDADES = ["Criciúma","Içara","Araranguá","Tubarão","Forquilhinha","Morro da Fumaça","Balneário Rincão"];

function slugifyCidade(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g,"-");
}

export const metadata: Metadata = {
  title: "Marketplace — Negócios Locais | DescubraSul",
  description: "Explore todos os negócios do Sul de Santa Catarina. Restaurantes, lojas, serviços e muito mais.",
  alternates: { canonical: "https://descubrasul.com/marketplace" },
};

interface Props { searchParams: Promise<Record<string,string>> }

function NegocioCard({ negocio }: { negocio: Negocio }) {
  const logo    = mediaUrl(negocio.logo);
  const catSlug = negocio.categoria?.slug || "";
  const cidSlug = slugifyCidade(negocio.cidade);

  return (
    <Link
      href={`/negocios/${cidSlug}/${catSlug}/${negocio.slug}`}
      className="card-hover bg-white rounded-2xl border border-black/[0.06] overflow-hidden block"
    >
      <div className="relative h-32 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center overflow-hidden">
        {logo ? (
          <Image src={logo} alt={negocio.nome} fill className="object-cover" sizes="(max-width:640px)100vw,25vw" />
        ) : (
          <span className="font-display text-white text-4xl opacity-70">{negocio.nome[0]}</span>
        )}
        {negocio.plano !== "gratuito" && (
          <span className="absolute top-2.5 left-2.5 badge-gold text-white text-[10px] font-bold rounded-full px-2.5 py-0.5">Destaque</span>
        )}
        <span className="absolute -bottom-5 left-4 w-10 h-10 rounded-xl bg-white shadow-md font-extrabold text-primary flex items-center justify-center text-sm">
          {negocio.nome[0]}
        </span>
      </div>
      <div className="p-4 pt-7">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-ink leading-tight truncate text-sm">{negocio.nome}</p>
          {negocio.verificado && <BadgeCheck className="size-3.5 text-primary shrink-0" />}
        </div>
        <p className="text-xs text-sec mt-0.5">{negocio.categoria?.nome}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-sec">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" />{negocio.cidade}</span>
          {negocio.total_avaliacoes > 0 && (
            <span className="flex items-center gap-1 font-semibold text-ink">
              <Star className="size-3.5 text-accent fill-accent" />
              {negocio.media_nota}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function MarketplacePage({ searchParams }: Props) {
  const sp  = await searchParams;
  const cat = sp.cat    || "";
  const cid = sp.cidade || "";

  const [categorias, negocios] = await Promise.all([
    getCategorias(),
    getNegocios({
      categoria: cat   || undefined,
      cidade:    cid ? cid.replace(/-/g," ") : undefined,
    }),
  ]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Marketplace DescubraSul",
    numberOfItems: negocios.length,
  };

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd data={schema} />
      <Navbar />

      <header className="bg-white border-b border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-ink/40 text-xs mb-3">
            <Link href="/" className="hover:text-ink transition-colors">Início</Link>
            <span>/</span>
            <span className="text-ink/70">Marketplace</span>
          </nav>
          <h1 className="font-display text-3xl text-ink">Todos os negócios</h1>
          <p className="text-sec text-sm mt-1">{negocios.length} negócios no Sul de SC</p>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* Filtros */}
        <aside className="lg:w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-black/[0.06] p-5 sticky top-20">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-3">Categoria</p>
            <div className="flex flex-col gap-0.5">
              <Link href="/marketplace" className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors ${!cat ? "bg-primary text-white" : "text-sec hover:bg-black/5 hover:text-ink"}`}>
                Todas
              </Link>
              {categorias.map(c => (
                <Link key={c.slug}
                  href={`/marketplace?${new URLSearchParams({ cat: c.slug, ...(cid && { cidade: cid }) }).toString()}`}
                  className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-2 ${cat === c.slug ? "bg-primary text-white" : "text-sec hover:bg-black/5 hover:text-ink"}`}
                >
                  <span>{c.icone}</span> {c.nome}
                </Link>
              ))}
            </div>

            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mt-5 mb-3">Cidade</p>
            <div className="flex flex-col gap-0.5">
              <Link href={`/marketplace${cat ? `?cat=${cat}` : ""}`} className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors ${!cid ? "bg-primary text-white" : "text-sec hover:bg-black/5 hover:text-ink"}`}>
                Todas
              </Link>
              {CIDADES.map(c => {
                const slug = slugifyCidade(c);
                return (
                  <Link key={slug}
                    href={`/marketplace?${new URLSearchParams({ ...(cat && { cat }), cidade: slug }).toString()}`}
                    className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors ${cid === slug ? "bg-primary text-white" : "text-sec hover:bg-black/5 hover:text-ink"}`}
                  >
                    {c}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <section className="flex-1 min-w-0">
          {negocios.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.06] p-14 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <h2 className="font-display text-xl text-ink">Sem resultados</h2>
              <p className="text-sec text-sm mt-2">Tente outros filtros.</p>
              <Link href="/marketplace" className="mt-4 inline-block text-sm font-semibold text-primary hover:text-accent transition-colors">
                Ver todos →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {negocios.map(n => <NegocioCard key={n.slug} negocio={n} />)}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
