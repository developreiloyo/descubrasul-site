"use client";

import { linkWhatsApp } from "@/lib/utils";

interface Props {
  numero: string;
  mensagem: string;
  texto?: string;
}

export function BotaoWhatsApp({ numero, mensagem, texto = "Falar no WhatsApp" }: Props) {
  return (
    <a
      href={linkWhatsApp(numero, mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
    >
      <span aria-hidden>💬</span>
      {texto}
    </a>
  );
}
