
"use client";

import Image from "next/image";
import { linkWhatsApp, truncar, formatarPreco, mediaUrl } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";
import type { Negocio, Produto } from "@/types";



interface Props {
  negocio: Negocio;
  produtos: Produto[];
}

function titulo(categoriaSlug: string): string {
  if (["restaurantes", "alimentacao"].includes(categoriaSlug)) return "Cardápio";
  if (["servicos", "estetica", "clinicas", "academias"].includes(categoriaSlug)) return "Serviços";
  return "Produtos";
}

export function ServicosSection({ negocio, produtos }: Props) {
  if (produtos.length === 0) return null;

  return (
    <section aria-labelledby="servicos-title">
      <h2 id="servicos-title" className="mb-4 text-xl font-bold">
        {titulo(negocio.categoria?.slug || "")}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {produtos.map((produto) => (
          <article
            key={produto.slug}
            className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm"
          >
            {produto.foto ? (
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={mediaUrl(produto.foto)!}
                  alt={produto.alt_foto || produto.nome}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-[4/3] w-full items-center justify-center bg-ink/5 text-5xl">
                {negocio.categoria?.icone || "📦"}
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-3">
              <h3 className="text-pretty text-sm font-semibold leading-snug">
                {produto.nome}
              </h3>
              {produto.descricao && (
                <p className="text-xs text-ink/50 leading-snug">
                  {truncar(produto.descricao, 60)}
                </p>
              )}
              {produto.preco && (
                <p className="text-base font-bold text-primary">
                  {formatarPreco(produto.preco)}
                </p>
              )}
              <a
                href={linkWhatsApp(
                  negocio.whatsapp,
                  `Olá! Gostaria de saber mais sobre: ${produto.nome}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registrarClique(negocio.slug, "whatsapp", produto.slug)}
                className="mt-auto inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {negocio.categoria?.slug === "restaurantes" ? "Pedir" : "Solicitar"}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}