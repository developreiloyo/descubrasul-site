"use client";

import { MapPin, Phone, Share2, MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";
import type { Negocio } from "@/types";

interface Props {
  negocio: Negocio;
}

export function QuickActionsBar({ negocio }: Props) {
  const mensagem = `Olá! Vi o perfil de ${negocio.nome} no DescubraSul e gostaria de mais informações.`;
  const mapaUrl = negocio.localizacao?.lat
    ? `https://maps.google.com/?q=${negocio.localizacao.lat},${negocio.localizacao.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(negocio.cidade + ", SC, Brasil")}`;

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
    <div
      className="px-4 -mt-6 relative z-10 grid gap-3 mb-6"
      style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
    >
      <a
        href={mapaUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarClique(negocio.slug, "maps")}
        className="bg-white rounded-xl h-14 flex items-center justify-center active:scale-95 transition-all"
        style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
        aria-label="Como chegar"
      >
        <MapPin className="w-6 h-6" style={{ color: "#00602a" }} />
      </a>

      <a
        href={`tel:${(negocio.whatsapp ?? "").replace(/\D/g, "")}`}
        className="bg-white rounded-xl h-14 flex items-center justify-center active:scale-95 transition-all"
        style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
        aria-label="Ligar"
      >
        <Phone className="w-6 h-6" style={{ color: "#00602a" }} />
      </a>

      <button
        onClick={() => {
          handleShare();
          registrarClique(negocio.slug, "share");
        }}
        className="bg-white rounded-xl h-14 flex items-center justify-center active:scale-95 transition-all"
        style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
        aria-label="Compartilhar"
      >
        <Share2 className="w-6 h-6" style={{ color: "#00602a" }} />
      </button>

      <a
        href={linkWhatsApp(negocio.whatsapp ?? "", mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarClique(negocio.slug, "whatsapp")}
        className="rounded-xl h-14 flex items-center justify-center active:scale-95 transition-all text-white"
        style={{
          backgroundColor: "#25D366",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        }}
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>
    </div>
  );
}
