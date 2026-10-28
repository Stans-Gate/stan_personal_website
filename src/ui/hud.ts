// Everything in the DOM that sits over the canvas besides the panel: the name
// sign, legend, list-view link, sound toggle, hint line, screen-reader flask
// buttons and the on-screen touch controls.

import { categories, entries, owner, type CategoryId } from "../content";
import { touch } from "../input";
import type { FlaskSlot } from "../scene";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, textContent?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
}

export function createHud(onSound: (on: boolean) => boolean) {
  const hud = document.getElementById("hud")!;

  const left = el("div", "hud-left");
  const sign = el("div", "sign");
  sign.append(el("strong", undefined, owner.name), el("span", undefined, owner.title));
  const skip = el("a", "btn", "Skip to list view");
  skip.href = "/list.html";
  left.append(sign, skip);

  const right = el("div", "hud-right");
  const legend = el("ul", "legend");
  legend.setAttribute("aria-label", "Flask colors");
  for (const id of Object.keys(categories) as CategoryId[]) {
    if (!entries.some((e) => e.category === id)) continue;
    const li = el("li", undefined, categories[id].label);
    li.style.setProperty("--glow", categories[id].glow);
    legend.append(li);
  }
  const sound = el("button", "btn", "Sound: off");
  sound.type = "button";
  sound.setAttribute("aria-pressed", "false");
  sound.addEventListener("click", () => {
    const on = onSound(sound.getAttribute("aria-pressed") !== "true");
    sound.setAttribute("aria-pressed", String(on));
    sound.textContent = `Sound: ${on ? "on" : "off"}`;
  });
  right.append(legend, sound);
  hud.append(left, right);

  // mouse clicks should not leave focus on a HUD button (Space would re-trigger it)
  hud.addEventListener("pointerup", () => setTimeout(() => (document.activeElement as HTMLElement | null)?.blur(), 0));

  const hint = document.getElementById("hint")!;
  let hintTimer = 0;
  return {
    showHint(message: string, ms = 0) {
      window.clearTimeout(hintTimer);
      hint.textContent = message;
      hint.classList.add("show");
      if (ms) hintTimer = window.setTimeout(() => hint.classList.remove("show"), ms);
    },
    hideHint() {
      window.clearTimeout(hintTimer);
      hint.classList.remove("show");
    },
  };
}

// One visually hidden button per flask, plus the lectern, so Tab reaches every
// entry without walking the character. Index slots.length means the lectern.
export function createFlaskNav(
  slots: FlaskSlot[],
  handlers: { onFocus(i: number): void; onBlur(): void; onActivate(i: number, button: HTMLElement): void },
) {
  const nav = document.getElementById("flask-nav")!;
  const make = (i: number, label: string) => {
    const b = el("button", "sr-only", label);
    b.type = "button";
    b.addEventListener("focus", () => handlers.onFocus(i));
    b.addEventListener("blur", () => handlers.onBlur());
    b.addEventListener("click", () => handlers.onActivate(i, b));
    nav.append(b);
    return b;
  };
  const buttons = slots.map((s) => {
    const e = s.entry;
    const where = e.org ? `, ${e.org}` : "";
    return make(s.index, `${categories[e.category].label}: ${e.title}${where}. Open details.`);
  });
  buttons.push(make(slots.length, "Lectern: contact links. Open."));
  return buttons;
}

export function createTouchControls(handlers: { onJump(): void; onRoll(): void; onInteract(): void }) {
  const root = document.getElementById("touch")!;
  const hold = (label: string, aria: string, key: "left" | "right" | "jump", onPress?: () => void) => {
    const b = el("button", "pad", label);
    b.type = "button";
    b.tabIndex = -1;
    b.setAttribute("aria-label", aria);
    const set = (v: boolean) => (e: Event) => {
      e.preventDefault();
      if (v && !touch[key]) onPress?.();
      touch[key] = v;
    };
    b.addEventListener("pointerdown", set(true));
    for (const ev of ["pointerup", "pointercancel", "pointerleave"]) b.addEventListener(ev, set(false));
    return b;
  };
  const tap = (label: string, fn: () => void) => {
    const b = el("button", "pad pad-wide", label);
    b.type = "button";
    b.tabIndex = -1;
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      fn();
    });
    return b;
  };
  const l = el("div", "pad-group");
  l.append(hold("◀", "Move left", "left"), hold("▶", "Move right", "right"));
  const r = el("div", "pad-group");
  const jump = hold("Jump", "Jump (hold for higher)", "jump", handlers.onJump);
  jump.classList.add("pad-wide");
  r.append(tap("Roll", handlers.onRoll), jump, tap("Inspect", handlers.onInteract));
  root.append(l, r);
  root.addEventListener("contextmenu", (e) => e.preventDefault());
}
