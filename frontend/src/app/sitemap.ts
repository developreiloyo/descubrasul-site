import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // TODO: buscar negocios, cidades e categorias da API
  return [
    {
      url: "https://descubrasul.com",
      lastModified: new Date(),
      priority: 1.0,
      changeFrequency: "daily",
    },
  ];
}
