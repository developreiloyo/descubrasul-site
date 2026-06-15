"use client";

import { useState } from "react";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { BusinessActions } from "@/components/negocios/BusinessActions";
import { ProductoDestaque } from "@/components/negocios/ProductoDestaque";
import { ServicosSection } from "@/components/negocios/ServicosSection";
import { SimilarBusinesses } from "@/components/negocios/SimilarBusinesses";

interface Props {
  negocio: any;
  produtos: any[];
  similares: any[];
}

export function PaginaNegocioClient({ negocio, produtos, similares }: Props) {
  const [produtoDestaque, setProdutoDestaque] = useState(produtos[0] ?? null);

  const cidadeFormatada = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  // Reordena: destaque primeiro, resto na ordem original
  const outrosProdutos = produtos.filter((p) => p.slug !== produtoDestaque?.slug);

  return (
    <div className="flex flex-col gap-5">

      {/* 1. CAROUSEL DO PRODUTO EM DESTAQUE */}
      {produtoDestaque && (
        <ProductoDestaque produto={produtoDestaque} negocio={negocio} />
      )}

      {/* 2. NOME + CATEGORIA + CIDADE + RATING */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{negocio.nome}</h1>
          {negocio.verificado && (
            <BadgeCheck className="size-6 shrink-0 text-primary" fill="#0d9488" stroke="white" />
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {negocio.categoria?.icone} {negocio.categoria?.nome}
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-ink/50">
            <MapPin className="size-3.5" />{cidadeFormatada} · SC
          </span>
          {negocio.total_avaliacoes > 0 && (
            <span className="inline-flex items-center gap-1 text-sm">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{negocio.media_nota}</span>
              <span className="text-ink/50">({negocio.total_avaliacoes} avaliações)</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. BOTOES */}
      <BusinessActions
        negocioSlug={negocio.slug}
        whatsapp={negocio.whatsapp}
        nome={negocio.nome}
      />

      {/* 4. SOBRE */}
      {negocio.descricao && (
        <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold">Sobre {negocio.nome}</h2>
          <p className="text-sm leading-relaxed text-ink/70">{negocio.descricao}</p>
        </section>
      )}

      {/* 5. OUTROS PRODUTOS — click muda o carousel */}
      {outrosProdutos.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">
            {["restaurantes", "alimentacao"].includes(negocio.categoria?.slug)
              ? "Cardápio"
              : "Mais produtos"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {outrosProdutos.map((produto) => (
              <button
                key={produto.slug}
                onClick={() => {
                  setProdutoDestaque(produto);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group text-left overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm transition hover:border-primary hover:shadow-md"
              >
                {produto.foto ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={produto.foto.includes("backend:8000")
                        ? produto.foto.replace("http://backend:8000", "")
                        : produto.foto}
                      alt={produto.alt_foto || produto.nome}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-ink/5 text-5xl">
                    {negocio.categoria?.icone || "📦"}
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm leading-snug group-hover:text-primary transition">
                    {produto.nome}
                  </p>
                  {produto.descricao && (
                    <p className="mt-1 text-xs text-ink/50 leading-snug line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}
                  {produto.preco && (
                    <p className="mt-2 font-bold text-primary text-sm">
                      R$ {Number(produto.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-primary font-medium group-hover:underline">
                    Ver no carousel →
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 6. SIMILARES */}
      <SimilarBusinesses negocios={similares} />
    </div>
  );
}