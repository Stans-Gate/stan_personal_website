// Keyboard and touch state. Held keys are polled each update; one-shot
// actions (jump, inspect) are handled by main.ts as events.

const down = new Set<string>();

export const touch = { left: false, right: false, jump: false };

export function initInput() {
  window.addEventListener("keydown", (e) => down.add(e.code));
  window.addEventListener("keyup", (e) => down.delete(e.code));
  window.addEventListener("blur", clearInput);
  document.addEventListener("visibilitychange", clearInput);
}

export function clearInput() {
  down.clear();
  touch.left = touch.right = touch.jump = false;
}

export const isDown = (code: string) => down.has(code);

// Arrow keys steer the lectern highlight instead of the player while the
// contact icons are floating; A / D always walk.
export function moveAxis(arrowsWalk: boolean): -1 | 0 | 1 {
  const left = isDown("KeyA") || touch.left || (arrowsWalk && isDown("ArrowLeft"));
  const right = isDown("KeyD") || touch.right || (arrowsWalk && isDown("ArrowRight"));
  return left === right ? 0 : left ? -1 : 1;
}

export const jumpHeld = () => isDown("Space") || isDown("ArrowUp") || isDown("KeyW") || touch.jump;

export const downHeld = () => isDown("ArrowDown") || isDown("KeyS");

export const isRollKey = (code: string) => code === "ShiftLeft" || code === "ShiftRight" || code === "KeyK" || code === "KeyL";
