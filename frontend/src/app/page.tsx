import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, BadgeCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeroSearch } from "@/components/home/HeroSearch";
import { Gallery4 } from "@/components/blocks/gallery4";
import { getCategorias, getNegocios } from "@/lib/fetchers";
import { mediaUrl } from "@/lib/utils";
import type { Negocio } from "@/types";

export const metadata: Metadata = {
  title: "DescubraSul — O melhor do Sul de Santa Catarina",
  description:
    "Encontre empresas, restaurantes, serviços e oportunidades em Criciúma, Içara, Tubarão, Araranguá e toda a região Sul de SC.",
  alternates: { canonical: "https://descubrasul.com" },
  openGraph: {
    title: "DescubraSul — O melhor do Sul de Santa Catarina",
    description:
      "Encontre empresas, restaurantes, serviços e oportunidades em Criciúma, Içara, Tubarão e toda a região Sul de SC.",
    url: "https://descubrasul.com",
  },
};

const CIDADES = [
  { nome: "Criciúma",        slug: "criciuma",        cor: "from-teal-900 to-teal-700"     },
  { nome: "Içara",           slug: "icara",            cor: "from-emerald-900 to-emerald-700" },
  { nome: "Araranguá",       slug: "ararangua",        cor: "from-cyan-900 to-cyan-700"     },
  { nome: "Tubarão",         slug: "tubarao",          cor: "from-sky-900 to-sky-700"       },
  { nome: "Forquilhinha",    slug: "forquilhinha",     cor: "from-indigo-800 to-indigo-600" },
  { nome: "Morro da Fumaça", slug: "morro-da-fumaca",  cor: "from-violet-800 to-violet-600" },
];

const BENEFICIOS = [
  "Perfil profissional",
  "WhatsApp integrado",
  "SEO para o Google",
  "Fotos e vídeos",
  "Publicidade local",
  "Métricas e insights",
  "Google Maps",
  "Cardápio digital",
];

const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DescubraSul",
  url: "https://descubrasul.com",
  description: "O maior diretório de negócios locais do Sul de Santa Catarina.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://descubrasul.com/busca?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

function BusinessCard({ negocio }: { negocio: Negocio }) {
  const logoUrl = negocio.logo ? mediaUrl(negocio.logo) : null;
  const catSlug = negocio.categoria?.slug || "";
  const cidade = negocio.cidade;
  const cidadeFormatada = cidade.charAt(0).toUpperCase() + cidade.slice(1);

  return (
    <Link
      href={`/negocios/${cidade}/${catSlug}/${negocio.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-ink/5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Capa */}
      <div className="relative aspect-[16/9] bg-primary/10 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={negocio.alt_logo || negocio.nome}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <span className="text-5xl">{negocio.categoria?.icone || "🏪"}</span>
        )}
        {negocio.plano !== "gratuito" && (
          <span className="absolute top-3 right-3 bg-secondary text-white px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">
            Destaque
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="relative px-4 pb-4 pt-0">
        {/* Avatar flutuante */}
        <div className="absolute -top-5 left-4 size-10 rounded-full border-2 border-white bg-primary flex items-center justify-center shadow-sm overflow-hidden">
          {logoUrl ? (
            <Image src={logoUrl} alt="" fill className="object-cover" sizes="40px" />
          ) : (
            <span className="text-white font-bold text-base">{negocio.nome.charAt(0)}</span>
          )}
        </div>

        <div className="mt-7">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-ink truncate">{negocio.nome}</h3>
            {negocio.verificado && (
              <BadgeCheck className="size-4 text-primary shrink-0" />
            )}
          </div>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {negocio.categoria?.nome}
          </span>
          <div className="mt-3 flex items-center gap-3 text-xs text-ink/50">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {cidadeFormatada}
            </span>
            {negocio.total_avaliacoes > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-ink/70">{negocio.media_nota}</span>
                  <span>({negocio.total_avaliacoes})</span>
                </span>
              </>
            )}
          </div>
        </div>
        <span className="mt-4 block text-center py-2.5 bg-primary text-white text-sm font-semibold rounded-xl group-hover:bg-primary-dark transition-colors">
          Ver negócio
        </span>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [categorias, negocios] = await Promise.all([
    getCategorias(),
    getNegocios(),
  ]);

  const destaques = negocios.slice(0, 4);

  return (
    <div className="min-h-screen bg-surface">
      <JsonLd data={schemaWebSite} />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header className="relative bg-primary overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 lg:py-24 text-center">
          <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            Descubra o <span className="text-secondary">melhor</span>
            <br />
            do Sul de Santa Catarina
          </h1>
          <p className="mt-4 text-white/80 text-base lg:text-lg max-w-2xl mx-auto">
            Empresas, restaurantes, serviços e oportunidades em um único lugar.
          </p>

          <HeroSearch />

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 justify-center text-xs text-white/60 font-medium">
            <span>+500 negócios cadastrados</span>
            <span>·</span>
            <span>6 cidades</span>
            <span>·</span>
            <span>100% regional</span>
          </div>
        </div>
      </header>

      {/* ── Categorias ────────────────────────────────────────────── */}
      {categorias.length > 0 && (
        <section id="categorias" className="py-14 lg:py-20 max-w-6xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-ink">
            Categorias em destaque
          </h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categorias.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-ink/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">{cat.icone}</span>
                </div>
                <span className="text-sm font-medium text-ink/80 leading-snug">
                  {cat.nome}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Gallery4: Carrossel de destaque ──────────────────────── */}
      <Gallery4 />

      {/* ── Empresas em destaque ──────────────────────────────────── */}
      {destaques.length > 0 && (
        <section className="py-14 lg:py-20 bg-[#f3f2ef]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-ink">
                  Conheça empresas que movem nossa região
                </h2>
                <p className="mt-2 text-ink/50 text-sm max-w-xl">
                  Negócios locais que oferecem qualidade e confiança perto de você.
                </p>
              </div>
              <Link
                href="/busca"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors shrink-0 pb-0.5"
              >
                Ver todos
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destaques.map((n) => (
                <BusinessCard key={n.slug} negocio={n} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Cidades ───────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-ink">
          Cidades que conectamos
        </h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {CIDADES.map((city) => (
            <Link
              key={city.slug}
              href={`/cidades/${city.slug}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${city.cor} shadow-sm hover:shadow-lg transition-all duration-200`}
            >
              <div className="aspect-[4/3]" />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-extrabold text-white leading-tight">
                  {city.nome}
                </h3>
                <p className="mt-0.5 text-xs text-white/75 font-medium">Sul de SC</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA Para Empresas ─────────────────────────────────────── */}
      <section className="bg-primary py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              Faça seu negócio crescer com o DescubraSul
            </h2>
            <p className="mt-4 text-white/80 text-base max-w-xl">
              Seja visto por milhares de consumidores na região. Nossa plataforma
              oferece visibilidade, ferramentas digitais e suporte para alavancar
              suas vendas.
            </p>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-white">
                  <CheckCircle2
                    className="size-5 text-secondary shrink-0"
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                href="/painel/cadastro"
                className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-secondary/90 transition-colors shadow-lg"
              >
                Cadastre seu negócio grátis
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>

          {/* Stats decorativos */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { label: "Negócios cadastrados", valor: "500+" },
              { label: "Cidades atendidas",    valor: "6"    },
              { label: "Cliques por mês",      valor: "10k+" },
              { label: "100% regional",        valor: "SC"   },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
              >
                <p className="text-3xl font-black text-secondary">{stat.valor}</p>
                <p className="mt-1 text-xs text-white/70 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
