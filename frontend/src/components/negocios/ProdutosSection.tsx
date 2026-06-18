"use client";

import { useState } from "react";
import Image from "next/image";
import { linkWhatsApp, formatarPreco, mediaUrl } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";
import type { Negocio, Produto } from "@/types";

const TITULO_SECAO: Record<string, string> = {
  restaurantes: "Cardápio",
  alimentacao: "Cardápio",
  servicos: "Serviços",
  estetica: "Serviços",
  clinicas: "Serviços",
  academias: "Planos e serviços",
};

const TEXTO_BOTAO: Record<string, string> = {
  restaurantes: "Pedir agora",
  alimentacao: "Pedir agora",
};

interface Props {
  negocio: Negocio;
  produtos: Produto[];
}

export function ProdutosSection({ negocio, produtos }: Props) {
  const [destaque, setDestaque] = useState<Produto | null>(produtos[0] ?? null);

  if (produtos.length === 0) return null;

  const catSlug = negocio.categoria?.slug ?? "";
  const titulo  = TITULO_SECAO[catSlug] ?? "Produtos";
  const botao   = TEXTO_BOTAO[catSlug]  ?? "Solicitar";

  const outros = produtos.filter((p) => p.slug !== destaque?.slug);

  const destaqueImgUrl = destaque ? (
    mediaUrl(destaque.foto) ??
    (destaque.fotos?.[0] ? mediaUrl(destaque.fotos[0].foto) : null)
  ) : null;

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-ink">{titulo}</h2>

      {/* Produto em destaque */}
      {destaque && (
        <article className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ink/5 sm:aspect-auto sm:h-52 sm:w-52">
              {destaqueImgUrl ? (
                <Image
                  src={destaqueImgUrl}
                  alt={destaque.alt_foto || destaque.nome}
                  fill
                  sizes="(max-width: 640px) 100vw, 208px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  {negocio.categoria?.icone ?? "📦"}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Destaque
              </p>
              <h3 className="text-lg font-bold leading-snug">{destaque.nome}</h3>
              {destaque.descricao && (
                <p className="text-sm leading-relaxed text-ink/60">{destaque.descricao}</p>
              )}
              {destaque.preco && (
                <p className="text-2xl font-bold text-primary">{formatarPreco(destaque.preco)}</p>
              )}
              <a
                href={linkWhatsApp(negocio.whatsapp, `Olá! Gostaria de: ${destaque.nome}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registrarClique(negocio.slug, "whatsapp", destaque.slug)}
                className="mt-auto inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:self-start"
              >
                {botao}
              </a>
            </div>
          </div>
        </article>
      )}

      {/* Grade de outros produtos */}
      {outros.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {outros.map((produto) => {
            const imgUrl =
              mediaUrl(produto.foto) ??
              (produto.fotos?.[0] ? mediaUrl(produto.fotos[0].foto) : null);
            return (
              <button
                key={produto.slug}
                onClick={() => {
                  setDestaque(produto);
                  document.getElementById("produtos-destaque")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group text-left overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm transition hover:border-primary hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={produto.alt_foto || produto.nome}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      {negocio.categoria?.icone ?? "📦"}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold leading-snug group-hover:text-primary transition">
                    {produto.nome}
                  </p>
                  {produto.preco && (
                    <p className="mt-1 text-sm font-bold text-primary">
                      {formatarPreco(produto.preco)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
