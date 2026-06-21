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
    <section>
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "#0b1c30" }}
      >
        Nossa história
      </h2>
      <div
        className="bg-white rounded-xl border p-6 shadow-sm"
        style={{ borderColor: "#becabc" }}
      >
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
          <p
            className="text-base leading-relaxed"
            style={{ color: "#3f493f" }}
          >
            {historia}
          </p>
        </div>
      </div>
    </section>
  );
}
