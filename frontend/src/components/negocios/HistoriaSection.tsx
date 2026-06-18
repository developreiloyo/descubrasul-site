import Image from "next/image";
import { mediaUrl } from "@/lib/utils";

interface Props {
  nome: string;
  historia: string;
  logo: string | null;
  altLogo: string;
}

export function HistoriaSection({ nome, historia, logo, altLogo }: Props) {
  if (!historia?.trim()) return null;

  const fotoUrl = mediaUrl(logo);

  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-ink">Nossa história</h2>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {fotoUrl && (
          <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-xl sm:mx-0">
            <Image
              src={fotoUrl}
              alt={altLogo || `Foto de ${nome}`}
              fill
              className="object-cover"
              sizes="144px"
            />
          </div>
        )}
        <p className="text-sm leading-relaxed text-ink/70">{historia}</p>
      </div>
    </section>
  );
}
