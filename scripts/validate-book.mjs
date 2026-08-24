import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "src/content/book");
const generated = JSON.parse(await readFile(path.join(root, "src/generated/excerpts.json"), "utf8"));
const excerptManifest = JSON.parse(await readFile(path.join(root, "sources/excerpts.manifest.json"), "utf8"));
const referenceManifest = JSON.parse(await readFile(path.join(root, "sources/references.manifest.json"), "utf8"));
const sourceIds = new Set([...excerptManifest, ...referenceManifest].map((item) => item.id));
const files = (await readdir(contentRoot, { recursive: true }))
  .filter((file) => /\.mdx?$/.test(file))
  .sort();
const slugs = new Map();
const orders = new Map();
let sourceUses = 0;
let referenceUses = 0;

for (const file of files) {
  const raw = await readFile(path.join(contentRoot, file), "utf8");
  const slug = raw.match(/^slug:\s*["']?([^\n"']+)/m)?.[1]?.trim();
  const orderRaw = raw.match(/^order:\s*(\d+)/m)?.[1];
  const status = raw.match(/^status:\s*([^\n]+)/m)?.[1]?.trim();
  const gatesRaw = raw.match(/^gates:\s*\[([^\]]*)\]/m)?.[1] ?? "";
  const gates = new Set(gatesRaw.split(",").map((gate) => gate.trim()).filter(Boolean));
  if (!slug || orderRaw === undefined) throw new Error(`${file} is missing slug or order frontmatter.`);
  const order = Number(orderRaw);
  if (slugs.has(slug)) throw new Error(`Duplicate slug '${slug}' in ${slugs.get(slug)} and ${file}`);
  if (orders.has(order)) throw new Error(`Duplicate order '${order}' in ${orders.get(order)} and ${file}`);
  slugs.set(slug, file);
  orders.set(order, file);
  if (status === "source-checked" && !gates.has("sources")) throw new Error(`${file} is source-checked without the sources gate.`);
  if (status === "verified" && ["sources", "links", "interaction", "editorial"].some((gate) => !gates.has(gate))) {
    throw new Error(`${file} is verified without every review gate.`);
  }
  for (const match of raw.matchAll(/<SourceExcerpt\s+[^>]*id=["']([^"']+)["']/g)) {
    sourceUses += 1;
    if (!generated[match[1]]) throw new Error(`${file} references unknown source excerpt '${match[1]}'.`);
  }
  for (const match of raw.matchAll(/sourceId:\s*["']([^"']+)["']/g)) {
    referenceUses += 1;
    if (!sourceIds.has(match[1])) throw new Error(`${file} references unknown source id '${match[1]}'.`);
  }
  for (const block of raw.matchAll(/sourceIds:\s*\[([\s\S]*?)\]/g)) {
    const idsInBlock = [...block[1].matchAll(/["']([^"']+)["']/g)].map((source) => source[1]);
    if (idsInBlock.length === 0) throw new Error(`${file} has an empty sourceIds list.`);
    for (const id of idsInBlock) {
      referenceUses += 1;
      if (!sourceIds.has(id)) throw new Error(`${file} references unknown source id '${id}'.`);
    }
  }
  for (const list of raw.matchAll(/<SourceList\s+ids=\{\[([\s\S]*?)\]\}\s*\/>/g)) {
    const idsInList = [...list[1].matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
    if (idsInList.length === 0) throw new Error(`${file} has an empty SourceList.`);
    for (const id of idsInList) {
      referenceUses += 1;
      if (!sourceIds.has(id)) throw new Error(`${file} references unknown source id '${id}'.`);
    }
  }
  for (const component of ["EvidenceClaim", "Figure"]) {
    const pattern = new RegExp(`<${component}\\s+[\\s\\S]*?(?:refs|sources)=\\{\\[([\\s\\S]*?)\\]\\}[\\s\\S]*?>`, "g");
    for (const match of raw.matchAll(pattern)) {
      const idsInComponent = [...match[1].matchAll(/["']([^"']+)["']/g)].map((source) => source[1]);
      if (idsInComponent.length === 0) throw new Error(`${file} has ${component} without source references.`);
      for (const id of idsInComponent) {
        referenceUses += 1;
        if (!sourceIds.has(id)) throw new Error(`${file} references unknown source id '${id}'.`);
      }
    }
  }
}

if (!slugs.has("cover")) throw new Error("Book content must include slug: cover.");
process.stdout.write(`Validated ${files.length} book entries, ${sourceUses} excerpts, and ${referenceUses} source references.\n`);
