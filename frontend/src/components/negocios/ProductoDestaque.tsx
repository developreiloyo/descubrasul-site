"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mediaUrl, formatarPreco, linkWhatsApp } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";

interface Foto {
  id: number;
  foto: string;
  alt_texto: string;
}

interface Produto {
  slug: string;
  nome: string;
  foto: string | null;
  alt_foto: string;
  descricao: string;
  preco: string | null;
  fotos: Foto[];
}

interface Negocio {
  slug: string;
  nome: string;
  whatsapp: string;
  categoria?: { icone?: string };
}

interface Props {
  produto: Produto;
  negocio: Negocio;
}

export function ProductoDestaque({ produto, negocio }: Props) {
  const todasFotos: { src: string; alt: string }[] = [];

  if (produto.foto) {
    todasFotos.push({
      src: mediaUrl(produto.foto)!,
      alt: produto.alt_foto || produto.nome,
    });
  }

  produto.fotos.forEach((f) => {
    const url = mediaUrl(f.foto);
    if (url && url !== todasFotos[0]?.src) {
      todasFotos.push({ src: url, alt: f.alt_texto || produto.nome });
    }
  });

  const [atual, setAtual] = useState(0);

  function anterior() {
    setAtual((i) => (i === 0 ? todasFotos.length - 1 : i - 1));
  }

  function proximo() {
    setAtual((i) => (i === todasFotos.length - 1 ? 0 : i + 1));
  }

  const semFoto = todasFotos.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
      <div className="relative aspect-[16/9] w-full bg-ink/5">
        {semFoto ? (
          <div className="flex h-full items-center justify-center text-6xl">
            {negocio.categoria?.icone || "📦"}
          </div>
        ) : (
          <>
            <Image
              src={todasFotos[atual].src}
              alt={todasFotos[atual].alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
            {todasFotos.length > 1 && (
              <>
                <button
                  onClick={anterior}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={proximo}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Proxima foto"
                >
                  <ChevronRight className="size-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {todasFotos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setAtual(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === atual ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {todasFotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {todasFotos.map((f, i) => (
            <button
              key={i}
              onClick={() => setAtual(i)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === atual ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={f.src} alt={f.alt} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <h2 className="text-xl font-bold">{produto.nome}</h2>
        {produto.descricao && (
          <p className="mt-1 text-sm text-ink/60 leading-relaxed">{produto.descricao}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          {produto.preco && (
            <p className="text-2xl font-bold text-primary">{formatarPreco(produto.preco)}</p>
          )}
          <a
            href={linkWhatsApp(
              negocio.whatsapp,
              `Ola! Tenho interesse em "${produto.nome}" que vi no DescubraSul.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarClique(negocio.slug, "whatsapp", produto.slug)}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
          >
            Solicitar
          </a>
        </div>
      </div>
    </div>
  );
}