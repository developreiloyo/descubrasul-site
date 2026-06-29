import Link from "next/link";

interface CityCardProps {
  slug: string;
  nome: string;
  count: number;
}

export function CityCard({ slug, nome, count }: CityCardProps) {
  return (
    <Link
      href={`/cidades/${slug}`}
      className="group flex flex-col items-center justify-center gap-2.5 py-8 px-4 bg-[#FAF8F3] hover:bg-[#1a7a3c] transition-colors duration-200 text-center"
    >
      {/* Pin SVG line-art — stroke herda currentColor do container */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-[#9a948e] group-hover:text-white/70 transition-colors duration-200"
      >
        <path
          d="M11 2C7.7 2 5 4.7 5 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6z"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />
        <circle cx="11" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      </svg>

      {/* Nome */}
      <p className="font-playfair text-[0.88rem] font-bold leading-snug text-[#1a1a1a] group-hover:text-white transition-colors duration-200">
        {nome}
      </p>

      {/* Contador — omitido quando 0 (site em construção) */}
      {count > 0 && (
        <p className="text-[10.5px] tracking-[0.04em] text-[#9a948e] group-hover:text-white/55 transition-colors duration-200">
          {count} negócios
        </p>
      )}
    </Link>
  );
}
