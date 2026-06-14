import { Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { Negocio } from "@/types";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

interface Props {
  negocio: Negocio;
}

export function BusinessSidebar({ negocio }: Props) {
  const abreAs = negocio.horario_abertura?.slice(0, 5);
  const fechaAs = negocio.horario_fechamento?.slice(0, 5);
  const cidade = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  const redes = [
    { url: negocio.redes_sociais?.instagram_url, Icon: InstagramIcon, label: "Instagram" },
    { url: negocio.redes_sociais?.facebook_url,  Icon: FacebookIcon,  label: "Facebook" },
    { url: negocio.redes_sociais?.tiktok_url,    Icon: TikTokIcon,    label: "TikTok" },
  ].filter((r) => r.url);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Informações do negócio</h2>

        {abreAs && fechaAs && (
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-semibold text-green-600">Aberto agora</span>
          </div>
        )}

        <ul className="mt-4 space-y-3 text-sm">
          {abreAs && fechaAs && (
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-ink/40" />
              <span className="text-ink/70">
                Abre às {abreAs} · Fecha às {fechaAs}
              </span>
            </li>
          )}

          {negocio.localizacao?.direccao_fmt && (
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink/40" />
              <div>
                <p className="text-ink/70">{negocio.localizacao.direccao_fmt}</p>
                <p className="text-ink/50">{cidade}, SC</p>
                {negocio.localizacao.lat && (
                  <a
                    href={`https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver no Google Maps →
                  </a>
                )}
              </div>
            </li>
          )}

          {negocio.whatsapp && (
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-ink/40" />
              <span className="text-ink/70">{negocio.whatsapp}</span>
            </li>
          )}
        </ul>

        {negocio.localizacao?.lat && (
          <a
            href={`https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block overflow-hidden rounded-lg border border-ink/10"
          >
            <iframe
              title={`Mapa de ${negocio.nome}`}
              className="pointer-events-none h-40 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${negocio.localizacao.lat},${negocio.localizacao.lng}&output=embed`}
            />
          </a>
        )}
      </section>

      {redes.length > 0 && (
        <section className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Redes Sociais</h2>
          <div className="flex gap-3">
            {redes.map(({ url, Icon, label }) => (
              <a
                key={label}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-11 items-center justify-center rounded-full bg-ink/5 text-ink transition-colors hover:bg-primary hover:text-white"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-xl border border-ink/10 bg-white p-4 text-center">
        <p className="text-xs text-ink/40">Vitrina digital por</p>
        <p className="font-bold text-primary">
          Descubra<span className="text-amber-500">Sul</span>
        </p>
        <Link href="/" className="text-xs text-ink/40 hover:text-primary hover:underline">
          Cadastre seu negócio grátis →
        </Link>
      </div>
    </div>
  );
}