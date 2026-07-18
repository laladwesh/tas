import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import {
  getServiceCatalog,
  getProducts,
  getArticles,
} from "@/server/services/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, products, articles] = await Promise.all([
    getServiceCatalog(),
    getProducts(),
    getArticles(),
  ]);

  const now = new Date();
  const url = (path: string) => `${siteConfig.url}${path}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/shop"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/calculator"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/gallery"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/articles"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...services.map((service) => ({
      url: url(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: url(`/shop/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...articles.map((article) => ({
      url: url(`/articles/${article.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
