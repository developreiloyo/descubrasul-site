import type { MetadataRoute } from "next";
import { getNegocios } from "@/lib/fetchers";

const BASE = "https://descubrasul.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const negocios = await getNegocios();

  // Derivar cidades e combinacoes categoria+cidade dos negocios ativos
  const cidades = new Set<string>();
  const categoriaCidade = new Set<string>();

  for (const n of negocios) {
    cidades.add(n.cidade);
    categoriaCidade.add(`${n.categoria.slug}/${n.cidade}`);
  }

  return [
    {
      url: BASE,
      priority: 1.0,
      changeFrequency: "daily",
    },
    ...[...cidades].map((c) => ({
      url: `${BASE}/cidades/${c}`,
      priority: 0.9,
      changeFrequency: "daily" as const,
    })),
    ...[...categoriaCidade].map((cc) => ({
      url: `${BASE}/${cc}`,
      priority: 0.85,
      changeFrequency: "daily" as const,
    })),
    ...negocios.map((n) => ({
      url: `${BASE}/negocios/${n.cidade}/${n.categoria.slug}/${n.slug}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
      lastModified: new Date(n.atualizado_em),
    })),
  ];
}