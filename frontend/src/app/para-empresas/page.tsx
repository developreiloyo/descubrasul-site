import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin, Star, BarChart3, Zap, ShieldCheck, Users,
  CheckCircle2, ArrowRight, MessageCircle
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
    icon: <MapPin className="size-6" />,
    titulo: "Visibilidade local real",
    desc: "Clientes buscando exatamente o que você oferece, na sua cidade, aparecem no seu perfil.",
  },
  {
    icon: <Star className="size-6" />,
    titulo: "Avaliações que vendem",
    desc: "Depoimentos reais de clientes constroem confiança e aumentam sua conversão.",
  },
  {
    icon: <BarChart3 className="size-6" />,
    titulo: "Métricas de desempenho",
    desc: "Acompanhe cliques, visualizações e buscas que levam ao seu negócio.",
  },
  {
    icon: <Zap className="size-6" />,
    titulo: "IA para seus textos",
    desc: "Descrições profissionais geradas por IA para produtos e serviços. Planos Pro e acima.",
  },
  {
    icon: <ShieldCheck className="size-6" />,
    titulo: "Perfil verificado",
    desc: "O badge de verificado aumenta a credibilidade e o destaque nos resultados.",
  },
  {
    icon: <Users className="size-6" />,
    titulo: "Sem comissão por venda",
    desc: "Você paga apenas o plano mensal. Nenhuma comissão sobre pedidos ou contatos.",
  },
];

const ETAPAS = [
  { num: "1", titulo: "Crie sua conta", desc: "Cadastro gratuito. Nenhum cartão necessário para começar." },
  { num: "2", titulo: "Monte seu perfil", desc: "Adicione logo, fotos, produtos, endereço e redes sociais." },
  { num: "3", titulo: "Seja encontrado", desc: "Seu negócio aparece imediatamente nas buscas do Sul de SC." },
];

const PLANOS_RAPIDOS = [
  { nome: "Gratuito", preco: "R$ 0", periodo: "para sempre", cor: "bg-black/5 text-ink" },
  { nome: "Básico",   preco: "R$ 79",  periodo: "/mês", cor: "bg-primary/10 text-primary" },
  { nome: "Pro",      preco: "R$ 197", periodo: "/mês", cor: "bg-primary text-white" },
  { nome: "Produção", preco: "R$ 397", periodo: "/mês", cor: "bg-accent/90 text-white" },
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
              <Link
                href="/planos"
                className="border border-white/25 text-white/90 font-semibold rounded-full px-8 py-4 text-sm hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2"
              >
                Ver planos <ArrowRight className="size-4" />
              </Link>
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

      {/* ── Benefícios ────────────────────────────── */}
      <section className="bg-white border-y border-black/[0.06]">
        <div className="max-w-[1100px] mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="eyebrow inline-flex mb-3">Por que DescubraSul</p>
            <h2 className="font-display text-3xl text-ink">O que você ganha</h2>
          </div>
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

      {/* ── Planos rápidos ────────────────────────── */}
      <section className="max-w-[1100px] mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="eyebrow inline-flex mb-3">Planos</p>
          <h2 className="font-display text-3xl text-ink">Comece grátis, cresça quando quiser</h2>
          <p className="text-sec text-sm mt-3">Sem comissão por venda. Cancele quando quiser.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[900px] mx-auto">
          {PLANOS_RAPIDOS.map((p) => (
            <div key={p.nome} className={`rounded-2xl p-5 text-center ${p.cor}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{p.nome}</p>
              <p className="font-display text-3xl mt-2">{p.preco}</p>
              <p className="text-xs opacity-60 mt-0.5">{p.periodo}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">
          <Link
            href="/planos"
            className="border border-primary text-primary font-semibold rounded-full px-7 py-3 text-sm hover:bg-primary hover:text-white transition-all text-center flex items-center justify-center gap-2"
          >
            Ver todos os planos <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/painel/cadastro"
            className="badge-gold text-white font-semibold rounded-full px-7 py-3 text-sm hover:brightness-105 transition-all text-center"
          >
            Cadastrar grátis
          </Link>
        </div>
      </section>

      {/* ── Depoimento ────────────────────────────── */}
      <section className="bg-primary hero-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light/60" />
        <div className="max-w-[700px] mx-auto px-4 py-16 relative z-10 text-center">
          <MessageCircle className="size-10 text-accent mx-auto mb-6 opacity-80" />
          <p className="font-display text-white text-xl lg:text-2xl leading-snug">
            "Antes ninguém me achava pelo Google. Hoje recebo clientes novos toda semana
            só porque aparece na busca do DescubraSul."
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
          {["Grátis para começar","Sem comissão","Cancele quando quiser"].map(t => (
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
