import type { CollectionEntry } from "astro:content";

export type BookEntry = CollectionEntry<"book">;

export const sortBookEntries = (entries: BookEntry[]) =>
  [...entries].sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));

export const groupBookEntries = (entries: BookEntry[]) => {
  const groups = new Map<string, { order: number; entries: BookEntry[] }>();
  for (const entry of sortBookEntries(entries)) {
    const existing = groups.get(entry.data.part);
    if (existing) existing.entries.push(entry);
    else groups.set(entry.data.part, { order: entry.data.partOrder, entries: [entry] });
  }
  return [...groups.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([part, value]) => ({ part, ...value }));
};

export const entryHref = (entry: Pick<BookEntry, "data">, base = import.meta.env.BASE_URL) => {
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return entry.data.slug === "cover" ? prefix : `${prefix}${entry.data.slug}/`;
};

export const chapterLabel = (entry: BookEntry) => {
  if (entry.data.kind === "front") return "Start here";
  if (entry.data.kind === "appendix") return `Appendix ${entry.data.number ?? ""}`.trim();
  return `Chapter ${entry.data.number ?? ""}`.trim();
};

