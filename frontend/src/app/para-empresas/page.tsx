import type { Metadata } from "next";
import Link from "next/link";
import {
  Search, Eye, MessageCircle, ShieldCheck, BarChart3, Heart,
  CheckCircle2, ArrowRight, Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Para Empresas — Cadastre seu Negócio | DescubraSul",
  description: "Coloque seu negócio na vitrina digital do Sul de Santa Catarina. Clientes locais te encontram. Grátis para começar.",
  alternates: { canonical: "https://descubrasul.com/para-empresas" },
  openGraph: {
    title: "Para Empresas | DescubraSul",
    description: "Vitrina digital para negócios locais do Sul de SC. Grátis para começar.",
    url: "https://descubrasul.com/para-empresas",
  },
};

const BENEFICIOS = [
  {
    icon: <Search className="size-6" />,
    titulo: "Seja encontrado",
    desc: "Apareça para pessoas que procuram empresas e serviços na região.",
  },
  {
    icon: <Eye className="size-6" />,
    titulo: "Mais visibilidade",
    desc: "Destaque sua empresa para conquistar novos clientes.",
  },
  {
    icon: <MessageCircle className="size-6" />,
    titulo: "Contato rápido",
    desc: "WhatsApp, telefone, localização e redes sociais em um só lugar.",
  },
  {
    icon: <ShieldCheck className="size-6" />,
    titulo: "Credibilidade",
    desc: "Um perfil completo transmite mais confiança ao cliente.",
  },
  {
    icon: <BarChart3 className="size-6" />,
    titulo: "Divulgação contínua",
    desc: "Promova ofertas, novidades e diferenciais da sua empresa.",
  },
  {
    icon: <Heart className="size-6" />,
    titulo: "Valorize o comércio local",
    desc: "Faça parte da vitrine digital do Sul Catarinense.",
  },
];

const ETAPAS = [
  {
    num: "1",
    titulo: "Cadastre sua empresa",
    desc: "Crie seu perfil gratuitamente e comece a fazer parte da DescubraSul.",
  },
  {
    num: "2",
    titulo: "Complete seu perfil",
    desc: "Adicione informações do negócio, imagem, localização, contatos.",
  },
  {
    num: "3",
    titulo: "Seja encontrado",
    desc: "Seu negócio ganha mais visibilidade nas buscas por serviços e empresas do Sul de SC.",
  },
];

const PLANOS_RAPIDOS = [
  {
    nome: "Presença Sul",
    preco: "R$ 0",
    periodo: "gratuito",
    descricao: "Para começar na DescubraSul.",
    cor: "bg-black/5 text-ink",
  },
  {
    nome: "Conexão Sul",
    preco: "R$ 197",
    periodo: "/ano  ·  R$ 16,42/mês",
    descricao: "Para receber mais contatos.",
    cor: "bg-primary/10 text-primary",
  },
  {
    nome: "Destaque Sul",
    preco: "R$ 397",
    periodo: "/ano  ·  R$ 33,08/mês",
    descricao: "Para um canal contínuo de vendas.",
    cor: "bg-primary text-white",
  },
];

const PLANOS_DETALHES = [
  {
    slug: "presenca",
    nome: "Presença Sul",
    badge: null,
    preco: "Grátis",
    periodo: "para sempre",
    descricao:
      "Para empresas que querem começar a fazer parte da DescubraSul e fortalecer sua presença digital.",
    inclui: [
      "Perfil básico da empresa",
      "Nome comercial",
      "Categoria",
      "Endereço e localização",
      "Telefone e WhatsApp",
      "Descrição dos serviços",
      "Horário de atendimento",
      "1 imagem de capa",
      "Presença nas buscas da plataforma",
    ],
    nota: "Comece gratuitamente e evolua quando sua empresa precisar de mais visibilidade.",
    cta: "Cadastrar meu negócio",
    destaque: false,
  },
  {
    slug: "conexao",
    nome: "Conexão Sul",
    badge: null,
    preco: "R$ 197",
    periodo: "/ano  ·  R$ 16,42/mês",
    descricao:
      "Para empresas que querem aumentar sua visibilidade e facilitar o contato com novos clientes.",
    inclui: [
      "Tudo do Presença Sul",
      "Perfil empresarial completo",
      "Até 10 fotos",
      "Redes sociais",
      "Site da empresa",
      "Botão WhatsApp em destaque",
      "Google Maps integrado",
      "Estatísticas básicas de visitas",
    ],
    nota: null,
    cta: "Quero mais visibilidade",
    destaque: false,
  },
  {
    slug: "destaque",
    nome: "Destaque Sul",
    badge: "Mais completo",
    preco: "R$ 397",
    periodo: "/ano  ·  R$ 33,08/mês",
    descricao:
      "Para empresas que querem transformar a DescubraSul em um canal contínuo de divulgação e crescimento.",
    inclui: [
      "Tudo do Conexão Sul",
      "Até 20 fotos",
      "Vídeo institucional",
      "Maior prioridade nas buscas",
      "Selo Empresa Referência",
      "Estatísticas avançadas",
      "Novos recursos premium incluídos durante a vigência",
    ],
    nota: null,
    cta: "Impulsionar meu negócio",
    destaque: true,
  },
];

