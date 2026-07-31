import type { MetadataRoute } from "next";
import { getCarsCatalog } from "@/lib/storage/cars-store";
import { SITE_URL } from "@/lib/seo/site";
import { LEGAL_PAGES } from "@/lib/legal/pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getCarsCatalog();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/legal`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...LEGAL_PAGES.map((page) => ({
      url: `${SITE_URL}/legal/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  const carPages: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${SITE_URL}/catalog/${car.id}`,
    lastModified: car.sync?.syncedAt ? new Date(car.sync.syncedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...carPages];
}
