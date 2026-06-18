import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Star, BadgeCheck, ArrowRight, CheckCircle2,
  Shirt, Smartphone, Utensils, Sparkles, Home as HomeIcon,
  Dumbbell, Baby, Car,
  UtensilsCrossed, ShoppingBag, Scissors, Heart, GraduationCap,
  Wrench, PawPrint, Apple, type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeroSearch } from "@/components/home/HeroSearch";
import { NegociosDestaque } from "@/components/home/NegociosDestaque";
import { getCategorias, getProdutosDestaque, getNegociosDestaque } from "@/lib/fetchers";
import { mediaUrl, linkWhatsApp } from "@/lib/utils";
import type { Produto } from "@/types";

export const metadata: Metadata = {
  title: "DescubraSul — O melhor do Sul de Santa Catarina",
  description: "Encontre empresas, produtos, restaurantes e serviços em Criciúma, Içara, Tubarão, Araranguá e toda a região Sul de SC.",
  alternates: { canonical: "https://descubrasul.com" },
  openGraph: {
    title: "DescubraSul — O melhor do Sul de Santa Catarina",
    description: "Encontre empresas, produtos e serviços em todo o Sul de Santa Catarina.",
    url: "https://descubrasul.com",
  },
};

const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DescubraSul",
  url: "https://descubrasul.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://descubrasul.com/busca?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const CIDADES = [
  { nome: "Criciúma",           slug: "criciuma",          qtd: "512 negócios" },
  { nome: "Içara",              slug: "icara",              qtd: "324 negócios" },
  { nome: "Araranguá",          slug: "ararangua",          qtd: "198 negócios" },
  { nome: "Tubarão",            slug: "tubarao",            qtd: "288 negócios" },
  { nome: "Forquilhinha",       slug: "forquilhinha",       qtd: "156 negócios" },
  { nome: "Morro da Fumaça",    slug: "morro-da-fumaca",    qtd: "98 negócios"  },
  { nome: "Balneário Rincão",   slug: "balneario-rincao",   qtd: "74 negócios"  },
];

const CAT_PILLS = [
  { label: "Tudo",        icon: null,          active: true  },
  { label: "Moda",        icon: Shirt,         active: false },
  { label: "Tecnologia",  icon: Smartphone,    active: false },
  { label: "Alimentos",   icon: Utensils,      active: false },
  { label: "Beleza",      icon: Sparkles,      active: false },
  { label: "Casa",        icon: HomeIcon,      active: false },
  { label: "Esporte",     icon: Dumbbell,      active: false },
  { label: "Infantil",    icon: Baby,          active: false },
  { label: "Automotivo",  icon: Car,           active: false },
];


const MOCK_PROMOS = [
  { off:"-25%", title:"Combo Família",      sub:"2 pizzas grandes + refri 1,5L",      price:"R$ 79,90",  store:"Pizzaria Sabores · Criciúma", prazo:"válido até domingo" },
  { off:"-30%", title:"Kit Skincare",       sub:"3 produtos por preço especial",       price:"R$ 109,90", store:"Studio Bella Vita · Tubarão", prazo:"somente esta semana" },
  { off:"-24%", title:"Tênis + Meia",       sub:"kit esportivo completo",              price:"R$ 199,90", store:"Sports Zone · Içara",         prazo:"agende até sexta" },
];

const BENEFICIOS = [
  "Vitrine de produtos","WhatsApp integrado","Sem comissão",
  "Pedidos diretos","SEO para o Google","Métricas e insights",
  "Fotos profissionais","Gestão simples",
];


const CAT_ICONS: Record<string, LucideIcon> = {
  restaurantes: UtensilsCrossed,
  moda:         Shirt,
  estetica:     Scissors,
  academias:    Dumbbell,
  "pet-shop":   PawPrint,
  clinicas:     Heart,
  educacao:     GraduationCap,
  "lojas-gerais": ShoppingBag,
  servicos:     Wrench,
  alimentacao:  Apple,
};

