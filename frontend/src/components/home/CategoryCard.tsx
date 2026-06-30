import Link from "next/link";

interface CategoryCardProps {
  slug: string;
  nome: string;
  icone: string;
  numero: string;
  count?: number;
}

export function CategoryCard({ slug, nome, icone, numero, count }: CategoryCardProps) {
  return (
    <Link
      href={`/${slug}`}
      className="group relative flex flex-col gap-3.5 p-7 bg-[#FAF8F3] hover:bg-[#1a1a1a] transition-colors duration-200"
    >
      {/* Numeração itálica dourada */}
      <span className="font-playfair text-[11px] italic text-[#D4A437]">
        {numero}
      </span>

      {/* Seta ↗ — visível só no hover, desliza de baixo-esquerda para cima-direita */}
      <span
        aria-hidden="true"
        className="absolute top-6 right-6 text-sm text-[#FAF6EF] opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200"
      >
        ↗
      </span>

      {/* Emoji — grayscale no estado normal, colorido no hover */}
      <span
        aria-hidden="true"
        className="text-[28px] leading-none select-none transition-transform duration-200 group-hover:scale-110"
      >
        {icone}
      </span>

      {/* Nome da categoria */}
      <p className="font-playfair text-[1.1rem] font-bold leading-snug text-[#1a1a1a] group-hover:text-[#FAF6EF] transition-colors duration-200">
        {nome}
      </p>

      {/* Contador — omitido se não fornecido */}
      {count !== undefined && (
        <p className="text-[11px] font-medium tracking-[0.04em] text-[#9a948e] group-hover:text-[rgba(250,246,239,0.4)] transition-colors duration-200">
          {count} negócios
        </p>
      )}
    </Link>
  );
}
