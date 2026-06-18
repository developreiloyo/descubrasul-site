"use client";

import React from "react";
import { BadgeCheck, MapPin, Star, ExternalLink } from "lucide-react";
import Image from "next/image";
import { AdSlot } from "@/components/ui/AdSlot";
import { BusinessActions } from "@/components/negocios/BusinessActions";
import { HistoriaSection } from "@/components/negocios/HistoriaSection";
import { OfrecemosSection } from "@/components/negocios/OfrecemosSection";
import { ProdutosSection } from "@/components/negocios/ProdutosSection";
import { EspacoEspecial } from "@/components/negocios/EspacoEspecial";
import { UbicacaoSection } from "@/components/negocios/UbicacaoSection";
import { SimilarBusinesses } from "@/components/negocios/SimilarBusinesses";
import { mediaUrl, linkWhatsApp } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";
import type { Negocio, Produto } from "@/types";

function InstagramIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const REDE_ICONS: Record<string, { Icon: () => React.ReactElement; label: string }> = {
  instagram_url: { Icon: InstagramIcon, label: "Instagram" },
  facebook_url:  { Icon: FacebookIcon,  label: "Facebook" },
  tiktok_url:    { Icon: TikTokIcon,    label: "TikTok" },
};

interface Props {
  negocio: Negocio;
  produtos: Produto[];
  similares: Negocio[];
}

export function PaginaNegocioClient({ negocio, produtos, similares }: Props) {
  const isPro  = ["pro", "producao", "fundador"].includes(negocio.plano);
  const logoUrl = mediaUrl(negocio.logo);
  const cidade  = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);
  const redes   = Object.entries(REDE_ICONS)
    .filter(([key]) => negocio.redes_sociais?.[key as keyof typeof negocio.redes_sociais])
    .map(([key, { Icon, label }]) => ({
      url: negocio.redes_sociais![key as keyof typeof negocio.redes_sociais] as string,
      Icon,
      label,
    }));

  const mapaUrl = negocio.localizacao?.lat
    ? `https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(cidade + ", SC, Brasil")}`;

  return (
    <div className="flex flex-col gap-6">

      {/* ── 1. HERO ──────────────────────────────────────────────── */}
      <section className="rounded-2xl overflow-hidden border border-ink/10 bg-white shadow-sm">

        {/* Imagem de capa */}
        <div className="relative h-56 w-full bg-ink/10 sm:h-72">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={negocio.alt_logo || `Foto de ${negocio.nome}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl">
              {negocio.categoria?.icone ?? "🏪"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

          {/* Nome sobre a imagem */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
                {negocio.nome}
              </h1>
              {negocio.verificado && (
                <BadgeCheck
                  aria-label="Negócio verificado"
                  className="size-6 shrink-0 fill-white text-primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* Corpo do hero */}
        <div className="p-5 flex flex-col gap-4">

          {/* Meta: categoria · cidade · rating */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {negocio.categoria?.icone} {negocio.categoria?.nome}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-ink/50">
              <MapPin className="size-3.5" />
              {cidade} · SC
            </span>
            {negocio.total_avaliacoes > 0 && (
              <span className="inline-flex items-center gap-1 text-sm">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{negocio.media_nota}</span>
                <span className="text-ink/50">({negocio.total_avaliacoes})</span>
              </span>
            )}
          </div>

          {/* Descrição curta */}
          {negocio.descricao && (
            <p className="text-sm leading-relaxed text-ink/70">{negocio.descricao}</p>
          )}

          {/* Endereço inline */}
          {negocio.localizacao?.direccao_fmt && (
            <a
              href={mapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarClique(negocio.slug, "maps")}
              className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-primary transition"
            >
              <MapPin className="size-4 shrink-0" />
              {negocio.localizacao.direccao_fmt}
              <ExternalLink className="size-3 shrink-0" />
            </a>
          )}

          {/* Redes sociais */}
          {redes.length > 0 && (
            <div className="flex items-center gap-2">
              {redes.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-ink/10 bg-ink/5 text-ink/50 transition hover:border-primary hover:text-primary"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}

          {/* CTAs */}
          <BusinessActions
            negocioSlug={negocio.slug}
            whatsapp={negocio.whatsapp}
            nome={negocio.nome}
          />
        </div>
      </section>

      {/* ── 2. HISTORIA ──────────────────────────────────────────── */}
      <HistoriaSection
        nome={negocio.nome}
        historia={negocio.historia}
        logo={negocio.logo}
        altLogo={negocio.alt_logo}
      />

      {/* ── 3. QUÉ OFRECEMOS ─────────────────────────────────────── */}
      <OfrecemosSection negocio={negocio} />

      {/* ── 4. PRODUCTOS ─────────────────────────────────────────── */}
      <div id="produtos-destaque">
        <ProdutosSection negocio={negocio} produtos={produtos} />
      </div>

      {/* ── AD SLOT 1 — após produtos, só planos gratuito/básico ─── */}
      {!isPro && <AdSlot id="ad-slot-1" size="responsive" />}

      {/* ── 5. ESPACIO ESPECIAL (Pro+) ───────────────────────────── */}
      <EspacoEspecial negocio={negocio} />

      {/* ── 6. UBICACIÓN (mobile — sidebar cubre desktop) ────────── */}
      <UbicacaoSection negocio={negocio} className="lg:hidden" />

      {/* ── 7. NEGOCIOS SIMILARES ────────────────────────────────── */}
      <SimilarBusinesses negocios={similares} />

      {/* ── AD SLOT 2 — antes do footer, só planos gratuito/básico ── */}
      {!isPro && <AdSlot id="ad-slot-2" size="responsive" />}

    </div>
  );
}
