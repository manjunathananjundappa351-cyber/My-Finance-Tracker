// Toast action callbacks (e.g. "Undo") can't live in Redux state since functions
// aren't serializable. This tiny registry holds the current one out-of-band.
let currentAction: (() => void) | null = null;

export function setToastAction(fn: (() => void) | null): void {
  currentAction = fn;
}

export function runToastAction(): void {
  currentAction?.();
  currentAction = null;
}
