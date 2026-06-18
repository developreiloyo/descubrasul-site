import type { Negocio, Produto, Categoria } from "@/types";

const API = process.env.API_URL_INTERNAL || "http://backend:8000/api";
const REVALIDATE = process.env.NODE_ENV === "production" ? 300 : 0;

export async function getNegocio(slug: string): Promise<Negocio | null> {
  try {
    const res = await fetch(`${API}/negocios/${slug}/`, {
      next: { revalidate: REVALIDATE },
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
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function getCategorias(): Promise<Categoria[]> {
  try {
    const res = await fetch(`${API}/categorias/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function getNegociosDestaque(limit = 8): Promise<Negocio[]> {
  try {
    const res = await fetch(
      `${API}/negocios/?destaque=true&ordering=plan_order`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: Negocio[] = data.results ?? [];
    return results.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getProdutosDestaque(limit = 10): Promise<Produto[]> {
  try {
    const res = await fetch(`${API}/negocios/produtos/destaque/?limit=${limit}`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results ?? []);
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
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}