export default function ParaEmpresasPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Para Empresas — DescubraSul",
    url: "https://descubrasul.com/para-empresas",
    description: "Plataforma para negócios locais do Sul de Santa Catarina aparecerem online.",
  };

  return (
    <div className="min-h-screen bg-cream">
      <JsonLd data={schema} />
      <Navbar />

      {/* ── Hero ─────────────────────────────────── */}
      <header className="bg-primary hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light/60" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/8 blur-3xl" />
        <div className="max-w-[1100px] mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="max-w-[620px]">
            <p className="eyebrow text-accent/80 border-accent/20 bg-accent/8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6">
              Para negócios do Sul de SC
            </p>
            <h1 className="font-display text-white text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem] leading-tight">
              Seu negócio visto por quem está{" "}
              <span className="text-gradient">perto de você</span>
            </h1>
            <p className="text-white/65 mt-5 text-base lg:text-lg leading-relaxed max-w-lg">
              DescubraSul é a vitrina digital dos negócios locais do Sul de Santa Catarina.
              Clientes em Criciúma, Içara, Tubarão e região encontram você no momento certo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/painel/cadastro"
                className="badge-gold text-white font-semibold rounded-full px-8 py-4 text-sm hover:brightness-105 transition-all text-center"
              >
                Cadastre grátis agora
              </Link>
              <a
                href="#planos"
                className="border border-white/25 text-white/90 font-semibold rounded-full px-8 py-4 text-sm hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2"
              >
                Ver planos <ArrowRight className="size-4" />
              </a>
            </div>
            <p className="text-white/40 text-xs mt-4">
              Sem cartão de crédito · Perfil ativo imediatamente
            </p>
          </div>
        </div>
      </header>

      {/* ── Como funciona ─────────────────────────── */}
      <section className="max-w-[1100px] mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <p className="eyebrow inline-flex mb-3">Como funciona</p>
          <h2 className="font-display text-3xl text-ink">3 passos para aparecer</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {ETAPAS.map((e) => (
            <div key={e.num} className="bg-white rounded-2xl border border-black/[0.06] p-7 relative">
              <span className="font-display text-6xl text-primary/8 absolute top-5 right-5">{e.num}</span>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-display text-white text-lg mb-4">
                {e.num}
              </div>
              <h3 className="font-semibold text-ink">{e.titulo}</h3>
              <p className="text-sec text-sm mt-2 leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Por que DescubraSul ───────────────────── */}
      <section className="bg-white border-y border-black/[0.06]">
        <div className="max-w-[1100px] mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="eyebrow inline-flex mb-3">Por que DescubraSul</p>
            <h2 className="font-display text-3xl text-ink">
              Por que sua empresa deve estar na DescubraSul?
            </h2>
          </div>

          {/* Bloco de perguntas dos clientes */}
          <div className="bg-cream rounded-2xl border border-black/[0.06] p-7 mb-10 max-w-[700px] mx-auto text-center">
            <p className="text-sm font-semibold text-sec uppercase tracking-wide mb-4">
              Porque seus clientes já procuram:
            </p>
            <ul className="space-y-2">
              {[
                '"Onde encontro um profissional perto de mim?"',
                '"Qual empresa atende minha região?"',
                '"Quais negócios são recomendados?"',
              ].map((q) => (
                <li key={q} className="font-display text-ink text-lg leading-snug">
                  {q}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-primary font-semibold text-sm">
              A DescubraSul conecta pessoas com empresas locais.
            </p>
          </div>

          {/* Cards de benefícios */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} className="card-hover rounded-2xl border border-black/[0.06] p-6 bg-cream">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="font-semibold text-ink">{b.titulo}</h3>
                <p className="text-sec text-sm mt-2 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos resumo ─────────────────────────── */}
      <section id="planos" className="max-w-[1100px] mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="eyebrow inline-flex mb-3">Planos</p>
          <h2 className="font-display text-3xl text-ink">Comece grátis, cresça quando quiser</h2>
          <p className="text-sec text-sm mt-3 max-w-[640px] mx-auto leading-relaxed">
            Escolha o plano ideal para acompanhar o crescimento do seu negócio. Aumente sua
            visibilidade, conquiste novos clientes e fortaleça sua presença digital no Sul Catarinense.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[800px] mx-auto">
          {PLANOS_RAPIDOS.map((p) => (
            <div key={p.nome} className={`rounded-2xl p-5 text-center ${p.cor}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{p.nome}</p>
              <p className="font-display text-3xl mt-2">{p.preco}</p>
              <p className="text-xs opacity-60 mt-0.5">{p.periodo}</p>
              <p className="text-xs opacity-75 mt-2 leading-snug">{p.descricao}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-7">
          <a
            href="#planos-detalhes"
            className="border border-primary text-primary font-semibold rounded-full px-7 py-3 text-sm hover:bg-primary hover:text-white transition-all text-center flex items-center justify-center gap-2"
          >
            Ver detalhes dos planos <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      {/* ── Planos detalhados ─────────────────────── */}
      <section id="planos-detalhes" className="bg-white border-y border-black/[0.06]">
        <div className="max-w-[1100px] mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="eyebrow inline-flex mb-3">Detalhes dos planos</p>
            <h2 className="font-display text-3xl text-ink">
              Escolha como sua empresa quer crescer na DescubraSul
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANOS_DETALHES.map((p) => (
              <div
                key={p.slug}
                className={`rounded-2xl p-7 flex flex-col relative ${
                  p.destaque
                    ? "bg-primary text-white"
                    : "bg-cream border border-black/[0.06]"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-[#16201B] text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                    {p.badge}
                  </span>
                )}

                <div className="mb-5">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                      p.destaque ? "text-white/60" : "text-sec"
                    }`}
                  >
                    Plano
                  </p>
                  <h3
                    className={`font-display text-2xl ${
                      p.destaque ? "text-white" : "text-ink"
                    }`}
                  >
                    {p.nome}
                  </h3>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    p.destaque ? "text-white/80" : "text-sec"
                  }`}
                >
                  {p.descricao}
                </p>

                <ul className="space-y-2.5 mb-0">
                  {p.inclui.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2
                        className={`size-4 flex-shrink-0 mt-0.5 ${
                          p.destaque ? "text-accent" : "text-primary"
                        }`}
                      />
                      <span
                        className={
                          p.destaque
                            ? i === 0
                              ? "text-white/60 font-medium"
                              : "text-white/90"
                            : i === 0
                            ? "text-sec font-medium"
                            : "text-ink"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {p.nota && (
                    <p
                      className={`text-xs italic mb-4 leading-relaxed ${
                        p.destaque ? "text-white/50" : "text-sec"
                      }`}
                    >
                      &ldquo;{p.nota}&rdquo;
                    </p>
                  )}
                  <Link
                    href="/painel/cadastro"
                    className={`font-semibold rounded-full px-6 py-3 text-sm text-center transition-all flex items-center justify-center gap-2 ${
                      p.destaque
                        ? "badge-gold text-white hover:brightness-105"
                        : "border border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    {p.cta} <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimento ────────────────────────────── */}
      <section className="bg-primary hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light/60" />
        <div className="max-w-[700px] mx-auto px-4 py-16 relative z-10 text-center">
          <MessageCircle className="size-10 text-accent mx-auto mb-6 opacity-80" />
          <p className="font-display text-white text-xl lg:text-2xl leading-snug">
            &ldquo;Antes ninguém me achava pelo Google. Hoje recebo clientes novos toda semana
            só porque aparece na busca do DescubraSul.&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-display text-white text-lg">
              A
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Ana Paula S.</p>
              <p className="text-white/50 text-xs">Confeitaria em Criciúma</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────── */}
      <section className="max-w-[700px] mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-ink">Pronto para ser encontrado?</h2>
        <p className="text-sec mt-3 leading-relaxed">
          Cadastro gratuito. Sem cartão. Ativo em minutos.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
          <Link
            href="/painel/cadastro"
            className="badge-gold text-white font-semibold rounded-full px-9 py-4 text-sm hover:brightness-105 transition-all"
          >
            Quero aparecer no DescubraSul
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-5 text-xs text-sec">
          {["Grátis para começar", "Sem comissão", "Cancele quando quiser"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" /> {t}
            </span>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
