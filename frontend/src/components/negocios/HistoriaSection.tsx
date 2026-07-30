"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "@/lib/utils";

interface Props {
  nome: string;
  historia: string;
  logo: string | null;
  altLogo: string;
}

export function HistoriaSection({ nome, historia, logo, altLogo }: Props) {
  const [expandido, setExpandido] = useState(false);

  if (!historia?.trim()) return null;

  const fotoUrl = mediaUrl(logo);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#0b1c30" }}>
        Sobre a empresa
      </h2>
      <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: "#becabc" }}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {fotoUrl && (
            <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-xl sm:mx-0">
              <Image
                src={fotoUrl}
                alt={altLogo || `Foto de ${nome}`}
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
          )}
          <div className="min-w-0">
            <p
              className={`text-base leading-relaxed transition-all ${!expandido ? "line-clamp-3" : ""}`}
              style={{ color: "#3f493f" }}
            >
              {historia}
            </p>
            <button
              onClick={() => setExpandido((v) => !v)}
              className="mt-3 text-sm font-semibold hover:underline"
              style={{ color: "#00602a" }}
            >
              {expandido ? "Ver menos" : "Ver mais"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
