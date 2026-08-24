import excerptManifest from "../../sources/excerpts.manifest.json";
import lock from "../../sources/t3code.lock.json";
import referenceManifest from "../../sources/references.manifest.json";

export interface SourceReference {
  id: string;
  path: string;
  start?: number;
  end?: number;
  kind: "file" | "directory";
  label: string;
}

const references = [
  ...excerptManifest.map((entry) => ({ ...entry, kind: "file" as const })),
  ...referenceManifest,
] satisfies SourceReference[];

const catalog = new Map(references.map((reference) => [reference.id, reference]));

export const getSourceReference = (id: string) => {
  const reference = catalog.get(id);
  if (!reference) throw new Error(`Unknown source reference: ${id}`);
  return reference;
};

export const sourceReferenceLabel = (reference: SourceReference) => {
  const lines = reference.start
    ? `:${reference.start}${reference.end ? `–${reference.end}` : ""}`
    : "";
  return `${reference.path}${lines}`;
};

export const sourceReferenceHref = (reference: SourceReference) => {
  const route = reference.kind === "directory" ? "tree" : "blob";
  const lines = reference.kind === "file" && reference.start
    ? `#L${reference.start}${reference.end ? `-L${reference.end}` : ""}`
    : "";
  return `${lock.repository}/${route}/${lock.commit}/${reference.path}${lines}`;
};
