const MIN_SCALE = 0.55;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;
const KEYBOARD_PAN_STEP = 48;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function initDiagramExplorer(root: HTMLElement) {
  if (root.dataset.diagramReady === "true") return;
  root.dataset.diagramReady = "true";

  const viewport = root.querySelector<HTMLElement>("[data-diagram-viewport]");
  const content = root.querySelector<HTMLElement>("[data-diagram-content]");
  const status = root.querySelector<HTMLOutputElement>("[data-diagram-status]");
  const panButton = root.querySelector<HTMLButtonElement>("[data-diagram-action='pan']");
  const zoomOutButton = root.querySelector<HTMLButtonElement>("[data-diagram-action='zoom-out']");
  const zoomInButton = root.querySelector<HTMLButtonElement>("[data-diagram-action='zoom-in']");
  const expandButton = root.querySelector<HTMLButtonElement>("[data-diagram-action='expand']");
  const dialog = root.querySelector<HTMLDialogElement>("[data-diagram-dialog]");
  const dialogHost = root.querySelector<HTMLElement>("[data-diagram-dialog-host]");
  const origin = root.querySelector<HTMLElement>("[data-diagram-origin]");
  const closeButton = root.querySelector<HTMLButtonElement>("[data-diagram-close]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!viewport || !content || !origin) return;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let panEnabled = false;
  let activePointer: number | null = null;
  let pointerX = 0;
  let pointerY = 0;
  let resizeObserver: ResizeObserver | undefined;

  const constrainPan = () => {
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const scaledWidth = content.offsetWidth * scale;
    const scaledHeight = content.offsetHeight * scale;
    const expanded = root.dataset.diagramExpanded === "true";
    // A diagram often fits completely inside the larger dialog at 100%. Give
    // that canvas bounded travel so Pan still means something before zooming.
    const expandedTravelX = expanded && panEnabled ? viewportWidth * 0.45 : 0;
    const expandedTravelY = expanded && panEnabled ? viewportHeight * 0.45 : 0;
    const maxX = Math.max(expandedTravelX, (scaledWidth - viewportWidth) / 2);
    const maxY = Math.max(expandedTravelY, (scaledHeight - viewportHeight) / 2);
    translateX = clamp(translateX, -maxX, maxX);
    translateY = clamp(translateY, -maxY, maxY);
  };

  const paint = (announce = false) => {
    constrainPan();
    content.style.setProperty("--diagram-x", `${translateX}px`);
    content.style.setProperty("--diagram-y", `${translateY}px`);
    content.style.setProperty("--diagram-scale", String(scale));
    viewport.dataset.panEnabled = String(panEnabled);
    panButton?.setAttribute("aria-pressed", String(panEnabled));
    panButton?.setAttribute("aria-label", panEnabled ? "Stop panning diagram" : "Pan diagram");
    zoomOutButton?.toggleAttribute("disabled", scale <= MIN_SCALE + 0.001);
    zoomInButton?.toggleAttribute("disabled", scale >= MAX_SCALE - 0.001);
    if (status) {
      const value = `${Math.round(scale * 100)}% · pan ${panEnabled ? "on" : "off"}`;
      status.value = value;
      status.textContent = value;
      if (!announce) status.setAttribute("aria-live", "off");
      else status.setAttribute("aria-live", "polite");
    }
  };

  const setPanEnabled = (enabled: boolean, announce = true) => {
    panEnabled = enabled;
    paint(announce);
  };

  const zoomTo = (
    requestedScale: number,
    anchor?: { readonly clientX: number; readonly clientY: number },
  ) => {
    const nextScale = clamp(requestedScale, MIN_SCALE, MAX_SCALE);
    if (nextScale === scale) return;
    if (anchor) {
      const bounds = viewport.getBoundingClientRect();
      const pointX = anchor.clientX - bounds.left - bounds.width / 2;
      const pointY = anchor.clientY - bounds.top - bounds.height / 2;
      const ratio = nextScale / scale;
      translateX = pointX - ratio * (pointX - translateX);
      translateY = pointY - ratio * (pointY - translateY);
    }
    scale = Number(nextScale.toFixed(2));
    if (scale > 1) panEnabled = true;
    paint(true);
  };

  const reset = () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    panEnabled = false;
    paint(true);
  };

  const panBy = (x: number, y: number) => {
    translateX += x;
    translateY += y;
    paint(false);
  };

  const restoreFromDialog = () => {
    if (!origin.contains(viewport.closest("[data-diagram-surface]"))) {
      const surface = root.querySelector<HTMLElement>("[data-diagram-surface]");
      if (surface) origin.append(surface);
    }
    root.dataset.diagramExpanded = "false";
    expandButton?.setAttribute("aria-expanded", "false");
    expandButton?.setAttribute("aria-label", "Expand diagram");
    requestAnimationFrame(() => paint(false));
  };

  const toggleExpanded = () => {
    if (!dialog || !dialogHost || typeof dialog.showModal !== "function") return;
    if (dialog.open) {
      dialog.close();
      return;
    }
    const surface = root.querySelector<HTMLElement>("[data-diagram-surface]");
    if (!surface) return;
    dialogHost.append(surface);
    root.dataset.diagramExpanded = "true";
    expandButton?.setAttribute("aria-expanded", "true");
    expandButton?.setAttribute("aria-label", "Exit expanded diagram");
    dialog.showModal();
    requestAnimationFrame(() => {
      paint(false);
      closeButton?.focus();
    });
  };

  root.querySelectorAll<HTMLButtonElement>("[data-diagram-action]").forEach((button) => {
    button.addEventListener("click", () => {
      switch (button.dataset.diagramAction) {
        case "pan":
          setPanEnabled(!panEnabled);
          break;
        case "zoom-out":
          zoomTo(scale - SCALE_STEP);
          break;
        case "reset":
          reset();
          break;
        case "zoom-in":
          zoomTo(scale + SCALE_STEP);
          break;
        case "expand":
          toggleExpanded();
          break;
      }
    });
  });

  viewport.addEventListener("wheel", (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      zoomTo(scale + direction, { clientX: event.clientX, clientY: event.clientY });
      return;
    }
    const expanded = root.dataset.diagramExpanded === "true";
    if (!panEnabled || (scale <= 1 && !expanded)) return;
    event.preventDefault();
    panBy(-event.deltaX, -event.deltaY);
  }, { passive: false });

  viewport.addEventListener("pointerdown", (event) => {
    if (!panEnabled || event.button !== 0) return;
    activePointer = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    viewport.setPointerCapture(event.pointerId);
    viewport.dataset.dragging = "true";
    event.preventDefault();
  });
  viewport.addEventListener("pointermove", (event) => {
    if (activePointer !== event.pointerId) return;
    const x = event.clientX - pointerX;
    const y = event.clientY - pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;
    panBy(x, y);
  });
  const endPointer = (event: PointerEvent) => {
    if (activePointer !== event.pointerId) return;
    activePointer = null;
    viewport.dataset.dragging = "false";
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomTo(scale + SCALE_STEP);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomTo(scale - SCALE_STEP);
    } else if (event.key === "0") {
      event.preventDefault();
      reset();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setPanEnabled(!panEnabled);
    } else if (event.key === "Escape") {
      if (dialog?.open) dialog.close();
      else setPanEnabled(false);
    } else if (panEnabled && event.key.startsWith("Arrow")) {
      event.preventDefault();
      const x = event.key === "ArrowLeft" ? KEYBOARD_PAN_STEP : event.key === "ArrowRight" ? -KEYBOARD_PAN_STEP : 0;
      const y = event.key === "ArrowUp" ? KEYBOARD_PAN_STEP : event.key === "ArrowDown" ? -KEYBOARD_PAN_STEP : 0;
      panBy(x, y);
    }
  });

  dialog?.addEventListener("close", () => {
    restoreFromDialog();
    expandButton?.focus();
  });
  closeButton?.addEventListener("click", () => dialog?.close());

  const updateMotionPreference = () => {
    content.dataset.reducedMotion = String(reduceMotion.matches);
  };
  reduceMotion.addEventListener("change", updateMotionPreference);
  updateMotionPreference();

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => paint(false));
    resizeObserver.observe(viewport);
  }

  window.addEventListener("pagehide", () => {
    resizeObserver?.disconnect();
    reduceMotion.removeEventListener("change", updateMotionPreference);
  }, { once: true });

  paint(false);
}
