import type { Negocio, Produto } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api";

export async function getNegocio(slug: string): Promise<Negocio | null> {
  try {
    const res = await fetch(`${API}/negocios/${slug}/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getProdutosDoNegocio(slug: string): Promise<Produto[]> {
  try {
    const res = await fetch(`${API}/negocios/${slug}/produtos/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}
