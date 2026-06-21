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

  const cidade =
    negocios[0]?.cidade.charAt(0).toUpperCase() +
    negocios[0]?.cidade.slice(1);

  return (
    <section
      aria-labelledby="similar-title"
      style={{ backgroundColor: "#eff4ff" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <h2
          id="similar-title"
          className="text-2xl font-semibold mb-8"
          style={{ color: "#0b1c30" }}
        >
          Você também pode gostar em {cidade}
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {negocios.map((n) => (
            <Link
              key={n.slug}
              href={`/negocios/${n.cidade}/${n.categoria.slug}/${n.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg"
              style={{ borderColor: "#becabc" }}
            >
              {n.logo ? (
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={mediaUrl(n.logo)!}
                    alt={n.alt_logo || n.nome}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 280px"
                  />
                </div>
              ) : (
                <div
                  className="flex h-40 items-center justify-center text-4xl"
                  style={{ backgroundColor: "#e5eeff" }}
                >
                  {n.categoria?.icone || "🏪"}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3
                  className="text-pretty text-sm font-semibold leading-snug transition-colors group-hover:text-[#00602a]"
                  style={{ color: "#0b1c30" }}
                >
                  {n.nome}
                </h3>
                <span className="text-xs" style={{ color: "#6f7a6e" }}>
                  {n.categoria?.nome}
                </span>
                {Number(n.media_nota) > 0 && (
                  <span
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium"
                    style={{ color: "#0b1c30" }}
                  >
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {n.media_nota}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
