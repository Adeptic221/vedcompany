import type { MetadataRoute } from "next";
import { getCarsCatalog } from "@/lib/storage/cars-store";
import { SITE_URL } from "@/lib/seo/site";

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
  ];

  const carPages: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${SITE_URL}/catalog/${car.id}`,
    lastModified: car.sync?.syncedAt ? new Date(car.sync.syncedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...carPages];
}