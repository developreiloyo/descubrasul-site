"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { linkWhatsApp } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.519 5.26l-.999 3.648 3.969-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
    </svg>
  );
}

interface Props {
  negocioSlug: string;
  whatsapp: string;
  nome: string;
}

export function BusinessActions({ negocioSlug, whatsapp, nome }: Props) {
  const mensagem = `Olá! Vi o perfil de ${nome} no DescubraSul e gostaria de mais informações.`;

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: nome, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
    <a 
        href={linkWhatsApp(whatsapp, mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarClique(negocioSlug, "whatsapp")}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        <WhatsAppIcon className="size-5" />
        Falar no WhatsApp
      </a>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white px-5 py-3 text-base font-medium text-ink transition-colors hover:bg-ink/5"
      >
        <Share2 className="size-5" />
        Compartilhar
      </button>
    </div>
  );
}