import type { ReactNode } from "react";

interface PromoCardProps {
  nome: string;
  categoria: string;
  cidade: string;
  descricao: string;
  precoOriginal: number;
  precoNovo: number;
  validade: string;
  desconto?: number;
  colorVariant?: "verde" | "azul" | "dourado";
}

const GRADIENTS: Record<string, string> = {
  verde:
    "linear-gradient(145deg, #0f2a14 0%, #1a7a3c 55%, #26a855 80%, #1a7a3c 100%)",
  azul:
    "linear-gradient(145deg, #0e1640 0%, #2b3fd4 55%, #4a5de8 80%, #1e2ba0 100%)",
  dourado:
    "linear-gradient(145deg, #2a1500 0%, #8B5020 50%, #D4A437 85%, #a07a28 100%)",
};

const GEO: Record<string, ReactNode> = {
  verde: (
    <svg
      viewBox="0 0 360 180"
      fill="none"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <circle cx="280" cy="40" r="80" stroke="white" strokeWidth="0.6" opacity="0.3" />
      <circle cx="280" cy="40" r="50" stroke="white" strokeWidth="0.6" opacity="0.2" />
    </svg>
  ),
  azul: (
    <svg
      viewBox="0 0 360 180"
      fill="none"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <line x1="0" y1="180" x2="360" y2="0" stroke="white" strokeWidth="0.8" opacity="0.2" />
      <line x1="0" y1="120" x2="360" y2="60" stroke="white" strokeWidth="0.4" opacity="0.15" />
    </svg>
  ),
  dourado: (
    <svg
      viewBox="0 0 360 180"
      fill="none"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <rect
        x="220"
        y="-20"
        width="200"
        height="200"
        rx="100"
        stroke="white"
        strokeWidth="0.6"
        opacity="0.15"
        transform="rotate(15 280 80)"
      />
    </svg>
  ),
};

export function PromoCard({
  nome,
  categoria,
  cidade,
  descricao,
  precoOriginal,
  precoNovo,
  validade,
  desconto,
  colorVariant = "verde",
}: PromoCardProps) {
  const pct = desconto ?? Math.round((1 - precoNovo / precoOriginal) * 100);
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <article className="bg-white border border-[#ddd8cf] rounded-2xl overflow-hidden card-hover">

      {/* Header colorido */}
      <div
        className="relative h-[176px] overflow-hidden"
        style={{ background: GRADIENTS[colorVariant] }}
      >
        {/* Overlay: reflexo de luz + vinheta inferior */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 75% 20%, rgba(255,255,255,0.12) 0%, transparent 45%), linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        {/* SVG geométrico decorativo */}
        {GEO[colorVariant]}

        {/* Badge dourado com % */}
        <div
          aria-label={`${pct}% de desconto`}
          className="absolute z-10 top-3.5 right-3.5 bg-[#D4A437] text-[#111110] font-playfair text-[15px] font-extrabold leading-none px-3 py-2"
        >
          {pct}%
        </div>
      </div>

      {/* Corpo */}
      <div className="px-6 py-[22px]">

        {/* Categoria · Cidade */}
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#1a7a3c] mb-2">
          {categoria} · {cidade}
        </p>

        {/* Nome do negócio */}
        <h3 className="font-playfair text-[1.15rem] font-bold leading-snug text-[#1a1a1a] mb-1.5">
          {nome}
        </h3>

        {/* Descrição */}
        <p className="text-[13px] text-[#6b6561] leading-[1.55] mb-[18px]">
          {descricao}
        </p>

        {/* Preços: tachado + novo */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-[13px] text-[#9a948e] line-through">
            {fmt(precoOriginal)}
          </span>
          <span className="font-playfair text-[1.4rem] font-bold text-[#1a7a3c]">
            {fmt(precoNovo)}
          </span>
        </div>

        {/* Validade */}
        <p className="text-[10.5px] text-[#9a948e] mt-1.5">{validade}</p>

      </div>
    </article>
  );
}
