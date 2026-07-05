"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, MessageCircle } from "lucide-react";
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

// ─── Modal ────────────────────────────────────────────────────────────
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft"  && imagens.length > 1) prev();
      if (e.key === "ArrowRight" && imagens.length > 1) next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, imagens.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const numero = whatsapp.replace(/\D/g, "");
  const msg    = encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}`);
  const waUrl  = `https://wa.me/${numero}?text=${msg}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg md:max-w-2xl max-h-[92dvh] md:max-h-[88dvh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {imagens.length > 0 ? (
          <div className="relative w-full aspect-[4/3] bg-[#e5eeff] overflow-hidden rounded-t-2xl">
            <Image
              src={imagens[idx]}
              alt={produto.alt_foto || produto.nome}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            {imagens.length > 1 && (
              <>
                <button onClick={prev} aria-label="Imagem anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={next} aria-label="Próxima imagem"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {imagens.map((_, i) => (
                    <button key={i} onClick={() => setIdx(i)} aria-label={`Imagem ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-white scale-125" : "bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-[#e5eeff] rounded-t-2xl flex items-center justify-center text-7xl">📦</div>
        )}

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold leading-snug" style={{ color: "#0b1c30" }}>{produto.nome}</h2>
            {produto.preco && (
              <span className="text-xl font-extrabold shrink-0" style={{ color: "#1a7a3c" }}>
                {formatarPreco(produto.preco)}
              </span>
            )}
          </div>
          {produto.descricao && (
            <p className="text-sm leading-relaxed" style={{ color: "#3f493f" }}>{produto.descricao}</p>
          )}
          {produto.descricao_longa && (
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#3f493f" }}>{produto.descricao_longa}</p>
          )}
          {numero && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white text-sm"
              style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp sobre este produto
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card Destaque (grande — 60%) ────────────────────────────────────
function CardDestaque({
  produto,
  negocio,
  onClick,
}: {
  produto: Produto;
  negocio: Negocio;
  onClick: () => void;
}) {
  const imgUrl =
    mediaUrl(produto.foto) ??
    (produto.fotos?.[0] ? mediaUrl(produto.fotos[0].foto) : null);

  return (
    <article
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer"
      style={{ borderColor: "#becabc" }}
    >
      {/* Imagem: 16/9 em mobile, 4/3 em desktop */}
      <div
        className="relative w-full aspect-[16/9] md:aspect-[4/3] overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "#e5eeff" }}
      >
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={produto.alt_foto || produto.nome}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl">
            {negocio.categoria?.icone ?? "📦"}
          </div>
        )}

        {/* Badge Destaque */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: "#00602a" }}
        >
          ★ Destaque
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-bold leading-snug" style={{ color: "#0b1c30" }}>
          {produto.nome}
        </h3>

        {produto.descricao && (
          <p
            className="mt-2 text-sm leading-relaxed line-clamp-2 md:line-clamp-4 flex-1"
            style={{ color: "#3f493f" }}
          >
            {produto.descricao}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          {produto.preco && (
            <span className="text-lg md:text-xl font-extrabold" style={{ color: "#1a7a3c" }}>
              {formatarPreco(produto.preco)}
            </span>
          )}
          <button
            className="flex-1 max-w-[180px] py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#2b3fd4" }}
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Card Pequeno (grid 2×2 — 40%) ──────────────────────────────────
function CardPequeno({
  produto,
  negocio,
  onClick,
}: {
  produto: Produto;
  negocio: Negocio;
  onClick: () => void;
}) {
  const imgUrl =
    mediaUrl(produto.foto) ??
    (produto.fotos?.[0] ? mediaUrl(produto.fotos[0].foto) : null);

  return (
    <article
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
      style={{ borderColor: "#becabc" }}
    >
      {/* Imagem quadrada */}
      <div
        className="relative w-full aspect-square overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "#e5eeff" }}
      >
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={produto.alt_foto || produto.nome}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            {negocio.categoria?.icone ?? "📦"}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-3">
        <h3
          className="text-xs md:text-sm font-semibold leading-snug line-clamp-2 flex-1"
          style={{ color: "#0b1c30" }}
        >
          {produto.nome}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-1">
          {produto.preco ? (
            <span className="text-xs font-bold" style={{ color: "#1a7a3c" }}>
              {formatarPreco(produto.preco)}
            </span>
          ) : (
            <span />
          )}
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-md"
            style={{ backgroundColor: "#eff4ff", color: "#2b3fd4" }}
          >
            Ver
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Seção principal ─────────────────────────────────────────────────
interface Props {
  negocio: Negocio;
  produtos: Produto[];
}

export function ProdutosSection({ negocio, produtos }: Props) {
  const [selected, setSelected] = useState<Produto | null>(null);

  if (produtos.length === 0) return null;

  const catSlug   = negocio.categoria?.slug ?? "";
  const titulo    = TITULO_SECAO[catSlug] ?? "Produtos";
  const linkLabel = LINK_LABEL[catSlug] ?? "Ver todos";

  // Destaque: índice 0 — Pequenos: índices 1..4 (máx 4)
  const [destaque, ...resto] = produtos;
  const pequenos = resto.slice(0, 4);

  return (
    <>
      <section id="produtos-destaque" className="flex flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold" style={{ color: "#0b1c30" }}>
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

        {/* Layout editorial assimétrico */}
        <div className={`flex flex-col gap-3 md:gap-5 ${pequenos.length > 0 ? "md:flex-row md:items-start" : ""}`}>
          {/* Coluna esquerda — card destaque (60%) */}
          <div className={pequenos.length > 0 ? "md:w-[60%]" : "w-full"}>
            <CardDestaque
              produto={destaque}
              negocio={negocio}
              onClick={() => setSelected(destaque)}
            />
          </div>

          {/* Coluna direita — grid 2×2 (40%) */}
          {pequenos.length > 0 && (
            <div className="md:w-[40%] grid grid-cols-2 gap-3">
              {pequenos.map((p) => (
                <CardPequeno
                  key={p.slug}
                  produto={p}
                  negocio={negocio}
                  onClick={() => setSelected(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

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
