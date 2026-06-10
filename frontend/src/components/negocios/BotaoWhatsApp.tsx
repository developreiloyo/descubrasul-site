"use client";

import { linkWhatsApp } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";

interface Props {
  numero: string;
  mensagem: string;
  texto?: string;
  negocioSlug: string;
  produtoSlug?: string;
}

export function BotaoWhatsApp({
  numero,
  mensagem,
  texto = "Falar no WhatsApp",
  negocioSlug,
  produtoSlug,
}: Props) {
  function handleClick() {
    registrarClique(negocioSlug, "whatsapp", produtoSlug);
  }

  return (
    <a
      href={linkWhatsApp(numero, mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
    >
      <span aria-hidden>💬</span>
      {texto}
    </a>
  );
}
