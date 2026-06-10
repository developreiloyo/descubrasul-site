"use client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type TipoClique =
  | "view" | "whatsapp" | "produto" | "share"
  | "instagram" | "tiktok" | "facebook" | "youtube" | "maps";

function detectarOrigem(): string {
  if (typeof document === "undefined") return "direto";
  const ref = document.referrer.toLowerCase();
  if (ref.includes("google")) return "google";
  if (ref.includes("instagram")) return "instagram";
  if (ref.includes("facebook")) return "facebook";
  if (ref.includes("whatsapp") || ref.includes("wa.me")) return "whatsapp";
  if (ref === "") return "direto";
  return "outro";
}

export function registrarClique(
  negocioSlug: string,
  tipo: TipoClique,
  produtoSlug?: string
): void {
  // fire-and-forget — nunca bloquear a navegacao do visitante
  try {
    fetch(`${API}/analytics/clique/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        negocio_slug: negocioSlug,
        produto_slug: produtoSlug ?? "",
        tipo,
        origem: detectarOrigem(),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // tracking nunca deve quebrar a experiencia do visitante
  }
}
