import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Planos e Preços | DescubraSul",
  description: "Escolha o plano ideal para seu negócio. A partir de R$ 79/mês, sem comissão e sem taxa de adesão.",
  alternates: { canonical: "https://descubrasul.com/planos" },
};

const PLANOS = [
  {
    nome:    "Gratuito",
    preco:   "R$ 0",
    periodo: "para sempre",
    cor:     "border-black/10",
    badge:   "",
    destaque: false,
    features: [
      "Vitrine básica do negócio",
      "Link para WhatsApp",
      "Até 5 produtos",
      "Aparece na busca",
    ],
    nao: ["Métricas e analytics","IA para descrições","Destaque nas buscas","Fotos profissionais"],
    cta: "Começar grátis",
    href: "/painel/cadastro",
  },
  {
    nome:    "Básico",
    preco:   "R$ 79",
    periodo: "/mês",
    cor:     "border-black/10",
    badge:   "",
    destaque: false,
    features: [
      "Até 20 produtos",
      "Link para WhatsApp",
      "Aparece na busca",
      "Endereço no mapa",
      "Redes sociais no perfil",
      "Horário de funcionamento",
    ],
    nao: ["Métricas e analytics","IA para descrições","Destaque nas buscas"],
    cta: "Assinar Básico",
    href: "/painel/cadastro",
  },
  {
    nome:    "Pro",
    preco:   "R$ 197",
    periodo: "/mês",
    cor:     "border-primary",
    badge:   "Mais popular",
    destaque: true,
    features: [
      "Produtos ilimitados",
      "Destaque nas buscas",
      "Métricas e analytics completos",
      "IA para descrições de produtos",
      "Badge verificado",
      "Endereço no mapa",
      "Redes sociais no perfil",
      "Horário de funcionamento",
      "Suporte prioritário",
    ],
    nao: [],
    cta: "Assinar Pro",
    href: "/painel/cadastro",
  },
  {
    nome:    "Produção",
    preco:   "R$ 397",
    periodo: "/mês",
    cor:     "border-accent",
    badge:   "Para quem quer crescer",
    destaque: false,
    features: [
      "Tudo do Pro",
      "Fotos profissionais incluídas",
      "Vídeo destaque no perfil",
      "Posição fixa no topo da categoria",
      "Relatório mensal personalizado",
      "Gerente de conta dedicado",
    ],
    nao: [],
    cta: "Assinar Produção",
    href: "/painel/cadastro",
  },
];

const FUNDADOR = {
  preco: "R$ 599",
  periodo: "/ano",
  vagas: 50,
  features: [
    "Tudo do Plano Pro por 1 ano",
    "Preço fixo garantido para sempre",
    "Acesso antecipado a novos recursos",
    "Nome na página de fundadores",
    "Badge Fundador exclusivo",
  ],
};

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <header className="bg-primary hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light/60" />
        <div className="max-w-[900px] mx-auto px-4 py-14 lg:py-20 text-center relative z-10">
          <p className="eyebrow text-accent/80 border-accent/20 bg-accent/8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5">
            Planos e preços
          </p>
          <h1 className="font-display text-white text-3xl lg:text-5xl">
            Escolha o plano do seu negócio
          </h1>
          <p className="text-white/60 mt-4 max-w-xl mx-auto leading-relaxed">
            Sem comissão por venda. Sem taxa de adesão. Cancele quando quiser.
          </p>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-12">

        {/* Grid de planos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANOS.map((p) => (
            <div
              key={p.nome}
              className={`relative bg-white rounded-2xl border-2 ${p.cor} p-6 flex flex-col ${p.destaque ? "shadow-xl shadow-primary/10" : ""}`}
            >
              {p.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold rounded-full px-4 py-1 whitespace-nowrap ${p.destaque ? "bg-primary text-white" : "badge-gold text-white"}`}>
                  {p.badge}
                </span>
              )}
              <div className="mb-5">
                <p className="text-xs font-semibold text-sec uppercase tracking-wide">{p.nome}</p>
                <p className="mt-1">
                  <span className="font-display text-ink text-3xl">{p.preco}</span>
                  <span className="text-sec text-sm ml-1">{p.periodo}</span>
                </p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink/80">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {p.nao.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink/30 line-through">
                    <span className="size-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={p.href}
                className={`mt-7 block text-center rounded-full py-3 text-sm font-semibold transition-all ${
                  p.destaque
                    ? "bg-primary text-white hover:bg-primary-light"
                    : "border border-primary/30 text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Plano Fundador */}
        <div className="mt-8 bg-primary hero-grid rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge-gold text-white text-xs font-bold rounded-full px-3 py-1">Fundador</span>
                <span className="text-white/50 text-xs">Apenas {FUNDADOR.vagas} vagas</span>
              </div>
              <h2 className="font-display text-white text-2xl lg:text-3xl">
                {FUNDADOR.preco}
                <span className="text-white/50 text-base font-sans font-normal ml-1">{FUNDADOR.periodo}</span>
              </h2>
              <p className="text-white/60 text-sm mt-1">Acesso antecipado · Preço fixo para sempre · Apoio direto ao projeto</p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                {FUNDADOR.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <Star className="size-3.5 text-accent fill-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/painel/cadastro"
              className="badge-gold text-white font-semibold text-sm rounded-full px-8 py-3.5 hover:brightness-110 transition-all whitespace-nowrap shrink-0"
            >
              Quero ser Fundador
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-ink text-center mb-7">Perguntas frequentes</h2>
          <div className="flex flex-col gap-4">
            {[
              { p: "Preciso de cartão de crédito para começar?", r: "Não. O plano gratuito não exige cartão. Você faz upgrade quando quiser." },
              { p: "Posso cancelar a qualquer momento?", r: "Sim. Sem multa e sem burocracia. O acesso continua até o fim do período pago." },
              { p: "Quanto tempo leva para meu negócio aparecer?", r: "Imediatamente após o cadastro. A aprovação manual ocorre em até 24h úteis." },
              { p: "A IA realmente escreve as descrições?", r: "Sim, disponível nos planos Pro, Produção e Fundador. Você aprova antes de publicar." },
            ].map(({ p, r }) => (
              <div key={p} className="bg-white rounded-2xl border border-black/[0.06] p-5">
                <p className="font-semibold text-ink text-sm">{p}</p>
                <p className="text-sec text-sm mt-2 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
