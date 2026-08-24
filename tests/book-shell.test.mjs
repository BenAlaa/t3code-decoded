import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const bookLayout = await readFile(new URL("../src/layouts/BookLayout.astro", import.meta.url), "utf8");
const baseLayout = await readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");

test("book shell keeps chapter navigation in a reserved fixed dock", () => {
  assert.match(bookLayout, /<nav class="chapter-dock" aria-label="Chapter navigation">/);
  assert.match(bookLayout, /chapter-dock-context/);
  assert.match(styles, /--chapter-dock-reserve:/);
  assert.match(styles, /\.reading-grid[\s\S]*padding:[\s\S]*var\(--chapter-dock-reserve\)/);
  assert.match(styles, /\.chapter-dock \{[\s\S]*position: fixed;/);
  assert.match(styles, /\.chapter-dock[\s\S]*@media print|@media print[\s\S]*\.chapter-dock/);
});

test("desktop contents rail persists an accessible collapsed preference", () => {
  assert.match(baseLayout, /localStorage\.getItem\("t3decoded-sidebar"\)/);
  assert.match(bookLayout, /data-sidebar-toggle[^>]*aria-controls="book-sidebar"[^>]*aria-expanded="true"/);
  assert.match(bookLayout, /aria-label=\{tocLabel\(item\)\}/);
  assert.match(bookLayout, /data-sidebar-tooltip=\{tocLabel\(item\)\}/);
  assert.match(bookLayout, /role="tooltip"/);
  assert.match(styles, /:root\[data-sidebar="collapsed"\] \{ --sidebar: var\(--sidebar-collapsed\); \}/);
  assert.match(styles, /@media \(min-width: 901px\)[\s\S]*toc-title \{ display: none;/);
});

test("chapter tables scroll inside the reading measure on narrow screens", () => {
  assert.match(styles, /\.chapter-body > table \{[\s\S]*display: block;[\s\S]*max-width: 100%;[\s\S]*overflow-x: auto;/);
  assert.match(styles, /@media print[\s\S]*\.chapter-body > table \{ display: table;/);
});
