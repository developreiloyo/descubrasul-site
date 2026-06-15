"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { mediaUrl } from "@/lib/utils";
import type { Negocio } from "@/types";

interface Props {
  negocios: Negocio[];
}

export function SimilarBusinesses({ negocios }: Props) {
  if (negocios.length === 0) return null;

  return (
    <section aria-labelledby="similar-title">
      <h2 id="similar-title" className="mb-4 text-xl font-bold">
        Você também pode gostar
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {negocios.map((n) => (
          <Link
            key={n.slug}
            href={`/negocios/${n.cidade}/${n.categoria.slug}/${n.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {n.logo ? (
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={mediaUrl(n.logo)!}
                  alt={n.alt_logo || n.nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-ink/5 text-4xl">
                {n.categoria?.icone || "🏪"}
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1 p-3">
              <h3 className="text-pretty text-sm font-semibold leading-snug group-hover:text-primary">
                {n.nome}
              </h3>
              <span className="text-xs text-ink/50">{n.categoria?.nome}</span>
              {Number(n.media_nota) > 0 && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {n.media_nota}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}