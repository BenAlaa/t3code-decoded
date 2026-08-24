import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(new URL("../src/components/Mermaid.astro", import.meta.url), "utf8");
const controller = await readFile(new URL("../src/lib/diagram-explorer.ts", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/components.css", import.meta.url), "utf8");

test("Mermaid diagrams expose one source-rendered explorer contract", () => {
  assert.match(component, /interface Props \{ id: string; chart: string; label: string; \}/);
  assert.match(component, /data-diagram-action="pan" aria-pressed="false"/);
  assert.match(component, /data-diagram-action="zoom-out"/);
  assert.match(component, /data-diagram-action="reset"/);
  assert.match(component, /data-diagram-action="zoom-in"/);
  assert.match(component, /data-diagram-action="expand"/);
  assert.match(component, /data-diagram-dialog/);
  assert.match(component, /window\.addEventListener\("beforeprint"/);
});

test("diagram input supports mouse, trackpad, keyboard, and cleanup without trapping page scroll", () => {
  assert.match(controller, /addEventListener\("wheel"/);
  assert.match(controller, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(controller, /if \(!panEnabled \|\| \(scale <= 1 && !expanded\)\) return/);
  assert.match(controller, /addEventListener\("pointerdown"/);
  assert.match(controller, /event\.key\.startsWith\("Arrow"\)/);
  assert.match(controller, /event\.key === "Escape"/);
  assert.match(controller, /resizeObserver\?\.disconnect\(\)/);
  assert.match(styles, /touch-action: pan-y pinch-zoom/);
  assert.match(styles, /\[data-pan-enabled="true"\][\s\S]*touch-action: none/);
});

test("expanded diagrams remain pannable when the whole diagram fits at 100%", () => {
  assert.match(controller, /const expandedTravelX = expanded && panEnabled \? viewportWidth \* 0\.45 : 0/);
  assert.match(controller, /const expandedTravelY = expanded && panEnabled \? viewportHeight \* 0\.45 : 0/);
  assert.match(controller, /Math\.max\(expandedTravelX, \(scaledWidth - viewportWidth\) \/ 2\)/);
  assert.match(controller, /scale <= 1 && !expanded/);
});

test("diagram controls disappear in print and motion can become instant", () => {
  assert.match(styles, /\.mermaid\[data-reduced-motion="true"\][\s\S]*transition: none/);
  assert.match(styles, /@media print[\s\S]*\.diagram-toolbar[\s\S]*display: none !important/);
  assert.match(styles, /@media print[\s\S]*\.mermaid[\s\S]*transform: none !important/);
});
