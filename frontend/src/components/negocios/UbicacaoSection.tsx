import { MapPin, ExternalLink } from "lucide-react";
import type { Negocio } from "@/types";

function mapaUrl(negocio: Negocio): string {
  if (negocio.localizacao?.lat) {
    return `https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(
    (negocio.localizacao?.direccao_fmt ?? negocio.cidade) + ", SC, Brasil"
  )}`;
}

function mapaEmbed(negocio: Negocio): string {
  if (negocio.localizacao?.lat) {
    return `https://www.google.com/maps?q=${negocio.localizacao.lat},${negocio.localizacao.lng}&z=15&output=embed`;
  }
  if (negocio.localizacao?.direccao_fmt) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      negocio.localizacao.direccao_fmt + ", SC, Brasil"
    )}&z=15&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(
    negocio.cidade + ", SC, Brasil"
  )}&z=13&output=embed`;
}

interface Props {
  negocio: Negocio;
  className?: string;
}

export function UbicacaoSection({ negocio, className = "" }: Props) {
  const loc     = negocio.localizacao;
  const cidade  = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  return (
    <section className={`rounded-2xl border border-ink/10 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="mb-4 text-xl font-bold text-ink">Localização</h2>

      {loc?.direccao_fmt && (
        <div className="mb-4 flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-ink/30" />
          <div>
            <p className="font-medium text-ink">{loc.direccao_fmt}</p>
            <p className="text-xs text-ink/50">
              {loc.bairro ? `${loc.bairro} · ` : ""}
              {cidade}, SC
            </p>
            <a
              href={mapaUrl(negocio)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver no Google Maps <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )}

      <div className="h-48 w-full overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
        <iframe
          title={`Mapa de ${negocio.nome}`}
          src={mapaEmbed(negocio)}
          className="h-full w-full border-0 grayscale opacity-90"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
