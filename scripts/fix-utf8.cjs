const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const targets = [
  "src/lib/delivery/calculate.ts",
  "src/app/cabinet/components/CartTab.tsx",
  "src/data/brands-models.ts",
  "src/components/HomeCarPicker.tsx",
  "src/lib/catalog/analogs.ts",
  "src/components/CarCardMini.tsx",
  "src/lib/storage/cars-store.ts",
];

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

for (const rel of targets) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log("skip missing", rel);
    continue;
  }
  const text = readSmart(file);
  fs.writeFileSync(file, text, "utf8");
  const check = fs.readFileSync(file);
  console.log(rel, "null:", check.includes(0), "bytes:", check.length);
}
