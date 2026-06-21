import { Clock, MapPin, Phone, Globe, ShieldCheck, ExternalLink } from "lucide-react";
import type { Negocio } from "@/types";
import { isAberto, linkWhatsApp } from "@/lib/utils";

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

function mapaUrl(negocio: Negocio): string {
  if (negocio.localizacao?.lat) {
    return `https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(
    negocio.cidade + ", SC, Brasil"
  )}`;
}

const cardClass = "bg-white rounded-xl border p-6 shadow-sm space-y-4";
const cardStyle = { borderColor: "#becabc" };
const headingStyle = { color: "#0b1c30" };
const mutedStyle = { color: "#6f7a6e" };

interface Props {
  negocio: Negocio;
}

export function BusinessSidebar({ negocio }: Props) {
  const aberto = isAberto(
    negocio.horario_abertura,
    negocio.horario_fechamento,
    negocio.dias_funcionamento
  );
  const abreAs = negocio.horario_abertura?.slice(0, 5);
  const fechaAs = negocio.horario_fechamento?.slice(0, 5);
  const cidade =
    negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);
  const mensagem = `Olá! Vi o perfil de ${negocio.nome} no DescubraSul e gostaria de mais informações.`;

  return (
    <div className="space-y-6">
      {/* Horários */}
      {abreAs && fechaAs && (
        <div className={cardClass} style={cardStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={headingStyle}
          >
            <Clock className="w-5 h-5" style={{ color: "#1a7a3c" }} />
            Horários
          </h3>
          <div className="space-y-3">
            <div
              className="flex justify-between items-center p-3 rounded-lg border"
              style={{
                backgroundColor: aberto
                  ? "rgba(26,122,60,0.06)"
                  : "#f3f4f6",
                borderColor: aberto
                  ? "rgba(0,96,42,0.2)"
                  : "#e5e7eb",
              }}
            >
              <span
                className="font-bold"
                style={{ color: aberto ? "#00602a" : "#6f7a6e" }}
              >
                Hoje
              </span>
              <span
                className="font-bold"
                style={{ color: aberto ? "#00602a" : "#6f7a6e" }}
              >
                {aberto
                  ? `ABERTO · Fecha às ${fechaAs}`
                  : `Abre às ${abreAs}`}
              </span>
            </div>
            <div
              className="flex justify-between text-sm px-3"
              style={mutedStyle}
            >
              <span>Horário</span>
              <span>
                {abreAs} – {fechaAs}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contato */}
      {(negocio.whatsapp || negocio.website) && (
        <div className={cardClass} style={cardStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={headingStyle}
          >
            <Phone className="w-5 h-5" style={{ color: "#1a7a3c" }} />
            Contato
          </h3>
          <div className="space-y-4">
            {negocio.whatsapp && (
              <div className="flex items-start gap-3">
                <Phone
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: "#00602a" }}
                />
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-1"
                    style={mutedStyle}
                  >
                    WhatsApp
                  </p>
                  <a
                    href={linkWhatsApp(negocio.whatsapp, mensagem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                    style={{ color: "#25D366" }}
                  >
                    {negocio.whatsapp}
                  </a>
                </div>
              </div>
            )}
            {negocio.website && (
              <div className="flex items-start gap-3">
                <Globe
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: "#00602a" }}
                />
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-1"
                    style={mutedStyle}
                  >
                    Website
                  </p>
                  <a
                    href={negocio.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sm hover:underline flex items-center gap-1"
                    style={{ color: "#3549dc" }}
                  >
                    {negocio.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Endereço + Mapa */}
      {negocio.localizacao && (
        <div className={cardClass} style={cardStyle}>
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={headingStyle}
          >
            <MapPin className="w-5 h-5" style={{ color: "#1a7a3c" }} />
            Endereço
          </h3>
          {negocio.localizacao.direccao_fmt && (
            <p className="text-sm" style={mutedStyle}>
              {negocio.localizacao.direccao_fmt} — {cidade}, SC
            </p>
          )}
          <div
            className="w-full h-48 rounded-lg overflow-hidden border relative"
            style={{ borderColor: "#becabc" }}
          >
            <iframe
              title={`Mapa de ${negocio.nome}`}
              src={mapaEmbed(negocio)}
              className="w-full h-full border-0 opacity-90 pointer-events-none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <MapPin className="w-6 h-6 text-red-600 fill-red-600" />
              </div>
            </div>
          </div>
          <a
            href={mapaUrl(negocio)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: "#3549dc" }}
          >
            <ExternalLink className="w-4 h-4" />
            Abrir no Google Maps
          </a>
        </div>
      )}

      {/* Trust card */}
      <div
        className="rounded-xl border p-6 flex items-center gap-4"
        style={{
          backgroundColor: "#eff4ff",
          borderColor: "rgba(0,96,42,0.15)",
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: "#00602a" }}
        >
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: "#00602a" }}
          >
            Membro Certificado
          </p>
          <p className="text-sm font-medium" style={{ color: "#0b1c30" }}>
            Perfil verificado DescubraSul
          </p>
          <p className="text-xs mt-1" style={mutedStyle}>
            Identidade e localização verificadas
          </p>
        </div>
      </div>
    </div>
  );
}
