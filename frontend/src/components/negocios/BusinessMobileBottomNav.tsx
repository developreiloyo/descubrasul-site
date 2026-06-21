"use client";

import Link from "next/link";
import { Home, MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/utils";
import { registrarClique } from "@/hooks/useTracking";
import type { Negocio } from "@/types";

interface Props {
  negocio: Negocio;
}

export function BusinessMobileBottomNav({ negocio }: Props) {
  const mensagem = `Olá! Vi o perfil de ${negocio.nome} no DescubraSul e gostaria de mais informações.`;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 rounded-t-xl"
      style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #becabc",
        boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.1)",
      }}
    >
      <Link
        href="/"
        className="flex flex-col items-center gap-1 px-6 py-2 rounded-full transition-all"
        style={{ backgroundColor: "#1a7a3c" }}
      >
        <Home className="w-5 h-5 text-white" />
        <span className="text-xs font-semibold" style={{ color: "#aaffb7" }}>
          Início
        </span>
      </Link>

      {negocio.whatsapp && (
        <a
          href={linkWhatsApp(negocio.whatsapp, mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrarClique(negocio.slug, "whatsapp")}
          className="flex flex-col items-center gap-1 px-6 py-2 transition-all"
          style={{ color: "#6f7a6e" }}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-semibold">Contato</span>
        </a>
      )}
    </nav>
  );
}
