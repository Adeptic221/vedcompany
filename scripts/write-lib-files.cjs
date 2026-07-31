const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function readSmart(file) {
  const buf = fs.readFileSync(file);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString("utf16le").replace(/^\uFEFF/, "");
  }
  if (buf.includes(0)) {
    return buf.toString("utf16le").replace(/^\uFEFF/, "");
  }
  return buf.toString("utf8");
}

function walkTsFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsFiles(full, acc);
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const files = walkTsFiles(path.join(root, "src"));
for (const file of files) {
  const buf = fs.readFileSync(file);
  if (!buf.includes(0)) continue;
  const text = readSmart(file);
  fs.writeFileSync(file, text, "utf8");
  console.log("fixed", path.relative(root, file));
}

for (const cjs of fs.readdirSync(path.join(root, "scripts"))) {
  if (!cjs.endsWith(".cjs")) continue;
  const file = path.join(root, "scripts", cjs);
  const buf = fs.readFileSync(file);
  if (!buf.includes(0)) continue;
  fs.writeFileSync(file, readSmart(file), "utf8");
  console.log("fixed", path.relative(root, file));
}

const syncCli = path.join(__dirname, "sync-cars-cli.ts");
const syncContent = [
  'import fs from "fs";',
  'import path from "path";',
  'import { runWeeklyCarSync } from "../src/lib/sync/run-sync.ts";',
  'import { getCarsCatalog, getCarsStorageInfo } from "../src/lib/storage/cars-store.ts";',
  "",
  "function loadEnvFile(relativePath: string) {",
  "  const fullPath = path.join(process.cwd(), relativePath);",
  "  if (!fs.existsSync(fullPath)) return;",
  '  for (const line of fs.readFileSync(fullPath, "utf8").split("\\n")) {',
  "    const trimmed = line.trim();",
  '    if (!trimmed || trimmed.startsWith("#")) continue;',
  '    const eq = trimmed.indexOf("=");',
  "    if (eq <= 0) continue;",
  "    const key = trimmed.slice(0, eq).trim();",
  "    let value = trimmed.slice(eq + 1).trim();",
  "    if (",
  '      (value.startsWith(\'"\') && value.endsWith(\'"\')) ||',
  "      (value.startsWith(\"'\") && value.endsWith(\"'\"))",
  "    ) {",
  "      value = value.slice(1, -1);",
  "    }",
  "    if (!process.env[key]) process.env[key] = value;",
  "  }",
  "}",
  "",
  'loadEnvFile(".env.local");',
  'loadEnvFile(".env");',
  "",
  "async function main() {",
  "  const result = await runWeeklyCarSync();",
  "  const cars = await getCarsCatalog();",
  "  const storage = getCarsStorageInfo();",
  "  console.log(JSON.stringify({ ...result, count: cars.length, storage }, null, 2));",
  "  process.exit(result.success ? 0 : 1);",
  "}",
  "",
  "main().catch((err) => {",
  "  console.error(err);",
  "  process.exit(1);",
  "});",
  "",
].join("\n");
fs.writeFileSync(syncCli, syncContent, "utf8");
console.log("sync-cars-cli.ts written");

const exportCli = path.join(__dirname, "export-catalog.ts");
const exportContent = [
  'import fs from "fs";',
  'import path from "path";',
  'import type { Car } from "../src/types/car";',
  'import { autohomeDemoCars } from "../src/data/cars.autohome-demo";',
  'import { cars as staticCars } from "../src/data/cars.static";',
  "",
  "function mergeCatalogs(...sources: Car[][]): Car[] {",
  "  const byId = new Map<string, Car>();",
  "  for (const source of sources) {",
  "    for (const car of source) {",
  "      byId.set(car.id, car);",
  "    }",
  "  }",
  "  return Array.from(byId.values());",
  "}",
  "",
  'const outDir = path.join(process.cwd(), "data");',
  'const outFile = path.join(outDir, "cars.catalog.json");',
  "",
  "if (fs.existsSync(outFile)) {",
  "  try {",
  '    const existing = JSON.parse(fs.readFileSync(outFile, "utf8"));',
  "    if (Array.isArray(existing) && existing.length > 0) {",
  "      // KEEP existing catalog (admin/GitHub/sync) - do not wipe on build.",
  '      console.log(`Keeping existing catalog (${existing.length} cars) -> ${outFile}`);',
  "      process.exit(0);",
  "    }",
  "  } catch {",
  "    // fall through and regenerate",
  "  }",
  "}",
  "",
  "const catalog = mergeCatalogs(autohomeDemoCars, staticCars);",
  'fs.mkdirSync(outDir, { recursive: true });',
  'fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2), "utf-8");',
  'console.log(`Exported ${catalog.length} cars -> ${outFile}`);',
  "",
].join("\n");
fs.writeFileSync(exportCli, exportContent, "utf8");
console.log("export-catalog.ts written");

const { execSync } = require("child_process");
try {
  execSync("npx --yes tsx scripts/export-catalog.ts", {
    cwd: root,
    stdio: "inherit",
    encoding: "utf8",
  });
} catch (err) {
  console.warn("[write-lib-files] catalog export skipped:", err.message);
}

const siteFile = path.join(root, "src/lib/seo/site.ts");
if (fs.existsSync(siteFile)) {
  let siteText = fs.readFileSync(siteFile, "utf8");
  if (siteText.includes('DEFAULT_OG_IMAGE = "/logo.png"')) {
    siteText = siteText.replace(
      'export const DEFAULT_OG_IMAGE = "/logo.png";',
      'export const DEFAULT_OG_IMAGE = "/logo.svg";'
    );
    fs.writeFileSync(siteFile, siteText, "utf8");
    console.log("patched site.ts DEFAULT_OG_IMAGE -> logo.svg");
  }
}
