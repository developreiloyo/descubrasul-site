import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, BadgeCheck, Star, SlidersHorizontal } from "lucide-react";
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

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<Record<string,string>> }
): Promise<Metadata> {
  const sp  = await searchParams;
  const q   = sp.q   || "";
  const cid = sp.cidade || "";
  const title = q
    ? `"${q}" — Busca | DescubraSul`
    : "Buscar negócios e produtos | DescubraSul";
  return {
    title,
    description: `Resultados de busca para ${q || "negócios"} ${cid ? `em ${cid}` : "no Sul de SC"}.`,
    robots: { index: false },
  };
}

function NegocioCard({ negocio }: { negocio: Negocio }) {
  const logo    = mediaUrl(negocio.logo);
  const catSlug = negocio.categoria?.slug || "";
  const cidSlug = slugifyCidade(negocio.cidade);

  return (
    <Link
      href={`/negocios/${cidSlug}/${catSlug}/${negocio.slug}`}
      className="card-hover bg-white rounded-2xl border border-black/[0.06] overflow-hidden flex gap-0 sm:gap-0 flex-col sm:flex-row"
    >
      {/* Logo */}
      <div className="relative w-full sm:w-36 h-36 sm:h-auto shrink-0 bg-gradient-to-br from-primary to-primary-light flex items-center justify-center overflow-hidden">
        {logo ? (
          <Image src={logo} alt={negocio.nome} fill className="object-cover" sizes="144px" />
        ) : (
          <span className="font-display text-white text-4xl opacity-80">{negocio.nome[0]}</span>
        )}
        {negocio.plano !== "gratuito" && (
          <span className="absolute top-2 left-2 badge-gold text-white text-[10px] font-bold rounded-full px-2 py-0.5">
            Destaque
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="font-semibold text-ink leading-tight">{negocio.nome}</h2>
            {negocio.verificado && <BadgeCheck className="size-4 text-primary shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-sec flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />{negocio.cidade}
            </span>
            {negocio.categoria?.nome && (
              <span className="bg-primary/8 text-primary rounded-full px-2 py-0.5 font-medium">
                {negocio.categoria.nome}
              </span>
            )}
          </div>
          {negocio.descricao && (
            <p className="text-sm text-ink/60 mt-2 line-clamp-2 leading-snug">{negocio.descricao}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          {negocio.total_avaliacoes > 0 ? (
            <span className="flex items-center gap-1 text-xs">
              <Star className="size-3.5 text-accent fill-accent" />
              <span className="font-semibold text-ink">{negocio.media_nota}</span>
              <span className="text-sec">({negocio.total_avaliacoes})</span>
            </span>
          ) : <span />}
          <span className="text-xs font-semibold text-primary hover:text-accent transition-colors">
            Ver negócio →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function BuscaPage(
  { searchParams }: { searchParams: Promise<Record<string,string>> }
) {
  const sp       = await searchParams;
  const q        = sp.q      || "";
  const cidadeP  = sp.cidade || "";
  const catParam = sp.cat    || "";

  const [categorias, negocios] = await Promise.all([
    getCategorias(),
    getNegocios({
      cidade:    cidadeP ? cidadeP.replace(/-/g," ") : undefined,
      categoria: catParam || undefined,
    }),
  ]);

  // Filtro por busca de texto no cliente (a API já filtra cidade/categoria)
  const filtrados = q
    ? negocios.filter((n) =>
        n.nome.toLowerCase().includes(q.toLowerCase()) ||
        n.descricao?.toLowerCase().includes(q.toLowerCase()) ||
        n.categoria?.nome?.toLowerCase().includes(q.toLowerCase())
      )
    : negocios;

  const schema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: q ? `Resultados para "${q}"` : "Busca DescubraSul",
    url: `https://descubrasul.com/busca${q ? `?q=${q}` : ""}`,
  };

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd data={schema} />
      <Navbar />

      {/* ── Barra de busca ────────────────────────── */}
      <div className="bg-primary hero-grid border-b border-primary-light/30">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <form method="GET" action="/busca" className="flex flex-col sm:flex-row gap-2">
            <label className="flex items-center gap-2.5 flex-1 bg-white rounded-xl px-4 py-3">
              <Search className="size-5 text-sec shrink-0" strokeWidth={1.5} />
              <input
                name="q"
                defaultValue={q}
                placeholder="Produto, loja ou serviço..."
                className="w-full text-sm outline-none placeholder:text-sec text-ink bg-transparent"
                autoFocus={!q}
              />
            </label>
            <label className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-3 sm:w-52">
              <MapPin className="size-5 text-sec shrink-0" strokeWidth={1.5} />
              <select
                name="cidade"
                defaultValue={cidadeP}
                className="w-full text-sm outline-none text-ink bg-transparent cursor-pointer"
              >
                <option value="">Todas as cidades</option>
                {CIDADES.map((c) => (
                  <option key={c} value={slugifyCidade(c)}>{c}</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="badge-gold text-white font-semibold text-sm rounded-xl px-7 py-3 flex items-center justify-center gap-2 hover:brightness-105 transition-all cursor-pointer"
            >
              <Search className="size-4" /> Buscar
            </button>
          </form>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Filtros laterais ──────────────────── */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-black/[0.06] p-5 sticky top-20">
              <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <SlidersHorizontal className="size-3.5" /> Filtrar por
              </p>

              <p className="text-xs font-semibold text-ink/70 mt-4 mb-2">Categoria</p>
              <div className="flex flex-col gap-1">
                <Link
                  href={`/busca?${new URLSearchParams({ ...(q && {q}), ...(cidadeP && {cidade: cidadeP}) }).toString()}`}
                  className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors ${!catParam ? "bg-primary text-white" : "text-sec hover:text-ink hover:bg-black/5"}`}
                >
                  Todas
                </Link>
                {categorias.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/busca?${new URLSearchParams({ ...(q && {q}), ...(cidadeP && {cidade: cidadeP}), cat: cat.slug }).toString()}`}
                    className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-2 ${catParam === cat.slug ? "bg-primary text-white" : "text-sec hover:text-ink hover:bg-black/5"}`}
                  >
                    <span>{cat.icone}</span> {cat.nome}
                  </Link>
                ))}
              </div>

              <p className="text-xs font-semibold text-ink/70 mt-5 mb-2">Cidade</p>
              <div className="flex flex-col gap-1">
                <Link
                  href={`/busca?${new URLSearchParams({ ...(q && {q}), ...(catParam && {cat: catParam}) }).toString()}`}
                  className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors ${!cidadeP ? "bg-primary text-white" : "text-sec hover:text-ink hover:bg-black/5"}`}
                >
                  Todas as cidades
                </Link>
                {CIDADES.map((c) => {
                  const slug = slugifyCidade(c);
                  return (
                    <Link
                      key={slug}
                      href={`/busca?${new URLSearchParams({ ...(q && {q}), ...(catParam && {cat: catParam}), cidade: slug }).toString()}`}
                      className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors ${cidadeP === slug ? "bg-primary text-white" : "text-sec hover:text-ink hover:bg-black/5"}`}
                    >
                      {c}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Resultados ────────────────────────── */}
          <section className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                {q ? (
                  <h1 className="font-display text-xl text-ink">
                    Resultados para <span className="text-primary">"{q}"</span>
                  </h1>
                ) : (
                  <h1 className="font-display text-xl text-ink">
                    {catParam
                      ? categorias.find(c => c.slug === catParam)?.nome || "Categoria"
                      : "Todos os negócios"}
                    {cidadeP && ` em ${cidadeP.replace(/-/g," ").replace(/\b\w/g, l => l.toUpperCase())}`}
                  </h1>
                )}
                <p className="text-sm text-sec mt-0.5">
                  {filtrados.length === 0
                    ? "Nenhum resultado encontrado."
                    : `${filtrados.length} negócio${filtrados.length !== 1 ? "s" : ""} encontrado${filtrados.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {filtrados.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.06] p-12 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <h2 className="font-display text-xl text-ink">Nenhum resultado</h2>
                <p className="text-sec text-sm mt-2">
                  Tente buscar por outro termo ou remova os filtros.
                </p>
                <Link href="/busca" className="mt-5 inline-block text-sm font-semibold text-primary hover:text-accent transition-colors">
                  Limpar filtros →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtrados.map((n) => <NegocioCard key={n.slug} negocio={n} />)}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
