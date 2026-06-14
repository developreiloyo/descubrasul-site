"use client";

import Image from "next/image";
import { linkWhatsApp, truncar, formatarPreco, mediaUrl } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";
import type { Negocio, Produto } from "@/types";

interface Props {
  negocio: Negocio;
  produtos: Produto[];
}

function tituloSecao(slug: string): string {
  if (["restaurantes", "alimentacao"].includes(slug)) return "Cardápio";
  if (["servicos", "estetica", "clinicas", "academias"].includes(slug)) return "Serviços";
  return "Produtos";
}

function textoBotao(slug: string): string {
  if (["restaurantes", "alimentacao"].includes(slug)) return "Pedir agora";
  return "Solicitar";
}

function ProdutoDestaque({ negocio, produto }: { negocio: Negocio; produto: Produto }) {
  const foto = mediaUrl(produto.foto);
  const catSlug = negocio.categoria?.slug || "";

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/40">
        Produto em destaque
      </p>
      <article className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">

          {/* Imagem — mobile: aspect ratio / desktop: altura fixa */}
          {foto ? (
            <div className="relative aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:h-52 sm:w-52">
              <Image
                src={foto}
                alt={produto.alt_foto || produto.nome}
                fill
                sizes="(max-width: 640px) 100vw, 208px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center bg-ink/5 text-6xl sm:aspect-auto sm:h-52 sm:w-52">
              {negocio.categoria?.icone || "📦"}
            </div>
          )}

          <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
            <h3 className="text-lg font-bold leading-snug">{produto.nome}</h3>
            {produto.descricao && (
              <p className="text-sm leading-relaxed text-ink/60">
                {truncar(produto.descricao, 120)}
              </p>
            )}
            {produto.preco && (
              <p className="mt-1 text-2xl font-bold text-primary">
                {formatarPreco(produto.preco)}
              </p>
            )}
            <a
              href={linkWhatsApp(
                negocio.whatsapp,
                `Olá! Gostaria de pedir: ${produto.nome}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarClique(negocio.slug, "whatsapp", produto.slug)}
              className="mt-auto inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:self-start"
            >
              {textoBotao(catSlug)}
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

export function ServicosSection({ negocio, produtos }: Props) {
  if (produtos.length === 0) return null;

  const catSlug = negocio.categoria?.slug || "";
  const [destaque, ...resto] = produtos;

  return (
    <section className="flex flex-col gap-6">
      <ProdutoDestaque negocio={negocio} produto={destaque} />

      {resto.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold">
            {tituloSecao(catSlug)} completo
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {resto.map((produto) => {
              const foto = mediaUrl(produto.foto);
              return (
                <article
                  key={produto.slug}
                  className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm"
                >
                  {foto ? (
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={foto}
                        alt={produto.alt_foto || produto.nome}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-ink/5 text-5xl">
                      {negocio.categoria?.icone || "📦"}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <h3 className="text-pretty text-sm font-semibold leading-snug">
                      {produto.nome}
                    </h3>
                    {produto.descricao && (
                      <p className="text-xs leading-snug text-ink/50">
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
                      onClick={() =>
                        registrarClique(negocio.slug, "whatsapp", produto.slug)
                      }
                      className="mt-auto inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      {catSlug === "restaurantes" ? "Pedir" : "Solicitar"}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
