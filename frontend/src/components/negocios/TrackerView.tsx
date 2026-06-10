"use client";

import { useEffect, useRef } from "react";
import { registrarClique } from "@/hooks/useTracking";

interface Props {
  negocioSlug: string;
}

export function TrackerView({ negocioSlug }: Props) {
  const enviado = useRef(false);

  useEffect(() => {
    // useRef evita duplo disparo no Strict Mode do React (dev)
    if (enviado.current) return;
    enviado.current = true;
    registrarClique(negocioSlug, "view");
  }, [negocioSlug]);

  return null;
}
