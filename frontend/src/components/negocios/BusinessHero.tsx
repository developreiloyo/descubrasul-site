"use client";

import Image from "next/image";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { Negocio } from "@/types";
import { mediaUrl } from "@/lib/utils";

interface Props {
  negocio: Negocio;
}

export function BusinessHero({ negocio }: Props) {
  return (
    <section className="relative">
      <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96 lg:rounded-2xl">
        {negocio.logo ? (
          <Image
            src={mediaUrl(negocio.logo)!}
            alt={negocio.alt_logo || `Foto de ${negocio.nome}`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink/10 text-8xl">
            {negocio.categoria?.icone || "🏪"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <h1 className="text-balance text-2xl font-bold text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
              {negocio.nome}
            </h1>
            {negocio.verificado && (
              <BadgeCheck
                aria-label="Negócio verificado"
                className="size-6 shrink-0 text-primary fill-white"
              />
            )}
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {negocio.categoria?.nome}
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-ink/50">
          <MapPin className="size-4" />
          {negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1)} · SC
        </span>
        {negocio.total_avaliacoes > 0 && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {negocio.media_nota}
            <span className="font-normal text-ink/50">
              ({negocio.total_avaliacoes} avaliações)
            </span>
          </span>
        )}
      </div>
    </section>
  );
}