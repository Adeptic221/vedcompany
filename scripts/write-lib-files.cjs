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
