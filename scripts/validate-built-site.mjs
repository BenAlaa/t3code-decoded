import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { collectHtmlIds, findDuplicateHtmlIds } from "./lib/html-document.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const rawBase = process.env.BASE_PATH || "/";
const base = `/${rawBase.replace(/^\/+|\/+$/g, "")}${rawBase === "/" ? "" : "/"}`;
const siteUrl = process.env.SITE_URL?.replace(/\/+$/, "");
const htmlFiles = (await readdir(dist, { recursive: true }))
  .filter((file) => file.endsWith(".html"))
  .sort();
const failures = [];

const targetFor = (url) => {
  const clean = url.split(/[?#]/, 1)[0];
  if (!clean.startsWith("/")) return undefined;
  if (!clean.startsWith(base)) {
    failures.push(`root-relative URL escapes BASE_PATH '${base}': ${url}`);
    return undefined;
  }
  const relative = clean.slice(base.length);
  if (!relative) return "index.html";
  return relative.endsWith("/") ? `${relative}index.html` : relative;
};

for (const file of htmlFiles) {
  const raw = await readFile(path.join(dist, file), "utf8");
  const ids = new Set(collectHtmlIds(raw));
  for (const id of findDuplicateHtmlIds(raw)) failures.push(`${file} repeats id '${id}'`);
  for (const match of raw.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(url)) continue;
    if (url.startsWith("#")) {
      if (url.length > 1 && !ids.has(decodeURIComponent(url.slice(1)))) failures.push(`${file} has missing local anchor ${url}`);
      continue;
    }
    const target = targetFor(url);
    if (!target) continue;
    await access(path.join(dist, target)).catch(() => failures.push(`${file} links to missing ${url}`));
  }
  if (siteUrl && file !== "404.html") {
    const canonical = raw.match(/<link rel=["']canonical["'] href=["']([^"']+)/)?.[1];
    if (!canonical?.startsWith(`${siteUrl}${base}`)) failures.push(`${file} has invalid or missing canonical URL`);
    const social = raw.match(/<meta property=["']og:image["'] content=["']([^"']+)/)?.[1];
    if (!social?.startsWith(`${siteUrl}${base}`)) failures.push(`${file} has invalid or missing social image URL`);
  }
}

await access(path.join(dist, "pagefind/pagefind.js")).catch(() => failures.push("Pagefind runtime is missing"));
if (!htmlFiles.includes("404.html")) failures.push("404.html is missing");

if (failures.length) throw new Error(`Built-site validation failed:\n- ${[...new Set(failures)].join("\n- ")}`);
process.stdout.write(`Validated ${htmlFiles.length} built pages at base '${base}'.\n`);
