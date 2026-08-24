export const LAB_MOTION = {
  detail: 220,
  playbackLead: 760,
  playbackStep: 1050,
} as const;

export const animateLabPanel = (
  target: HTMLElement | null,
  direction: number,
  reduced: boolean,
) => {
  if (!target || reduced) return undefined;
  return target.animate(
    [
      { opacity: 0.35, transform: `translateX(${direction * 12}px)` },
      { opacity: 1, transform: "translateX(0)" },
    ],
    { duration: LAB_MOTION.detail, easing: "cubic-bezier(.2,.8,.2,1)" },
  );
};

export const setPlaybackState = (button: HTMLButtonElement | null, playing: boolean, label: string) => {
  if (!button) return;
  button.setAttribute("aria-pressed", String(playing));
  button.textContent = playing ? `Pause ${label}` : `Play ${label}`;
};

export const handleRovingKeys = (
  event: KeyboardEvent,
  nodes: HTMLButtonElement[],
  currentIndex: number,
  select: (index: number) => void,
) => {
  const requested = (() => {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        return Math.max(0, currentIndex - 1);
      case "ArrowRight":
      case "ArrowDown":
        return Math.min(nodes.length - 1, currentIndex + 1);
      case "Home":
        return 0;
      case "End":
        return nodes.length - 1;
      default:
        return undefined;
    }
  })();
  if (requested === undefined || requested === currentIndex) return;
  event.preventDefault();
  select(requested);
  nodes[requested]?.focus();
};
