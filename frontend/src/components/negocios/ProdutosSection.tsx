"use client";

import Image from "next/image";
import { formatarPreco, mediaUrl } from "@/lib/utils";
import type { Negocio, Produto } from "@/types";

const TITULO_SECAO: Record<string, string> = {
  restaurantes: "Cardápio",
  alimentacao:  "Cardápio",
  servicos:     "Serviços",
  estetica:     "Serviços",
  clinicas:     "Serviços",
  academias:    "Planos e serviços",
};

const LINK_LABEL: Record<string, string> = {
  restaurantes: "Ver cardápio completo",
  alimentacao:  "Ver cardápio completo",
  servicos:     "Ver todos os serviços",
  estetica:     "Ver todos os serviços",
};

interface Props {
  negocio: Negocio;
  produtos: Produto[];
}

export function ProdutosSection({ negocio, produtos }: Props) {
  if (produtos.length === 0) return null;

  const catSlug = negocio.categoria?.slug ?? "";
  const titulo    = TITULO_SECAO[catSlug] ?? "Produtos";
  const linkLabel = LINK_LABEL[catSlug] ?? "Ver todos";

  // Exibe até 4 produtos em grid 2x2
  const visiveis = produtos.slice(0, 4);

  return (
    <section id="produtos-destaque" className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-3" style={{ color: "#0b1c30" }}>
          {titulo} em destaque
        </h2>
        {negocio.whatsapp && (
          <a
            href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold hover:underline"
            style={{ color: "#00602a" }}
          >
            {linkLabel}
          </a>
        )}
      </div>

      {/* Grid 2×2 */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {visiveis.map((produto) => {
          const imgUrl =
            mediaUrl(produto.foto) ??
            (produto.fotos?.[0] ? mediaUrl(produto.fotos[0].foto) : null);

          return (
            <article
              key={produto.slug}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md"
              style={{ borderColor: "#becabc" }}
            >
              <div className="relative h-48 w-full overflow-hidden" style={{ backgroundColor: "#e5eeff" }}>
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={produto.alt_foto || produto.nome}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">
                    {negocio.categoria?.icone ?? "📦"}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold leading-snug" style={{ color: "#0b1c30" }}>
                    {produto.nome}
                  </h3>
                  {produto.preco && (
                    <span className="text-sm font-bold shrink-0" style={{ color: "#1a7a3c" }}>
                      {formatarPreco(produto.preco)}
                    </span>
                  )}
                </div>
                {produto.descricao && (
                  <p className="text-sm leading-relaxed" style={{ color: "#3f493f" }}>
                    {produto.descricao}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
