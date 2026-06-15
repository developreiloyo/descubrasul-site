import Link from "next/link";
import { Clock, MapPin, Phone, ExternalLink } from "lucide-react";
import type { Negocio } from "@/types";

function InstagramIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

function isAberto(abertura: string | null, fechamento: string | null): boolean {
  if (!abertura || !fechamento) return false;
  const agora = new Date();
  const partes = new Intl.DateTimeFormat("pt-BR", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).formatToParts(agora);
  const h = Number(partes.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(partes.find((p) => p.type === "minute")?.value ?? 0);
  const [hA, mA] = abertura.split(":").map(Number);
  const [hF, mF] = fechamento.split(":").map(Number);
  const atual = h * 60 + m;
  return atual >= hA * 60 + mA && atual < hF * 60 + mF;
}

interface Props {
  negocio: Negocio;
}

function mapaUrl(negocio: Negocio): string {
  if (negocio.localizacao?.lat) {
    return `https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(negocio.cidade + ", SC, Brasil")}`;
}

function mapaEmbed(negocio: Negocio): string {
  if (negocio.localizacao?.lat) {
    return `https://www.google.com/maps?q=${negocio.localizacao.lat},${negocio.localizacao.lng}&z=15&output=embed`;
  }
  if (negocio.localizacao?.direccao_fmt) {
    return `https://www.google.com/maps?q=${encodeURIComponent(negocio.localizacao.direccao_fmt + ", SC, Brasil")}&z=15&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(negocio.cidade + ", SC, Brasil")}&z=13&output=embed`;
}

export function BusinessSidebar({ negocio }: Props) {
  const abreAs = negocio.horario_abertura?.slice(0, 5);
  const fechaAs = negocio.horario_fechamento?.slice(0, 5);
  const aberto = isAberto(negocio.horario_abertura, negocio.horario_fechamento);
  const cidade = negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  const redes = [
    { url: negocio.redes_sociais?.instagram_url, Icon: InstagramIcon, label: "Instagram" },
    { url: negocio.redes_sociais?.facebook_url,  Icon: FacebookIcon,  label: "Facebook" },
    { url: negocio.redes_sociais?.tiktok_url,    Icon: TikTokIcon,    label: "TikTok" },
  ].filter((r) => r.url);

  return (
    <div className="space-y-5">

      {/* Info card */}
      <div className="bg-white border border-ink/10 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-ink border-b border-ink/10 pb-2">
          Informações do negócio
        </h3>

        <div className="space-y-3.5 text-sm">
          {abreAs && fechaAs && (
            <div className="flex items-center space-x-2.5">
              {aberto ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                    Aberto agora
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ink/20" />
                  </span>
                  <span className="font-medium text-ink/50 bg-ink/5 px-2 py-0.5 rounded text-xs">
                    Fechado agora
                  </span>
                </>
              )}
            </div>
          )}

          {abreAs && fechaAs && (
            <div className="flex items-start space-x-2.5 text-ink/60">
              <Clock className="w-4 h-4 mt-0.5 text-ink/30 flex-shrink-0" />
              <span>Abre às {abreAs} · Fecha às {fechaAs}</span>
            </div>
          )}

          {negocio.localizacao?.direccao_fmt && (
            <div className="flex items-start space-x-2.5 text-ink/60">
              <MapPin className="w-4 h-4 mt-0.5 text-ink/30 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-ink">{negocio.localizacao.direccao_fmt}</p>
                <p className="text-xs text-ink/40">{cidade}, SC</p>
                <a
                  href={mapaUrl(negocio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold text-xs inline-flex items-center gap-0.5 hover:underline"
                >
                  Ver no Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {negocio.whatsapp && (
            <div className="flex items-start space-x-2.5 text-ink/60">
              <Phone className="w-4 h-4 mt-0.5 text-ink/30 flex-shrink-0" />
              <span>Tel / WhatsApp: <strong className="text-ink">{negocio.whatsapp}</strong></span>
            </div>
          )}
        </div>

        {/* Mapa embed */}
        <div className="w-full h-40 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 relative">
          <iframe
            title={`Mapa de ${negocio.nome}`}
            src={mapaEmbed(negocio)}
            className="w-full h-full border-0 grayscale opacity-90 pointer-events-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Redes sociais */}
      {redes.length > 0 && (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">Redes sociais</h3>
          <div className="flex items-center space-x-3">
            {redes.map(({ url, Icon, label }) => (
              <a
                key={label}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink/50 hover:text-primary hover:border-primary transition bg-ink/5"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Vitrina digital */}
      <div className="bg-gradient-to-br from-teal-50 to-stone-50 border border-teal-100 rounded-2xl p-5 space-y-2.5 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
          Vitrina digital
        </span>
        <p className="text-xs text-stone-500 font-medium">
          Este perfil é mantido e autenticado pela plataforma oficial DescubraSul.
        </p>
        <Link
          href="/painel/cadastro"
          className="text-xs font-bold text-secondary hover:text-secondary/80 inline-flex items-center gap-1 transition pt-1"
        >
          Cadastre seu negócio grátis →
        </Link>
      </div>
    </div>
  );
}
