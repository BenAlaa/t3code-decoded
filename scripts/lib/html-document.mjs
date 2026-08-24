export const collectHtmlIds = (html) => [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);

export const findDuplicateHtmlIds = (html) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const id of collectHtmlIds(html)) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates].sort();
};
