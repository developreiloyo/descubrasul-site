import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck, Star, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategorias, getNegocios } from "@/lib/fetchers";
import { mediaUrl } from "@/lib/utils";
import type { Negocio } from "@/types";

const CIDADES = ["Criciúma","Içara","Araranguá","Tubarão","Forquilhinha","Morro da Fumaça"];

function slugifyCidade(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g,"-");
}

function capitalizar(slug: string) {
  return slug.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

interface Props { params: Promise<{ categoria: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const categorias = await getCategorias();
  const cat = categorias.find(c => c.slug === categoria);
  const nome = cat?.nome || capitalizar(categoria);
  const url  = `https://descubrasul.com/${categoria}`;

  return {
    title: `${nome} no Sul de SC | DescubraSul`,
    description: `Encontre os melhores ${nome.toLowerCase()} em Criciúma, Içara, Tubarão, Araranguá e toda a região Sul de Santa Catarina.`,
    alternates: { canonical: url },
    openGraph: { title: `${nome} no Sul de SC | DescubraSul`, url },
  };
}

function NegocioCard({ negocio }: { negocio: Negocio }) {
  const logo    = mediaUrl(negocio.logo);
  const catSlug = negocio.categoria?.slug || "";
  const cidSlug = slugifyCidade(negocio.cidade);

  return (
    <Link
      href={`/negocios/${cidSlug}/${catSlug}/${negocio.slug}`}
      className="card-hover bg-white rounded-2xl border border-black/[0.06] overflow-hidden block"
    >
      <div className="relative h-36 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center overflow-hidden">
        {logo ? (
          <Image src={logo} alt={negocio.nome} fill className="object-cover" sizes="(max-width:640px)100vw,33vw" />
        ) : (
          <span className="font-display text-white text-5xl opacity-70">{negocio.nome[0]}</span>
        )}
        {negocio.plano !== "gratuito" && (
          <span className="absolute top-2.5 left-2.5 badge-gold text-white text-[10px] font-bold rounded-full px-2.5 py-0.5">
            Destaque
          </span>
        )}
        <span className="absolute -bottom-5 left-4 w-10 h-10 rounded-xl bg-white shadow-md font-extrabold text-primary flex items-center justify-center text-sm">
          {negocio.nome[0]}
        </span>
      </div>
      <div className="p-4 pt-7">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-ink leading-tight truncate">{negocio.nome}</p>
          {negocio.verificado && <BadgeCheck className="size-4 text-primary shrink-0" />}
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-sec">
          <MapPin className="size-3.5" />{negocio.cidade}
        </div>
        {negocio.total_avaliacoes > 0 && (
          <div className="flex items-center gap-1 mt-3 text-xs">
            <Star className="size-3.5 text-accent fill-accent" />
            <span className="font-semibold text-ink">{negocio.media_nota}</span>
            <span className="text-sec">({negocio.total_avaliacoes})</span>
          </div>
        )}
        <span className="mt-3 block text-center text-sm font-semibold text-primary border border-primary/25 rounded-full py-2 hover:bg-primary hover:text-white transition-colors">
          Ver negócio
        </span>
      </div>
    </Link>
  );
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;

  const [categorias, negocios] = await Promise.all([
    getCategorias(),
    getNegocios({ categoria }),
  ]);

  const cat  = categorias.find(c => c.slug === categoria);
  const nome = cat?.nome || capitalizar(categoria);

  // Contar por ciudad
  const porCidade = CIDADES.map(c => ({
    nome: c,
    slug: slugifyCidade(c),
    qtd: negocios.filter(n => slugifyCidade(n.cidade) === slugifyCidade(c)).length,
  })).filter(c => c.qtd > 0);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${nome} no Sul de SC`,
    numberOfItems: negocios.length,
    itemListElement: negocios.slice(0, 10).map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://descubrasul.com/negocios/${slugifyCidade(n.cidade)}/${categoria}/${n.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd data={schema} />
      <Navbar />

      {/* Hero da categoria */}
      <header className="bg-primary hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light/60" />
        <div className="max-w-[1200px] mx-auto px-4 py-12 lg:py-16 relative z-10">
          <nav className="flex items-center gap-2 text-white/50 text-xs mb-6">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>/</span>
            <span className="text-white/80">{nome}</span>
          </nav>
          <div className="flex items-center gap-4 mb-3">
            {cat?.icone && (
              <span className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                {cat.icone}
              </span>
            )}
            <div>
              <h1 className="font-display text-white text-3xl lg:text-4xl">{nome}</h1>
              <p className="text-white/60 text-sm mt-1">
                {negocios.length} negócio{negocios.length !== 1 ? "s" : ""} no Sul de SC
              </p>
            </div>
          </div>

          {/* Filtro por cidade */}
          {porCidade.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                href={`/${categoria}`}
                className="text-xs font-semibold bg-white text-primary rounded-full px-4 py-1.5 hover:bg-accent hover:text-white transition-colors"
              >
                Todas as cidades
              </Link>
              {porCidade.map(c => (
                <Link
                  key={c.slug}
                  href={`/${categoria}/${c.slug}`}
                  className="text-xs font-medium bg-white/15 text-white/90 rounded-full px-4 py-1.5 hover:bg-white/25 transition-colors"
                >
                  {c.nome} <span className="text-white/50">({c.qtd})</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-10">
        {negocios.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/[0.06] p-14 text-center">
            <p className="text-5xl mb-4">{cat?.icone || "🔍"}</p>
            <h2 className="font-display text-xl text-ink">Em breve por aqui</h2>
            <p className="text-sec text-sm mt-2 max-w-sm mx-auto">
              Ainda não temos {nome.toLowerCase()} cadastrados. Seja o primeiro!
            </p>
            <Link
              href="/painel/cadastro"
              className="mt-6 inline-block badge-gold text-white font-semibold text-sm rounded-full px-6 py-3 hover:brightness-105 transition-all"
            >
              Cadastre seu negócio grátis
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="eyebrow">{negocios.length} resultado{negocios.length !== 1 ? "s" : ""}</p>
              <Link
                href={`/busca?cat=${categoria}`}
                className="text-sm text-primary font-semibold flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                Busca avançada <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {negocios.map(n => <NegocioCard key={n.slug} negocio={n} />)}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
