import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Star, BadgeCheck, ArrowRight, CheckCircle2,
  Shirt, Smartphone, Utensils, Sparkles, Home as HomeIcon,
  Dumbbell, Baby, Car, Search,
} from "lucide-react";
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
  { nome: "Criciúma",        slug: "criciuma",       qtd: "512 negócios" },
  { nome: "Içara",           slug: "icara",           qtd: "324 negócios" },
  { nome: "Araranguá",       slug: "ararangua",       qtd: "198 negócios" },
  { nome: "Tubarão",         slug: "tubarao",         qtd: "288 negócios" },
  { nome: "Forquilhinha",    slug: "forquilhinha",    qtd: "156 negócios" },
  { nome: "Morro da Fumaça", slug: "morro-da-fumaca", qtd: "98 negócios"  },
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

const MOCK_PRODUCTS = [
  { name:"Tênis Running Pro X",        store:"Sports Zone",      city:"Içara",      cat:"Esporte",    price:"R$ 189,90", old:"R$ 249,90", off:"-24%", rating:"4,8", reviews:"64",  color:"#1E3A5F", badge:"Mais vendido", isNew:false },
  { name:"Mochila Adventure 30L",      store:"Papelaria Central",city:"Criciúma",   cat:"Infantil",   price:"R$ 119,90", old:"",          off:"",     rating:"4,9", reviews:"128", color:"#2E6B4F", badge:"",             isNew:true  },
  { name:"Creme Hidratante 500ml",     store:"Studio Bella Vita",city:"Tubarão",    cat:"Beleza",     price:"R$ 49,90",  old:"R$ 69,90",  off:"-29%", rating:"4,7", reviews:"95",  color:"#6B3A6B", badge:"Promoção",      isNew:false },
  { name:"Smartphone Case Magsafe",    store:"TechStore SC",     city:"Criciúma",   cat:"Tecnologia", price:"R$ 79,90",  old:"",          off:"",     rating:"4,6", reviews:"42",  color:"#1A3A5C", badge:"",             isNew:true  },
  { name:"Vestido Floral Verão",       store:"Boutique Liz",     city:"Araranguá",  cat:"Moda",       price:"R$ 134,90", old:"R$ 179,90", off:"-25%", rating:"4,9", reviews:"83",  color:"#7A2E5E", badge:"Em alta",       isNew:false },
  { name:"Conjunto de Panelas Antiaderente", store:"Casa & Lar", city:"Forquilhinha",cat:"Casa",      price:"R$ 249,90", old:"R$ 320,00", off:"-22%", rating:"4,8", reviews:"57",  color:"#4A3E2E", badge:"",             isNew:false },
  { name:"Whey Protein 900g",          store:"Nutri Sul",        city:"Criciúma",   cat:"Esporte",    price:"R$ 139,90", old:"",          off:"",     rating:"4,7", reviews:"210", color:"#2E5A3A", badge:"Mais vendido",  isNew:false },
  { name:"Fone Bluetooth Pro",         store:"TechStore SC",     city:"Criciúma",   cat:"Tecnologia", price:"R$ 219,90", old:"R$ 299,90", off:"-27%", rating:"4,8", reviews:"76",  color:"#1A1A2E", badge:"Promoção",      isNew:false },
  { name:"Sandália Conforto Feminina", store:"Passos Certos",    city:"Tubarão",    cat:"Moda",       price:"R$ 89,90",  old:"",          off:"",     rating:"4,6", reviews:"39",  color:"#6B4A2E", badge:"",             isNew:true  },
  { name:"Kit Skincare Natural 3 Pcs", store:"Studio Bella Vita",city:"Tubarão",    cat:"Beleza",     price:"R$ 109,90", old:"R$ 149,90", off:"-27%", rating:"4,9", reviews:"147", color:"#3A5E4A", badge:"Kit especial",  isNew:false },
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

const STATS = [
  { valor:"+2.500", label:"Negócios cadastrados" },
  { valor:"+18k",   label:"Produtos listados"    },
  { valor:"6",      label:"Cidades atendidas"    },
  { valor:"+120k",  label:"Usuários/mês"         },
];

/* ── Componente ProductCard ── */
function ProductCard({ p }: { p: typeof MOCK_PRODUCTS[0] }) {
  return (
    <div className="product-card bg-white rounded-2xl border border-black/[0.06] overflow-hidden group cursor-pointer card-hover">
      {/* Imagem */}
      <div
        className="relative aspect-square overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(145deg,${p.color}dd,${p.color}88)` }}
      >
        {p.off && (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-bold rounded-full px-2.5 py-1 z-10">
            {p.off}
          </span>
        )}
        {!p.off && p.isNew && (
          <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold rounded-full px-2.5 py-1 z-10">
            Novo
          </span>
        )}
        {!p.off && !p.isNew && p.badge && (
          <span className="absolute top-2.5 left-2.5 bg-black/45 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full px-2.5 py-1 z-10">
            {p.badge}
          </span>
        )}
        {/* CTA hover */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <button className="w-full bg-white/95 backdrop-blur text-primary text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            Comprar via WhatsApp
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-extrabold flex items-center justify-center shrink-0">
            {p.store[0]}
          </span>
          <span className="text-[11px] text-sec font-medium truncate">{p.store}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          <span className="text-[10px] text-sec truncate">{p.city}</span>
        </div>
        <p className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-2">{p.name}</p>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-extrabold text-base text-primary">{p.price}</span>
          {p.old && <span className="text-xs text-sec line-through">{p.old}</span>}
        </div>
        <div className="flex items-center gap-1">
          <Star className="size-3.5 text-accent fill-accent shrink-0" />
          <span className="text-xs font-semibold text-ink">{p.rating}</span>
          <span className="text-[11px] text-sec">({p.reviews})</span>
          <span className="ml-auto text-[10px] font-medium text-primary bg-primary/8 rounded-full px-2 py-0.5">{p.cat}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Componente StoreCard ── */
function StoreCard({ negocio }: { negocio: Negocio }) {
  const logoUrl = negocio.logo ? mediaUrl(negocio.logo) : null;
  const catSlug = negocio.categoria?.slug || "";
  const cidade  = negocio.cidade;

  return (
    <Link
      href={`/negocios/${cidade}/${catSlug}/${negocio.slug}`}
      className="card-hover bg-white rounded-2xl border border-black/5 overflow-hidden block"
    >
      <div className="relative h-32 bg-gradient-to-br from-primary-light to-primary flex items-center justify-center overflow-hidden">
        {logoUrl && (
          <Image src={logoUrl} alt={negocio.nome} fill className="object-cover" sizes="(max-width:640px)100vw,25vw" />
        )}
        {negocio.plano !== "gratuito" && (
          <span className="absolute top-3 left-3 badge-gold text-white text-[10px] font-bold rounded-full px-2.5 py-1">Destaque</span>
        )}
        <span className="absolute -bottom-5 left-4 w-10 h-10 rounded-xl bg-white shadow-md font-extrabold text-primary flex items-center justify-center">
          {negocio.nome.charAt(0)}
        </span>
      </div>
      <div className="p-4 pt-7">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-ink leading-tight truncate">{negocio.nome}</p>
          {negocio.verificado && <BadgeCheck className="size-4 text-primary shrink-0" />}
        </div>
        <p className="text-xs text-sec mt-1">{negocio.categoria?.nome}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-sec">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" />{cidade}</span>
          {negocio.total_avaliacoes > 0 && (
            <span className="flex items-center gap-1 font-semibold text-ink">
              <Star className="size-3.5 text-accent fill-accent" />
              {negocio.media_nota}
              <span className="text-sec font-normal">({negocio.total_avaliacoes})</span>
            </span>
          )}
        </div>
        <span className="mt-4 block text-center text-sm font-semibold text-primary border border-primary/25 rounded-full py-2 hover:bg-primary hover:text-white transition-colors">
          Ver produtos
        </span>
      </div>
    </Link>
  );
}

/* ── PAGE ── */
export default async function Home() {
  const [categorias, negocios] = await Promise.all([getCategorias(), getNegocios()]);
  const destaques = negocios.slice(0, 4);

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd data={schemaWebSite} />
      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <header className="bg-primary hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light/70" />
        <div className="max-w-[1200px] mx-auto px-4 py-14 lg:py-20 relative z-10 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 text-accent text-xs font-semibold tracking-[.18em] uppercase mb-5 border border-accent/30 rounded-full px-4 py-1.5">
              <MapPin className="size-3.5" /> A vitrine digital do Sul catarinense
            </p>
            <h1 className="font-extrabold text-white text-4xl lg:text-[52px] leading-[1.08] tracking-tight">
              Encontre o <span className="text-accent">melhor</span> do<br className="hidden lg:block" /> Sul de Santa Catarina
            </h1>
            <p className="text-white/70 text-base lg:text-lg mt-5 max-w-xl mx-auto lg:mx-0">
              Produtos, empresas, restaurantes e serviços da sua região — em um único lugar.
            </p>

            <HeroSearch />

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-5">
              <span className="text-white/50 text-xs">Popular:</span>
              {["Tênis esportivo","Pizza artesanal","Mochila escolar","Hidratação capilar"].map((t) => (
                <Link key={t} href={`/busca?q=${t}`} className="text-xs text-white/85 border border-white/20 rounded-full px-3 py-1 hover:border-accent hover:text-accent transition-colors">{t}</Link>
              ))}
            </div>
            <p className="text-white/60 text-sm mt-6 flex items-center justify-center lg:justify-start gap-2">
              <BadgeCheck className="size-4 text-accent" />
              +2.500 negócios · +18.000 produtos · 6 cidades · 100% regional
            </p>
          </div>

          {/* Mapa SVG animado */}
          <div className="hidden lg:block relative">
            <svg viewBox="0 0 420 440" className="w-full max-w-[420px] mx-auto drop-shadow-2xl">
              <defs>
                <linearGradient id="mapfill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="rgba(255,255,255,.07)" />
                  <stop offset="1" stopColor="rgba(212,164,55,.06)" />
                </linearGradient>
              </defs>
              <path d="M210 28 C280 20,332 64,348 122 C362 174,396 198,388 252 C380 308,330 336,296 376 C266 412,210 428,158 410 C104 392,66 348,54 292 C42 238,60 186,92 142 C126 96,146 36,210 28 Z"
                fill="url(#mapfill)" stroke="rgba(212,164,55,.55)" strokeWidth="1.6" strokeDasharray="6 5" />
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
                <path d="M258 96 L214 206 L296 236 M214 206 L196 344" stroke="rgba(212,164,55,.3)" strokeWidth="1" fill="none" strokeDasharray="3 4" />
              </g>
            </svg>
            {/* Cards flutuantes */}
            <div className="absolute top-8 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 w-52 floaty">
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
            <div className="absolute bottom-12 -right-2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 w-48" style={{animation:"floaty 7s ease-in-out 1.5s infinite"}}>
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
      <section className="py-12 lg:py-16 max-w-[1200px] mx-auto px-4">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-accent text-xs font-semibold tracking-[.16em] uppercase mb-1.5">Marketplace local</p>
            <h2 className="font-bold text-2xl lg:text-3xl text-ink tracking-tight">Produtos em destaque</h2>
            <p className="text-sec text-sm mt-1">Das melhores lojas do Sul catarinense, direto para você.</p>
          </div>
          <Link href="/marketplace" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent-dark transition-colors">
            Ver todos <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {MOCK_PRODUCTS.map((p) => <ProductCard key={p.name} p={p} />)}
        </div>
      </section>

      {/* ── CARROSSEL Gallery4 ───────────────────────────── */}
      <Gallery4 />

      {/* ── LOJAS EM DESTAQUE ───────────────────────────── */}
      {destaques.length > 0 && (
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-end justify-between mb-7">
              <div>
                <h2 className="font-bold text-2xl lg:text-3xl text-ink tracking-tight">Lojas em destaque</h2>
                <p className="text-sec text-sm mt-1">Os negócios mais visitados da semana.</p>
              </div>
              <Link href="/busca" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent-dark transition-colors">
                Ver todas <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {destaques.map((n) => <StoreCard key={n.slug} negocio={n} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIAS (do backend) ─────────────────────── */}
      {categorias.length > 0 && (
        <section id="categorias" className="py-12 lg:py-16 max-w-[1200px] mx-auto px-4">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="font-bold text-2xl lg:text-3xl text-ink tracking-tight">Explore por categorias</h2>
              <p className="text-sec text-sm mt-1">Tudo o que a região oferece, organizado para você.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {categorias.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="card-hover bg-white rounded-2xl border border-black/5 p-5 flex flex-col gap-3 group"
              >
                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-2xl">
                  {cat.icone}
                </span>
                <span>
                  <p className="font-bold text-[15px] text-ink leading-tight">{cat.nome}</p>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PROMOÇÕES ──────────────────────────────────── */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="font-bold text-2xl lg:text-3xl text-ink tracking-tight">Promoções especiais</h2>
              <p className="text-sec text-sm mt-1">Ofertas por tempo limitado dos negócios da região.</p>
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
      <section className="py-12 lg:py-16 max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-bold text-2xl lg:text-3xl text-ink tracking-tight">Explorar por cidade</h2>
          <p className="text-sec text-sm mt-1.5">O Sul de Santa Catarina inteiro, cidade por cidade.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {CIDADES.map((city, ix) => (
            <Link
              key={city.slug}
              href={`/cidades/${city.slug}`}
              className="card-hover relative rounded-2xl overflow-hidden h-36 lg:h-44 block hero-grid"
              style={{background:`linear-gradient(160deg,#155C45 ${ix*4}%,#0B3B2C)`}}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4">
                <p className="font-bold text-white text-lg leading-tight">{city.nome}</p>
                <p className="text-white/65 text-xs mt-0.5">{city.qtd}</p>
              </span>
              <MapPin className="absolute top-4 right-4 size-5 text-accent" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA PARA EMPRESAS ──────────────────────────── */}
      <section className="py-16 lg:py-24 bg-primary hero-grid relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-accent text-xs font-semibold tracking-[.18em] uppercase mb-4">Para empresas</p>
            <h2 className="font-extrabold text-white text-3xl lg:text-[38px] leading-tight tracking-tight">
              Venda seus produtos para toda a região
            </h2>
            <p className="text-white/65 mt-4 max-w-md">
              Cadastre sua loja, adicione seus produtos e receba pedidos direto no WhatsApp — sem comissão e sem complicação.
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-8">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="size-[18px] text-accent shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4 mt-9">
              <Link href="/painel/cadastro" className="badge-gold text-white font-semibold text-sm rounded-full px-7 py-3.5 shadow-lg hover:brightness-105 transition-all">
                Cadastre sua loja grátis
              </Link>
              <Link href="/planos" className="text-white/80 text-sm font-medium hover:text-accent transition-colors flex items-center gap-1.5">
                Ver planos <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <p className="font-extrabold text-3xl text-accent">{s.valor}</p>
                <p className="text-xs text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTO ─────────────────────────────────── */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 max-w-2xl">
          <div className="bg-cream rounded-2xl p-7 border border-black/5">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="size-4 text-accent fill-accent" />)}
              <span className="font-bold text-ink ml-2">4,9</span>
            </div>
            <p className="text-ink/85 text-[15px] leading-relaxed">
              "Cadastrei minha loja e em duas semanas já tinha clientes novos chegando pelo DescubraSul. Muito mais fácil do que ter meu próprio site."
            </p>
            <div className="flex items-center gap-3 mt-5">
              <span className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">MR</span>
              <div>
                <p className="text-sm font-semibold text-ink">Marcos Rocha</p>
                <p className="text-xs text-sec">Sports Zone · Içara</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
