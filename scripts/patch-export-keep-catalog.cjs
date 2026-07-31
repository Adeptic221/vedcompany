const fs = require("fs");
const path = require("path");

const writeLibPath = path.join(__dirname, "write-lib-files.cjs");
let writeLib = fs.readFileSync(writeLibPath, "utf8");

if (writeLib.includes("KEEP existing catalog")) {
  console.log("write-lib-files.cjs already patched");
  process.exit(0);
}

const oldBlock = [
  '  "",',
  '  "const catalog = mergeCatalogs(autohomeDemoCars, staticCars);",',
  '  \'const outDir = path.join(process.cwd(), "data");\',',
  '  \'const outFile = path.join(outDir, "cars.catalog.json");\',',
  '  "",',
  '  \'fs.mkdirSync(outDir, { recursive: true });\',',
  '  \'fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2), "utf-8");\',',
  "  'console.log(`Exported ${catalog.length} cars -> ${outFile}`);',",
].join("\n");

const newBlock = [
  '  "",',
  '  \'const outDir = path.join(process.cwd(), "data");\',',
  '  \'const outFile = path.join(outDir, "cars.catalog.json");\',',
  '  "",',
  '  "if (fs.existsSync(outFile)) {",',
  '  "  try {",',
  '  \'    const existing = JSON.parse(fs.readFileSync(outFile, "utf8"));\',',
  '  "    if (Array.isArray(existing) && existing.length > 0) {",',
  '  "      // KEEP existing catalog (admin/GitHub/sync) - do not wipe on build.",',
  "  '      console.log(`Keeping existing catalog (${existing.length} cars) -> ${outFile}`);',",
  '  "      process.exit(0);",',
  '  "    }",',
  '  "  } catch {",',
  '  "    // fall through and regenerate",',
  '  "  }",',
  '  "}",',
  '  "",',
  '  "const catalog = mergeCatalogs(autohomeDemoCars, staticCars);",',
  '  \'fs.mkdirSync(outDir, { recursive: true });\',',
  '  \'fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2), "utf-8");\',',
  "  'console.log(`Exported ${catalog.length} cars -> ${outFile}`);',",
].join("\n");

if (!writeLib.includes(oldBlock)) {
  console.error("Could not find export block to patch");
  const i = writeLib.indexOf("const catalog = mergeCatalogs");
  console.error(JSON.stringify(writeLib.slice(Math.max(0, i - 40), i + 260)));
  process.exit(1);
}

writeLib = writeLib.replace(oldBlock, newBlock);
fs.writeFileSync(writeLibPath, writeLib, "utf8");
const check = fs.readFileSync(writeLibPath);
if (check.includes(0)) {
  throw new Error("UTF-16 detected after write");
}
console.log("patched write-lib-files.cjs");
