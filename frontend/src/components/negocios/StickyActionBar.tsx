"use client";

import { Share2, MapPin, Star, MessageCircle, Phone } from "lucide-react";
import { linkWhatsApp } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";
import type { Negocio } from "@/types";

interface Props {
  negocio: Negocio;
}

export function StickyActionBar({ negocio }: Props) {
  const mensagem = `Olá! Vi o perfil de ${negocio.nome} no DescubraSul e gostaria de mais informações.`;
  const mapaUrl = negocio.localizacao?.lat
    ? `https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(negocio.cidade + ", SC, Brasil")}`;

  const cidade =
    negocio.cidade.charAt(0).toUpperCase() + negocio.cidade.slice(1);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: negocio.nome, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  }

  return (
    <nav
      className="sticky top-20 z-40 border-b"
      style={{ backgroundColor: "#ffffff", borderColor: "#becabc" }}
    >
      <div className="max-w-[1280px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Meta info */}
        <div className="flex items-center gap-8">
          {negocio.categoria && (
            <div className="flex flex-col">
              <span className="text-xs" style={{ color: "#6f7a6e" }}>
                Categoria
              </span>
              <span className="font-bold" style={{ color: "#0b1c30" }}>
                {negocio.categoria.icone} {negocio.categoria.nome}
              </span>
            </div>
          )}
          <div
            className="w-px h-8"
            style={{ backgroundColor: "#becabc" }}
          />
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: "#6f7a6e" }}>
              Localização
            </span>
            <span className="font-bold" style={{ color: "#0b1c30" }}>
              {cidade}, SC
            </span>
          </div>
          {negocio.total_avaliacoes > 0 && (
            <>
              <div
                className="w-px h-8"
                style={{ backgroundColor: "#becabc" }}
              />
              <div className="flex flex-col">
                <span className="text-xs" style={{ color: "#6f7a6e" }}>
                  Avaliação
                </span>
                <span
                  className="font-bold flex items-center gap-1"
                  style={{ color: "#0b1c30" }}
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {negocio.media_nota} ({negocio.total_avaliacoes})
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {negocio.whatsapp && (
            <a
              href={linkWhatsApp(negocio.whatsapp, mensagem)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarClique(negocio.slug, "whatsapp")}
              className="flex items-center gap-2 px-6 h-11 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: "#25D366",
                boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
              }}
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          )}
          {negocio.whatsapp && (
            <a
              href={`tel:${negocio.whatsapp.replace(/\D/g, "")}`}
              className="border px-4 h-11 rounded-xl flex items-center gap-2 font-semibold transition-all hover:bg-[#eff4ff]"
              style={{ borderColor: "#6f7a6e", color: "#3f493f" }}
            >
              <Phone className="w-4 h-4" />
              Ligar
            </a>
          )}
          <button
            onClick={() => {
              handleShare();
              registrarClique(negocio.slug, "share");
            }}
            className="border h-11 w-11 rounded-xl flex items-center justify-center transition-all hover:bg-[#eff4ff]"
            style={{ borderColor: "#6f7a6e" }}
            aria-label="Compartilhar"
          >
            <Share2 className="w-5 h-5" style={{ color: "#3f493f" }} />
          </button>
          {negocio.localizacao && (
            <a
              href={mapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registrarClique(negocio.slug, "maps")}
              className="border px-4 h-11 rounded-xl flex items-center gap-2 font-semibold transition-all hover:bg-[#eff4ff]"
              style={{ borderColor: "#6f7a6e", color: "#3f493f" }}
            >
              <MapPin className="w-4 h-4" />
              Como chegar
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
