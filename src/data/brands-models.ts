export interface Brand {
  slug: string;
  name: string;
}

export interface BrandModel {
  name: string;
  slug: string;
}

const BRANDS: Brand[] = [
  { slug: "aito", name: "AITO" },
  { slug: "audi", name: "Audi" },
  { slug: "avatr", name: "Avatr" },
  { slug: "baic", name: "BAIC" },
  { slug: "bmw", name: "BMW" },
  { slug: "byd", name: "BYD" },
  { slug: "changan", name: "Changan" },
  { slug: "chery", name: "Chery" },
  { slug: "deepal", name: "Deepal" },
  { slug: "dongfeng", name: "Dongfeng" },
  { slug: "ford", name: "Ford" },
  { slug: "gac-aion", name: "GAC Aion" },
  { slug: "genesis", name: "Genesis" },
  { slug: "geely", name: "Geely" },
  { slug: "great-wall", name: "Great Wall" },
  { slug: "haval", name: "Haval" },
  { slug: "hongqi", name: "Hongqi" },
  { slug: "hyundai", name: "Hyundai" },
  { slug: "jaecoo", name: "Jaecoo" },
  { slug: "jetour", name: "Jetour" },
  { slug: "kia", name: "Kia" },
  { slug: "land-rover", name: "Land Rover" },
  { slug: "leapmotor", name: "Leapmotor" },
  { slug: "lexus", name: "Lexus" },
  { slug: "li-auto", name: "Li Auto" },
  { slug: "maxus", name: "Maxus" },
  { slug: "mazda", name: "Mazda" },
  { slug: "mercedes", name: "Mercedes-Benz" },
  { slug: "mg", name: "MG" },
  { slug: "neta", name: "Neta" },
  { slug: "nio", name: "NIO" },
  { slug: "nissan", name: "Nissan" },
  { slug: "omoda", name: "Omoda" },
  { slug: "porsche", name: "Porsche" },
  { slug: "roewe", name: "Roewe" },
  { slug: "subaru", name: "Subaru" },
  { slug: "tank", name: "Tank" },
  { slug: "tesla", name: "Tesla" },
  { slug: "toyota", name: "Toyota" },
  { slug: "volkswagen", name: "Volkswagen" },
  { slug: "volvo", name: "Volvo" },
  { slug: "voyah", name: "Voyah" },
  { slug: "wuling", name: "Wuling" },
  { slug: "xpeng", name: "XPeng" },
  { slug: "zeekr", name: "Zeekr" },
];

const MODELS: Record<string, BrandModel[]> = {
  toyota: [
    { name: "Camry", slug: "camry" },
    { name: "RAV4", slug: "rav4" },
  ],
  bmw: [
    { name: "3 Series", slug: "3-series" },
    { name: "X5", slug: "x5" },
  ],
  mercedes: [{ name: "E-Class", slug: "e-class" }],
  audi: [{ name: "Q5", slug: "q5" }],
  lexus: [{ name: "RX", slug: "rx" }],
  porsche: [{ name: "Macan", slug: "macan" }],
  byd: [
    { name: "Han EV", slug: "han-ev" },
    { name: "Seal", slug: "seal" },
  ],
  geely: [{ name: "Coolray", slug: "coolray" }],
  chery: [{ name: "Tiggo 8 Pro", slug: "tiggo-8-pro" }],
  haval: [{ name: "H6", slug: "h6" }],
  changan: [{ name: "UNI-V", slug: "uni-v" }],
  "li-auto": [{ name: "L7", slug: "l7" }],
  zeekr: [{ name: "001", slug: "001" }],
  hongqi: [{ name: "H9", slug: "h9" }],
  "gac-aion": [{ name: "Y Plus", slug: "y-plus" }],
  wuling: [{ name: "Bingo", slug: "bingo" }],
  tank: [{ name: "300", slug: "300" }],
};

export function getAllBrands(): Brand[] {
  return BRANDS.slice().sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function getModelsForBrand(brandSlug: string): BrandModel[] {
  return MODELS[brandSlug] ?? [];
}

export function searchBrands(query: string): Brand[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllBrands();
  return getAllBrands().filter(
    (brand) =>
      brand.name.toLowerCase().includes(q) || brand.slug.includes(q)
  );
}

export function getTotalModelCount(): number {
  return Object.values(MODELS).reduce((sum, models) => sum + models.length, 0);
}
