"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react";
import { mediaUrl } from "@/lib/utils";
import type { Negocio } from "@/types";

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  fundador:  { label: "Fundador",  cls: "bg-amber-500 text-white" },
  producao:  { label: "Produção",  cls: "bg-primary text-white" },
  pro:       { label: "Pro",       cls: "bg-primary/80 text-white" },
  basico:    { label: "Básico",    cls: "bg-ink/20 text-ink" },
};

export function NegociosDestaque({ negocios }: { negocios: Negocio[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir: "prev" | "next") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "next" ? 340 : -340, behavior: "smooth" });
  };

  if (!negocios.length) return null;

  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-2">Vitrine local</p>
            <h2 className="font-display text-2xl lg:text-[2rem] text-ink">Negócios em destaque</h2>
            <p className="text-sec text-sm mt-1.5">As melhores empresas do Sul catarinense, prontas para atender você.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("prev")}
              disabled={!canPrev}
              className="size-9 rounded-full border border-ink/10 flex items-center justify-center text-ink/40 hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              onClick={() => scroll("next")}
              disabled={!canNext}
              className="size-9 rounded-full border border-ink/10 flex items-center justify-center text-ink/40 hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Próximo"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2 max-w-[1200px] mx-auto lg:px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {negocios.map((negocio) => {
          const logoUrl   = mediaUrl(negocio.logo);
          const cidSlug   = slugify(negocio.cidade);
          const catSlug   = negocio.categoria?.slug ?? "";
          const href      = `/negocios/${cidSlug}/${catSlug}/${negocio.slug}`;
          const badge     = PLAN_BADGE[negocio.plano];

          return (
            <Link
              key={negocio.slug}
              href={href}
              className="group shrink-0 w-[280px] lg:w-[300px] bg-white rounded-2xl border border-black/[0.06] overflow-hidden card-hover block"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Imagem / capa */}
              <div className="relative h-40 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={negocio.alt_logo || negocio.nome}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="300px"
                  />
                ) : (
                  <span className="font-display text-6xl text-primary/20 select-none">
                    {negocio.nome.charAt(0)}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badge de plano */}
                {badge && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold rounded-full px-2.5 py-1 ${badge.cls}`}>
                    {badge.label}
                  </span>
                )}

                {/* Nome sobre a imagem */}
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-white text-sm leading-snug truncate drop-shadow">
                      {negocio.nome}
                    </p>
                    {negocio.verificado && (
                      <BadgeCheck className="size-4 shrink-0 text-white fill-primary" />
                    )}
                  </div>
                </div>
              </div>

              {/* Corpo */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-sec">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 text-primary px-2.5 py-1 font-medium text-[11px]">
                    {negocio.categoria?.icone} {negocio.categoria?.nome}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <MapPin className="size-3" />
                    {negocio.cidade}
                  </span>
                </div>

                {negocio.descricao && (
                  <p className="text-xs text-sec leading-relaxed line-clamp-2">{negocio.descricao}</p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-black/5">
                  {negocio.total_avaliacoes > 0 ? (
                    <span className="flex items-center gap-1 text-xs">
                      <Star className="size-3.5 fill-accent text-accent" />
                      <span className="font-semibold text-ink">{negocio.media_nota}</span>
                      <span className="text-sec">({negocio.total_avaliacoes})</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs font-semibold text-primary group-hover:text-accent transition-colors flex items-center gap-1">
                    Ver vitrine <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
