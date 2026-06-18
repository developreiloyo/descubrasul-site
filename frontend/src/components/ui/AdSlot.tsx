// AD SLOT — reserva espaço visual para publicidade sem causar CLS.
// min-height garante que o layout não mude quando o anúncio carregar.
// Integrar rede publicitária: passar `network` e instanciar o script aqui.

interface Props {
  id: string;
  size: "leaderboard" | "rectangle" | "responsive";
  network?: "adsense" | "mercadoads";
  className?: string;
}

const DIMENSIONS: Record<Props["size"], { minH: string; maxW: string }> = {
  leaderboard: { minH: "min-h-[90px]",  maxW: "max-w-[728px]" },
  rectangle:   { minH: "min-h-[250px]", maxW: "max-w-[300px]" },
  responsive:  { minH: "min-h-[90px]",  maxW: "max-w-full" },
};

export function AdSlot({ id, size, className = "" }: Props) {
  const { minH, maxW } = DIMENSIONS[size];

  return (
    <div
      id={id}
      aria-hidden="true"
      className={[
        "flex items-center justify-center",
        "w-full mx-auto",
        minH,
        maxW,
        "bg-ink/[0.03] border border-dashed border-ink/10 rounded-xl",
        className,
      ].join(" ")}
    >
      {/* AD SLOT */}
    </div>
  );
}
