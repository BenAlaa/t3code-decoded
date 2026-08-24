import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = (name) => readFile(new URL(`../src/components/${name}.astro`, import.meta.url), "utf8");

const [commandBoundary, receiptWindow, projectionCursor, deliveryGap, recoveryMatrix] = await Promise.all([
  component("CommandBoundaryLab"),
  component("ReceiptWindowLab"),
  component("ProjectionCursorLab"),
  component("DeliveryGapLab"),
  component("RecoveryMatrixLab"),
]);

test("command-boundary lab keeps both command paths, a live result, and a printable complete ledger", () => {
  assert.match(commandBoundary, /data-command-boundary-lab/);
  assert.match(commandBoundary, /data-command-path/);
  assert.match(commandBoundary, /data-command-position type="range" min="0" max="5"/);
  assert.match(commandBoundary, /data-command-prev disabled/);
  assert.match(commandBoundary, /data-command-next/);
  assert.match(commandBoundary, /role="status" aria-live="polite" aria-atomic="true" data-command-status/);
  assert.match(commandBoundary, /<noscript>[\s\S]*static boundary ledger below for every state/);
  assert.match(commandBoundary, /<summary>Static boundary ledger<\/summary>/);
  assert.match(commandBoundary, /Turn on an existing thread/);
  assert.match(commandBoundary, /Full first-turn WebSocket bootstrap/);
  assert.match(commandBoundary, /Hard crash after commit/);
  assert.match(commandBoundary, /Final turn fails; compensate/);
  assert.match(commandBoundary, /pathSelect\?\.addEventListener\("change"/);
  assert.match(commandBoundary, /position\?\.addEventListener\("input"/);
  assert.match(commandBoundary, /@media print[\s\S]*\.static-fallback:not\(\[open\]\) > :not\(summary\) \{ display: block !important;/);
});

test("receipt-window lab makes receipt identity limits and post-commit windows inspectable without JavaScript", () => {
  assert.match(receiptWindow, /data-receipt-window-lab/);
  assert.match(receiptWindow, /data-receipt-state[\s\S]*value="accepted"[\s\S]*value="rejected"[\s\S]*value="none"/);
  assert.match(receiptWindow, /data-retry-target[\s\S]*same kind \+ id[\s\S]*different aggregate/);
  assert.match(receiptWindow, /data-retry-body[\s\S]*byte-for-byte intent[\s\S]*changed type or payload/);
  assert.match(receiptWindow, /data-delivery-window[\s\S]*hard crash after SQL commit[\s\S]*hard crash after a publication prefix/);
  assert.match(receiptWindow, /role="status" aria-live="polite" aria-atomic="true" data-receipt-status/);
  assert.match(receiptWindow, /not command type or a payload fingerprint/);
  assert.match(receiptWindow, /different target raises a command-id conflict/);
  assert.match(receiptWindow, /no missing-suffix replay/);
  assert.match(receiptWindow, /every proper prefix omits it/);
  assert.match(receiptWindow, /<noscript>[\s\S]*static matrices below for every receipt and crash-window outcome/);
  assert.match(receiptWindow, /<h4>Receipt decision matrix<\/h4>/);
  assert.match(receiptWindow, /<h4>Accepted-attempt delivery windows<\/h4>/);
  assert.match(receiptWindow, /\[receipt, target, body, windowSelect\]\.forEach\(\(control\) => control\?\.addEventListener\("change", paint\)\)/);
  assert.match(receiptWindow, /@media print[\s\S]*\.static-fallback:not\(\[open\]\) > :not\(summary\) \{ display: block !important;/);
});

test("projection-cursor lab exposes every cursor, the 1,001-event limit, and its static print reference", () => {
  assert.match(projectionCursor, /data-projection-lab/);
  for (const lane of ["projects", "messages", "plans", "activities", "sessions", "turns", "checkpoints", "approvals", "threads"]) {
    assert.match(projectionCursor, new RegExp(`id: "${lane}"`));
    assert.match(projectionCursor, new RegExp(`"${lane}"`));
  }
  assert.match(projectionCursor, /data-projection-lane=\{lane\.id\}/);
  assert.match(projectionCursor, /data-projection-cursor=\{lane\.id\}/);
  assert.match(projectionCursor, /data-projection-next/);
  assert.match(projectionCursor, /data-projection-lag aria-pressed="false" disabled/);
  assert.match(projectionCursor, /data-projection-cap aria-pressed="false"/);
  assert.match(projectionCursor, /role="status" aria-live="polite" aria-atomic="true" data-projection-status/);
  assert.match(projectionCursor, /Simulate 1,001-event projector lag/);
  assert.match(projectionCursor, /default\s+total limit of 1,000/);
  assert.match(projectionCursor, /1,000-event total read limit/);
  assert.match(projectionCursor, /no same-startup loop that asks for event 1,001/);
  assert.match(projectionCursor, /const requiredLaneIds = \["projects", "messages", "plans", "activities", "sessions", "checkpoints", "threads"\]/);
  assert.match(projectionCursor, /const requiredCursors = requiredLaneIds\.map\(cursorFor\)/);
  assert.match(projectionCursor, /lagButton\.disabled = capScenario \|\| applied === 0/);
  assert.match(projectionCursor, /if \(capScenario\) lagActivities = false/);
  assert.match(projectionCursor, /snapshot-required/);
  assert.match(projectionCursor, /auxiliary cursor/);
  assert.match(projectionCursor, /<noscript>[\s\S]*static reference table records the normal folded state/);
  assert.match(projectionCursor, /<div class="projection-static" aria-label="Static projector order fallback">/);
  assert.match(projectionCursor, /<th scope="col">Watermark role<\/th>/);
  assert.match(projectionCursor, /\.projection-static \{ display: block;/);
  assert.match(projectionCursor, /\.projection-lab\[data-projection-ready="true"\] \.projection-static \{ display: none; \}/);
  assert.match(projectionCursor, /lab\.dataset\.projectionReady = "initializing";[\s\S]*paint\(\);[\s\S]*lab\.dataset\.projectionReady = "true";/);
  assert.match(projectionCursor, /\.projection-lab \{[^}]*background: var\(--paper-raised\);[^}]*color: var\(--ink\);/);
  assert.doesNotMatch(projectionCursor, /var\(--(?:surface|border|accent),/);
  assert.match(projectionCursor, /next\?\.addEventListener\("click"/);
  assert.match(projectionCursor, /lagButton\?\.addEventListener\("click"/);
  assert.match(projectionCursor, /capButton\?\.addEventListener\("click"/);
  assert.match(projectionCursor, /@media print[\s\S]*\.projection-static \{ display: block !important;/);
});

test("delivery-gap lab preserves all post-commit positions, keyboard navigation, and the print fallback", () => {
  assert.match(deliveryGap, /data-delivery-gap-lab/);
  assert.match(deliveryGap, /data-delivery-range[\s\S]*type="range"[\s\S]*aria-valuetext=\{first\.label\}/);
  assert.match(deliveryGap, /data-delivery-phase=\{index\}/);
  assert.match(deliveryGap, /role="status" aria-live="polite" aria-atomic="true" data-delivery-status/);
  for (const label of ["Before commit", "Transaction open", "Commit returned", "Hot publish", "Turn-start observed", "Send forked", "Provider accepted", "Runtime publish", "Buffer released", "Result committed"]) {
    assert.match(deliveryGap, new RegExp(`label: "${label}"`));
  }
  assert.match(deliveryGap, /does not republish, so that retry leaves this delivery gap unrepaired/);
  assert.match(deliveryGap, /event\.key === "ArrowRight" \|\| event\.key === "ArrowDown"/);
  assert.match(deliveryGap, /event\.key === "ArrowLeft" \|\| event\.key === "ArrowUp"/);
  assert.match(deliveryGap, /event\.key === "Home"/);
  assert.match(deliveryGap, /event\.key === "End"/);
  assert.match(deliveryGap, /<details class="delivery-fallback" open>/);
  assert.match(deliveryGap, /<noscript>[\s\S]*complete ordered crash ledger remains open below/);
  assert.match(deliveryGap, /lab\.dataset\.deliveryReady = "initializing";[\s\S]*lab\.dataset\.deliveryReady = "true";/);
  assert.match(deliveryGap, /@media print[\s\S]*\.delivery-interactive, \.delivery-noscript \{ display: none; \}[\s\S]*\.delivery-fallback \{ display: block/);
});

test("recovery matrix retains all cross-store recovery stories through keyboard, no-JS, and print modes", () => {
  assert.match(recoveryMatrix, /data-recovery-matrix/);
  assert.match(recoveryMatrix, /data-recovery-row=\{index\}/);
  assert.match(recoveryMatrix, /data-recovery-select=\{index\} aria-pressed=\{index === 0 \? "true" : "false"\}/);
  assert.match(recoveryMatrix, /role="status" aria-live="polite" aria-atomic="true" data-recovery-status/);
  for (const [label, verdict] of [["Service update", "Journaled"], ["Settings update", "Saga gap"], ["Attachments", "Unreconciled"], ["Terminal history", "Best effort"], ["Checkpoint", "Unjournaled"]]) {
    assert.match(recoveryMatrix, new RegExp(`label: "${label}"[\\s\\S]*verdict: "${verdict}"`));
  }
  assert.match(recoveryMatrix, /event\.key === "ArrowDown" \|\| event\.key === "ArrowRight"/);
  assert.match(recoveryMatrix, /event\.key === "ArrowUp" \|\| event\.key === "ArrowLeft"/);
  assert.match(recoveryMatrix, /event\.key === "Home"/);
  assert.match(recoveryMatrix, /event\.key === "End"/);
  assert.match(recoveryMatrix, /<noscript>[\s\S]*complete matrix above remains available without JavaScript/);
  assert.match(recoveryMatrix, /<table>[\s\S]*<th scope="col">Boundary<\/th>[\s\S]*<th scope="col">Startup repair<\/th>/);
  assert.match(recoveryMatrix, /@media print[\s\S]*\.matrix-scroll \{ overflow: visible; \}[\s\S]*\.matrix-detail, \.noscript-note \{ display: none; \}/);
});
