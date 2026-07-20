import { Clock, MapPin, Phone, Globe, ShieldCheck, ExternalLink, Calendar } from "lucide-react";
import type { Negocio } from "@/types";
import { isAberto, linkWhatsApp } from "@/lib/utils";
import { SocialIcon } from "@/components/ui/SocialIcon";

const ORDEM_DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const LABELS_DIAS: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui",
  sex: "Sex", sab: "Sáb", dom: "Dom",
};

function formatarDias(dias: string[]): string {
  if (!dias?.length) return "";
  if (dias.length === 7) return "Todos os dias";
  const tem = new Set(dias);
  if (dias.length === 5 && !tem.has("sab") && !tem.has("dom")) return "Seg – Sex";
  if (dias.length === 6 && !tem.has("dom")) return "Seg – Sáb";
  const sorted = ORDEM_DIAS.filter((d) => tem.has(d));
  return sorted.map((d) => LABELS_DIAS[d]).join(", ");
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

function mapaUrl(negocio: Negocio): string {
  if (negocio.localizacao?.lat) {
    return `https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(
    negocio.cidade + ", SC, Brasil"
  )}`;
}

const cardClass = "bg-white rounded-2xl border p-5 space-y-4";
const cardStyle = {
  borderColor: "#becabc",
  boxShadow: "0 1px 4px rgba(11,28,48,0.05), 0 1px 2px rgba(11,28,48,0.03)",
};
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
            className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            style={{ color: "#6f7a6e" }}
          >
            <Clock className="w-4 h-4" style={{ color: "#1a7a3c" }} />
            Horários
          </h3>
          <div className="space-y-3">
            <div
              className="flex justify-between items-center p-3 rounded-lg border"
              style={{
                backgroundColor: aberto ? "rgba(26,122,60,0.06)" : "#f3f4f6",
                borderColor: aberto ? "rgba(0,96,42,0.2)" : "#e5e7eb",
              }}
            >
              <span className="font-bold" style={{ color: aberto ? "#00602a" : "#6f7a6e" }}>
                Hoje
              </span>
              <span className="font-bold" style={{ color: aberto ? "#00602a" : "#6f7a6e" }}>
                {aberto ? `ABERTO · Fecha às ${fechaAs}` : `Abre às ${abreAs}`}
              </span>
            </div>
            <div className="flex justify-between text-sm px-3" style={mutedStyle}>
              <span>Horário</span>
              <span>{abreAs} – {fechaAs}</span>
            </div>
            {negocio.dias_funcionamento?.length > 0 && (
              <div className="flex justify-between items-center text-sm px-3" style={mutedStyle}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Dias
                </span>
                <span className="font-medium text-right" style={{ color: "#3f493f" }}>
                  {formatarDias(negocio.dias_funcionamento)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contato */}
      {(negocio.whatsapp || negocio.website) && (
        <div className={cardClass} style={cardStyle}>
          <h3
            className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            style={{ color: "#6f7a6e" }}
          >
            <Phone className="w-4 h-4" style={{ color: "#1a7a3c" }} />
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

      {/* Redes sociais */}
      {negocio.redes_sociais && Object.values(negocio.redes_sociais).some(Boolean) && (
        <div className={cardClass} style={cardStyle}>
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#6f7a6e" }}>
            <Globe className="w-4 h-4" style={{ color: "#1a7a3c" }} />
            Redes sociais
          </h3>
          <div className="flex flex-wrap gap-3">
            {negocio.redes_sociais.instagram_url && (
              <a href={negocio.redes_sociais.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                aria-label="Instagram">
                <SocialIcon rede="instagram" size={20} />
                <span style={mutedStyle}>Instagram</span>
              </a>
            )}
            {negocio.redes_sociais.tiktok_url && (
              <a href={negocio.redes_sociais.tiktok_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                aria-label="TikTok">
                <SocialIcon rede="tiktok" size={20} />
                <span style={mutedStyle}>TikTok</span>
              </a>
            )}
            {negocio.redes_sociais.facebook_url && (
              <a href={negocio.redes_sociais.facebook_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                aria-label="Facebook">
                <SocialIcon rede="facebook" size={20} />
                <span style={mutedStyle}>Facebook</span>
              </a>
            )}
            {negocio.redes_sociais.youtube_url && (
              <a href={negocio.redes_sociais.youtube_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                aria-label="YouTube">
                <SocialIcon rede="youtube" size={20} />
                <span style={mutedStyle}>YouTube</span>
              </a>
            )}
            {negocio.redes_sociais.linkedin_url && (
              <a href={negocio.redes_sociais.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                aria-label="LinkedIn">
                <SocialIcon rede="linkedin" size={20} />
                <span style={mutedStyle}>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Endereço + Mapa */}
      {negocio.localizacao && (
        <div className={cardClass} style={cardStyle}>
          <h3
            className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            style={{ color: "#6f7a6e" }}
          >
            <MapPin className="w-4 h-4" style={{ color: "#1a7a3c" }} />
            Endereço
          </h3>
          {negocio.localizacao.direccao_fmt && (
            <p className="text-sm" style={mutedStyle}>
              {negocio.localizacao.direccao_fmt}
              {negocio.localizacao.bairro && `, ${negocio.localizacao.bairro}`}
              {" "}— {cidade}, SC
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
        className="rounded-2xl border p-4 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #eff4ff 100%)",
          borderColor: "rgba(26,122,60,0.2)",
          boxShadow: "0 1px 4px rgba(11,28,48,0.04)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #1a7a3c 0%, #00602a 100%)" }}
        >
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#00602a" }}>
            Membro Certificado
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#0b1c30" }}>
            Perfil verificado DescubraSul
          </p>
          <p className="text-xs mt-0.5" style={mutedStyle}>
            Identidade e localização confirmadas
          </p>
        </div>
      </div>
    </div>
  );
}