/* ── Componente ProductCard ── */
function ProductCard({ produto }: { produto: Produto }) {
  const fotoUrl  = produto.foto ? mediaUrl(produto.foto) : (produto.fotos[0]?.foto ? mediaUrl(produto.fotos[0].foto) : null);
  const cidSlug  = produto.negocio.cidade.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
  const negLink  = `/negocios/${cidSlug}/${produto.negocio.categoria_slug}/${produto.negocio.slug}`;
  const waLink   = linkWhatsApp(produto.negocio.whatsapp, `Olá! Vi o produto *${produto.nome}* no DescubraSul e tenho interesse.`);
  const preco    = produto.preco ? `R$ ${parseFloat(produto.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : null;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden group card-hover">
      <Link href={negLink} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          {fotoUrl ? (
            <Image src={fotoUrl} alt={produto.alt_foto || produto.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px)50vw,20vw" />
          ) : (
            <span className="text-4xl opacity-30">{produto.negocio.categoria[0]}</span>
          )}
          {preco && (
            <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold rounded-full px-2.5 py-1 z-10 shadow-sm">
              {preco}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-extrabold flex items-center justify-center shrink-0">
            {produto.negocio.nome[0]}
          </span>
          <span className="text-[11px] text-sec font-medium truncate">{produto.negocio.nome}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto shrink-0" />
          <span className="text-[10px] text-sec">{produto.negocio.cidade}</span>
        </div>
        <Link href={negLink}>
          <p className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-3 hover:text-primary transition-colors">{produto.nome}</p>
        </Link>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-primary/8 hover:bg-primary hover:text-white text-primary text-xs font-semibold rounded-xl py-2 flex items-center justify-center gap-1.5 transition-all duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          Pedir via WhatsApp
        </a>
      </div>
    </div>
  );
}


/* ── PAGE ── */
export default async function Home() {
  const [categorias, produtosDestaque, negociosDestaque] = await Promise.all([
    getCategorias(),
    getProdutosDestaque(10),
    getNegociosDestaque(12),
  ]);

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd data={schemaWebSite} />
      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <header className="bg-primary hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light/60" />
        {/* Glow accent decorativo */}
        <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-light/20 blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 py-10 lg:py-24 relative z-10 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-center">
          <div className="text-center lg:text-left">
            <p className="animate-fade-up inline-flex items-center gap-2 text-accent eyebrow mb-3 lg:mb-5 border border-accent/25 rounded-full px-4 py-1.5 bg-accent/5">
              <MapPin className="size-3.5" /> A vitrine digital do Sul catarinense
            </p>
            <h1 className="animate-fade-up delay-100 font-display text-white text-[2rem] sm:text-[2.6rem] lg:text-[3.6rem] leading-[1.08] tracking-tight">
              Encontre o <span className="text-gradient">melhor</span> do Sul de Santa Catarina
            </h1>
            <p className="animate-fade-up delay-200 text-white/65 text-sm lg:text-[1.1rem] mt-3 lg:mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Produtos, empresas, restaurantes e serviços da sua região — num só lugar.
            </p>

            <div className="animate-fade-up delay-300">
              <HeroSearch />
            </div>

            <div className="animate-fade-up delay-400 hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-5">
              <span className="text-white/40 text-xs font-medium">Popular:</span>
              {["Tênis esportivo","Pizza artesanal","Mochila escolar","Skincare natural"].map((t) => (
                <Link key={t} href={`/busca?q=${encodeURIComponent(t)}`}
                  className="text-xs text-white/75 border border-white/15 rounded-full px-3 py-1 hover:border-accent/60 hover:text-accent transition-all duration-200">
                  {t}
                </Link>
              ))}
            </div>

            {/* Stats — compactos em mobile, expandidos em desktop */}
            <div className="animate-fade-up delay-500 flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-5 mt-5 lg:mt-7 pt-5 lg:pt-7 border-t border-white/10">
              {[
                { valor: "+2.500", label: "negócios" },
                { valor: "+18k",   label: "produtos"  },
                { valor: "6",      label: "cidades"   },
                { valor: "+120k",  label: "visitas/mês"},
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-1">
                  <span className="font-display text-accent text-lg lg:text-2xl">{s.valor}</span>
                  <span className="text-white/45 text-[11px] lg:text-xs">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa SVG animado */}
          <div className="hidden lg:block relative">
            <svg viewBox="0 0 420 440" className="w-full max-w-[400px] mx-auto drop-shadow-2xl">
              <defs>
                <linearGradient id="mapfill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="rgba(255,255,255,.06)" />
                  <stop offset="1" stopColor="rgba(212,164,55,.08)" />
                </linearGradient>
              </defs>
              <path d="M210 28 C280 20,332 64,348 122 C362 174,396 198,388 252 C380 308,330 336,296 376 C266 412,210 428,158 410 C104 392,66 348,54 292 C42 238,60 186,92 142 C126 96,146 36,210 28 Z"
                fill="url(#mapfill)" stroke="rgba(212,164,55,.5)" strokeWidth="1.5" strokeDasharray="6 5" />
              <g className="floaty">
                <g transform="translate(258,96)">
                  <circle className="city-ring" r="9" fill="none" stroke="#D4A437" strokeWidth="1.5" />
                  <circle r="5" fill="#D4A437" />
                  <text x="14" y="4" fill="#fff" fontSize="12" fontWeight="600">Tubarão</text>
                </g>
                <g transform="translate(214,206)">
                  <circle className="city-ring" style={{animationDelay:".5s"}} r="11" fill="none" stroke="#D4A437" strokeWidth="1.5" />
                  <circle r="7" fill="#D4A437" />
                  <text x="17" y="4" fill="#fff" fontSize="13" fontWeight="700">Criciúma</text>
                </g>
                <g transform="translate(296,236)">
                  <circle className="city-ring" style={{animationDelay:"1.2s"}} r="8" fill="none" stroke="#D4A437" strokeWidth="1.5" />
                  <circle r="5" fill="#D4A437" />
                  <text x="12" y="4" fill="#fff" fontSize="12" fontWeight="600">Içara</text>
                </g>
                <g transform="translate(196,344)">
                  <circle className="city-ring" style={{animationDelay:"2.1s"}} r="8" fill="none" stroke="#D4A437" strokeWidth="1.5" />
                  <circle r="5" fill="#D4A437" />
                  <text x="12" y="4" fill="#fff" fontSize="12" fontWeight="600">Araranguá</text>
                </g>
                <path d="M258 96 L214 206 L296 236 M214 206 L196 344"
                  stroke="rgba(212,164,55,.28)" strokeWidth="1" fill="none" strokeDasharray="3 4" />
              </g>
            </svg>
            {/* Cards flutuantes com glass effect */}
            <div className="glass-card absolute top-8 -left-4 rounded-2xl px-4 py-3 flex items-center gap-3 w-56 floaty">
              <span className="w-10 h-10 rounded-xl bg-primary text-white font-extrabold flex items-center justify-center shrink-0 text-sm">CN</span>
              <div className="min-w-0">
                <p className="text-ink font-semibold text-xs truncate">Cantina Nonna Rosa</p>
                <p className="text-sec text-[10px]">Recém-cadastrado · Criciúma</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Star className="size-3 text-accent fill-accent" />
                  <span className="text-[10px] font-semibold text-ink">4,9</span>
                </div>
              </div>
            </div>
            <div className="glass-card absolute bottom-12 -right-2 rounded-2xl px-4 py-3 flex items-center gap-3 w-48"
              style={{animation:"floaty 7s ease-in-out 1.5s infinite"}}>
              <span className="w-10 h-10 rounded-xl badge-gold text-white font-extrabold flex items-center justify-center shrink-0 text-sm">SZ</span>
              <div className="min-w-0">
                <p className="text-ink font-semibold text-xs truncate">Sports Zone</p>
                <p className="text-sec text-[10px]">18 produtos · Içara</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Star className="size-3 text-accent fill-accent" />
                  <span className="text-[10px] font-semibold text-ink">4,7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── PILLS DE CATEGORIAS ──────────────────────────── */}
      <div className="border-b border-black/5 bg-white sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CAT_PILLS.map(({ label, icon: Icon, active }) => (
            <Link
              key={label}
              href={active ? "/" : `/marketplace?cat=${label.toLowerCase()}`}
              className={`shrink-0 text-sm font-medium border rounded-full px-4 py-2 flex items-center gap-1.5 transition-colors ${
                active
                  ? "bg-primary text-white border-primary"
                  : "text-sec border-black/10 hover:border-primary hover:text-ink"
              }`}
            >
              {Icon && <Icon className="size-4" />}
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── PRODUTOS EM DESTAQUE ─────────────────────────── */}
      {produtosDestaque.length > 0 && (
        <section className="py-14 lg:py-20 max-w-[1200px] mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Marketplace local</p>
              <h2 className="font-display text-2xl lg:text-[2rem] text-ink">Produtos em destaque</h2>
              <p className="text-sec text-sm mt-1.5">Das melhores lojas do Sul catarinense, direto para você.</p>
            </div>
            <Link href="/marketplace" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors duration-200">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {produtosDestaque.map((p) => <ProductCard key={p.slug} produto={p} />)}
          </div>
        </section>
      )}



      {/* ── NEGÓCIOS EM DESTAQUE ────────────────────────── */}
      <NegociosDestaque negocios={negociosDestaque} />

      {/* ── CATEGORIAS (do backend) ─────────────────────── */}
      {categorias.length > 0 && (
        <section id="categorias" className="py-14 lg:py-20 max-w-[1200px] mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Explorar</p>
              <h2 className="font-display text-2xl lg:text-[2rem] text-ink">Navegue por categorias</h2>
              <p className="text-sec text-sm mt-1.5">Tudo o que a região oferece, organizado para você.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {categorias.map((cat) => {
              const Icon = CAT_ICONS[cat.slug] ?? ShoppingBag;
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="card-hover bg-white rounded-2xl border border-black/[0.06] p-5 flex flex-col gap-4 group"
                >
                  <span className="w-16 h-16 rounded-2xl bg-primary/8 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    <Icon className="size-8" />
                  </span>
                  <p className="font-semibold text-base text-ink leading-tight group-hover:text-primary transition-colors">
                    {cat.nome}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PROMOÇÕES ──────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Por tempo limitado</p>
              <h2 className="font-display text-2xl lg:text-[2rem] text-ink">Promoções especiais</h2>
              <p className="text-sec text-sm mt-1.5">Ofertas exclusivas dos negócios da região.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {MOCK_PROMOS.map((p) => (
              <div key={p.title} className="card-hover bg-white rounded-2xl border-2 border-accent/40 p-6 relative overflow-hidden cursor-pointer">
                <span className="absolute -right-7 -top-7 w-24 h-24 rounded-full bg-accent/10" />
                <span className="badge-gold text-white font-extrabold text-xl rounded-xl px-3 py-1.5 inline-block">{p.off}</span>
                <p className="font-bold text-lg text-ink mt-4">{p.title}</p>
                <p className="text-sm text-sec">{p.sub}</p>
                <p className="font-extrabold text-2xl text-primary mt-3">{p.price}</p>
                <p className="text-xs text-sec mt-1">{p.store}</p>
                <div className="flex items-center justify-between mt-5">
                  <span className="text-[11px] font-medium text-accent-dark">{p.prazo}</span>
                  <span className="text-sm font-semibold text-primary flex items-center gap-1">Aproveitar <ArrowRight className="size-4" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CIDADES ────────────────────────────────────── */}
      <section className="py-14 lg:py-20 max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-10">
          <p className="eyebrow mb-2">Região Sul de SC</p>
          <h2 className="font-display text-2xl lg:text-[2rem] text-ink">Explorar por cidade</h2>
          <p className="text-sec text-sm mt-1.5 max-w-md mx-auto">O Sul de Santa Catarina inteiro, cidade por cidade.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {CIDADES.map((city, ix) => (
            <Link
              key={city.slug}
              href={`/cidades/${city.slug}`}
              className="card-hover relative rounded-2xl overflow-hidden h-40 lg:h-48 block hero-grid group"
              style={{background:`linear-gradient(160deg,#155C45 ${ix*3}%,#0B3B2C)`}}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300" />
              <span className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-white text-xl leading-tight">{city.nome}</p>
                <p className="text-white/60 text-xs mt-0.5 font-medium">{city.qtd}</p>
              </span>
              <MapPin className="absolute top-4 right-4 size-4.5 text-accent opacity-80 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA PARA EMPRESAS ──────────────────────────── */}
      <section className="py-16 lg:py-24 bg-primary hero-grid relative overflow-hidden">
        <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 relative grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="eyebrow text-accent/80 border-accent/20 bg-accent/8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5">
              Para empresas e empreendedores
            </p>
            <h2 className="font-display text-white text-3xl lg:text-[2.6rem] leading-tight">
              Venda para toda a região sem pagar comissão
            </h2>
            <p className="text-white/60 mt-4 max-w-md leading-relaxed">
              Cadastre sua loja, adicione produtos e receba pedidos direto no WhatsApp — sem burocracia, sem taxas.
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-8">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-white/80">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4 mt-9">
              <Link href="/painel/cadastro"
                className="btn-primary badge-gold text-white font-semibold text-sm rounded-full px-7 py-3.5 shadow-lg hover:brightness-110 transition-all duration-200">
                Cadastre sua loja grátis
              </Link>
              <Link href="/planos" className="text-white/70 text-sm font-medium hover:text-accent transition-colors duration-200 flex items-center gap-1.5">
                Ver planos <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          {/* Benefícios visuais — planos */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { titulo: "Plano Básico", preco: "R$ 79", periodo: "/mês", desc: "Até 20 produtos · Vitrine digital" },
              { titulo: "Plano Pro",    preco: "R$ 197", periodo: "/mês", desc: "Ilimitado · Métricas · IA" },
              { titulo: "Produção",     preco: "R$ 397", periodo: "/mês", desc: "Fotos · Vídeos · Destaque" },
              { titulo: "Fundador",     preco: "R$ 599", periodo: "/ano", desc: "50 vagas · Acesso total" },
            ].map((p) => (
              <div key={p.titulo} className="bg-white/8 hover:bg-white/12 transition-colors duration-200 rounded-2xl p-5 border border-white/10 backdrop-blur-sm cursor-pointer">
                <p className="text-white/60 text-[11px] font-medium uppercase tracking-wide">{p.titulo}</p>
                <p className="mt-1">
                  <span className="font-display text-accent text-2xl">{p.preco}</span>
                  <span className="text-white/40 text-xs ml-1">{p.periodo}</span>
                </p>
                <p className="text-white/50 text-xs mt-2 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTO ─────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-[720px] mx-auto px-4">
          <div className="bg-cream rounded-3xl p-8 lg:p-10 border border-black/5 relative overflow-hidden">
            <span className="absolute -top-4 -right-4 font-display text-[8rem] text-primary/5 leading-none select-none">"</span>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="size-4 text-accent fill-accent" />)}
              <span className="font-semibold text-ink ml-2 text-sm">4,9</span>
            </div>
            <p className="font-display text-ink text-xl lg:text-2xl leading-snug relative z-10">
              "Cadastrei minha loja e em duas semanas já tinha clientes novos chegando pelo DescubraSul."
            </p>
            <p className="text-sec text-sm mt-3 leading-relaxed">
              Muito mais fácil do que ter meu próprio site — e sem pagar comissão em cada venda.
            </p>
            <div className="flex items-center gap-3 mt-7 pt-6 border-t border-black/6">
              <span className="w-11 h-11 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shrink-0">MR</span>
              <div>
                <p className="text-sm font-semibold text-ink">Marcos Rocha</p>
                <p className="text-xs text-sec">Sports Zone · Içara · Plano Pro</p>
              </div>
              <BadgeCheck className="size-5 text-primary ml-auto shrink-0" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
