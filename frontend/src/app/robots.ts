import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/painel/", "/api/", "/admin/"],
    },
    sitemap: "https://descubrasul.com/sitemap.xml",
  };
}
