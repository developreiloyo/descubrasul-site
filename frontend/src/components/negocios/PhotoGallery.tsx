"use client";

import { useState } from "react";
import Image from "next/image";
import { mediaUrl } from "@/lib/utils";

interface Props {
  mainPhoto: string | null;
  altText: string;
  icone?: string;
  nome: string;
}

export function PhotoGallery({ mainPhoto, altText, icone, nome }: Props) {
  const [imgError, setImgError] = useState(false);
  const foto = mediaUrl(mainPhoto);

  return (
    <div className="relative w-full overflow-hidden rounded-none sm:rounded-2xl bg-ink/10" style={{ aspectRatio: "16/9", maxHeight: "420px" }}>
      {foto && !imgError ? (
        <Image
          src={foto}
          alt={altText || `Foto de ${nome}`}
          fill
          className="object-cover"
          priority
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-8xl bg-gradient-to-br from-ink/5 to-ink/20">
          {icone || "🏪"}
        </div>
      )}
    </div>
  );
}
