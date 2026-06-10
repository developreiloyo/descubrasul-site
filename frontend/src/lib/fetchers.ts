import type { Negocio, Produto } from "@/types";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";

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

export async function getNegocios(params?: {
  cidade?: string;
  categoria?: string;
}): Promise<Negocio[]> {
  try {
    const query = new URLSearchParams();
    if (params?.cidade) query.set("cidade", params.cidade);
    if (params?.categoria) query.set("categoria", params.categoria);

    const res = await fetch(`${API}/negocios/?${query.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}
