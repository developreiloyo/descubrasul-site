"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, MessageCircle } from "lucide-react";
import { formatarPreco, mediaUrl } from "@/lib/utils";
import type { Negocio, Produto } from "@/types";

// ─── Tipos locais ────────────────────────────────────────────────────
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

// ─── Modal de detalhe do produto ─────────────────────────────────────
function ProdutoModal({
  produto,
  whatsapp,
  onClose,
}: {
  produto: Produto;
  whatsapp: string;
  onClose: () => void;
}) {
  const imagens: string[] = [
    ...(produto.foto ? [mediaUrl(produto.foto)!] : []),
    ...(produto.fotos ?? []).map((f) => mediaUrl(f.foto)!).filter(Boolean),
  ].filter(Boolean);

  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((i) => (i - 1 + imagens.length) % imagens.length), [imagens.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % imagens.length), [imagens.length]);

  // Fechar com Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && imagens.length > 1) prev();
      if (e.key === "ArrowRight" && imagens.length > 1) next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, imagens.length]);

  // Travar scroll do body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const numero = whatsapp.replace(/\D/g, "");
  const msg = encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}`);
  const waUrl = `https://wa.me/${numero}?text=${msg}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      {/* Painel do modal */}
      <div
        className="relative w-full max-w-lg md:max-w-2xl max-h-[92dvh] md:max-h-[88dvh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Carrossel de imagens */}
        {imagens.length > 0 ? (
          <div className="relative w-full aspect-[4/3] bg-[#e5eeff] overflow-hidden rounded-t-2xl md:rounded-t-2xl">
            <Image
              src={imagens[idx]}
              alt={produto.alt_foto || produto.nome}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 672px"
            />

            {/* Setas */}
            {imagens.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dots */}
            {imagens.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {imagens.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === idx ? "bg-white scale-125" : "bg-white/50"
                    }`}
                    aria-label={`Ir para imagem ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-[#e5eeff] rounded-t-2xl flex items-center justify-center text-7xl">
            📦
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold leading-snug" style={{ color: "#0b1c30" }}>
              {produto.nome}
            </h2>
            {produto.preco && (
              <span className="text-xl font-extrabold shrink-0" style={{ color: "#1a7a3c" }}>
                {formatarPreco(produto.preco)}
              </span>
            )}
          </div>

          {produto.descricao && (
            <p className="text-sm leading-relaxed" style={{ color: "#3f493f" }}>
              {produto.descricao}
            </p>
          )}

          {produto.descricao_longa && (
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#3f493f" }}>
              {produto.descricao_longa}
            </p>
          )}

          {/* Botão WhatsApp */}
          {numero && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white text-sm transition-colors"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp sobre este produto
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Grid de produtos em destaque ────────────────────────────────────
interface Props {
  negocio: Negocio;
  produtos: Produto[];
}

export function ProdutosSection({ negocio, produtos }: Props) {
  const [selected, setSelected] = useState<Produto | null>(null);

  if (produtos.length === 0) return null;

  const catSlug    = negocio.categoria?.slug ?? "";
  const titulo     = TITULO_SECAO[catSlug] ?? "Produtos";
  const linkLabel  = LINK_LABEL[catSlug] ?? "Ver todos";
  const visiveis   = produtos.slice(0, 4);

  return (
    <>
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
                className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
                style={{ borderColor: "#becabc" }}
                onClick={() => setSelected(produto)}
              >
                {/* Imagem */}
                <div className="relative h-48 w-full overflow-hidden flex-shrink-0" style={{ backgroundColor: "#e5eeff" }}>
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

                {/* Conteúdo */}
                <div className="flex flex-col flex-1 p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold leading-snug" style={{ color: "#0b1c30" }}>
                    {produto.nome}
                  </h3>

                  {produto.descricao && (
                    <p
                      className="mt-1.5 text-xs md:text-sm leading-relaxed line-clamp-3 flex-1"
                      style={{ color: "#3f493f" }}
                    >
                      {produto.descricao}
                    </p>
                  )}

                  {/* Preço + botão — sempre na base */}
                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    {produto.preco ? (
                      <span className="text-sm font-bold" style={{ color: "#1a7a3c" }}>
                        {formatarPreco(produto.preco)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: "#eff4ff", color: "#2b3fd4" }}
                    >
                      Ver detalhes
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <ProdutoModal
          produto={selected}
          whatsapp={negocio.whatsapp}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
