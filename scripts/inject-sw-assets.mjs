import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const assetsDir = join(dist, "assets");
const swSrc = join("public", "sw.js");
const swOut = join(dist, "sw.js");

if (!existsSync(dist) || !existsSync(assetsDir)) {
  console.error("dist/assets no existe. Ejecuta npm run build primero.");
  process.exit(1);
}
if (!existsSync(swSrc)) {
  console.error("public/sw.js no existe.");
  process.exit(1);
}

const assets = readdirSync(assetsDir)
  .filter(f => f.endsWith(".js") || f.endsWith(".css") || f.endsWith(".map") || f.endsWith(".svg") || f.endsWith(".png") || f.endsWith(".webp"))
  .map(f => `/${dist}/assets/${f}`.replace("/dist/", "/")) // queda: /assets/xxx
  .sort();

const sw = readFileSync(swSrc, "utf8");

// Inyectamos lista en una constante ASSETS
const injected = sw.replace(
  /const CORE = \[[\s\S]*?\];/m,
  (m) => {
    const coreMatch = m.match(/const CORE = \[[\s\S]*?\];/m);
    if (!coreMatch) return m;
    return `const CORE = [\n  "/",\n  "/index.html",\n  "/manifest.webmanifest"\n];\n\nconst ASSETS = ${JSON.stringify(assets, null, 2)};\n`;
  }
);

// Modificamos install para cachear también ASSETS
const finalSw = injected.replace(
  /cache\.addAll\(CORE\)/g,
  "cache.addAll([...CORE, ...ASSETS])"
);

writeFileSync(swOut, finalSw, "utf8");
console.log("OK: dist/sw.js generado con assets cacheados:", assets.length);
