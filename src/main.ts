// Boot, pixel-perfect scaling, the fixed-timestep loop, and the glue between
// the scene and the DOM overlays.

import { sfx, setSound } from "./audio";
import { Camera } from "./camera";
import { FLOOR_Y, INTERACT_RANGE, MAX_VIEW_W, MIN_VIEW_W, PAL, STEP, VIEW_H } from "./config";
import { Flask, OPEN_TIME, drawParticles, spawnDust, updateParticles } from "./flask";
import { clamp, px } from "./gfx";
import { clearInput, downHeld, initInput, isRollKey, jumpHeld, moveAxis } from "./input";
import { Lectern } from "./lectern";
import { makeVignette } from "./lighting";
import { contactItems } from "./links";
import { Player, type Intent } from "./player";
import { computeLayout, createScene } from "./scene";
import { buildPrompt, FLASK_H, LECTERN_H } from "./sprites";
import { createContactsUI } from "./ui/contacts";
import { createFlaskNav, createHud, createTouchControls } from "./ui/hud";
import { createPanel } from "./ui/panel";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { alpha: false })!;

const layout = computeLayout();
const scene = createScene(layout, reduced);
const flasks = layout.slots.map((s) => new Flask(s, reduced));
const lectern = new Lectern(layout.lecternX, reduced);
const player = new Player(layout.spawnX, layout.solids);
const camera = new Camera(layout.roomW);
const promptSprite = buildPrompt();
const LECTERN_INDEX = flasks.length;

type Mode = "intro" | "play" | "opening";
let mode: Mode = "play";
let time = 0;
let viewW = MAX_VIEW_W;
let cssPerPx = 1; // CSS pixels per internal pixel
let canvasLeft = 0;
let canvasTop = 0;
let vignette = makeVignette(viewW);
let near: Flask | Lectern | null = null;
let jumpQueued = false;
let rollQueued = false;
let focusIndex = -1; // flask (or lectern) focused with Tab, -1 for none
let autoWalk: { x: number; then: () => void } | null = null;
let opening: { index: number; t: number } | null = null;
let openedViaNav = false;
let hintPending = false;

// opening moment
let introT = 0;
let doorOpen = 1;
let fade = 0;

// ------------------------------------------------------------------ UI ------

const hud = createHud((on) => setSound(on));
const contactsUI = createContactsUI((i) => (lectern.selected = i));

const panel = createPanel({
  onStep(from, to) {
    flasks[from].setOpen(false);
    flasks[from].visited = true;
    flasks[to].setOpen(true);
    player.teleport(flasks[to].x);
    camera.snap(player.x, viewW);
  },
  onClose(index) {
    flasks[index].setOpen(false);
    flasks[index].visited = true;
    clearInput();
    jumpQueued = false;
    return openedViaNav ? navButtons[index] : null;
  },
});

const navButtons = createFlaskNav(layout.slots, {
  onFocus(i) {
    focusIndex = i;
    const what = i === LECTERN_INDEX ? "Lectern: contact links" : flasks[i].slot.entry.title;
    hud.showHint(`${what} · Enter to open`);
  },
  onBlur() {
    focusIndex = -1;
    hud.hideHint();
  },
  onActivate(i) {
    if (mode === "intro") finishIntro();
    if (mode !== "play") return;
    if (i === LECTERN_INDEX) {
      player.teleport(lectern.x);
      openLectern(true);
    } else {
      player.teleport(flasks[i].x);
      openFlask(i, true);
    }
  },
});

createTouchControls({
  onJump: () => (jumpQueued = true),
  onRoll: () => (rollQueued = true),
  onInteract: () => interact(),
});

// -------------------------------------------------------------- actions -----

function openFlask(index: number, viaNav = false) {
  autoWalk = null;
  openedViaNav = viaNav;
  if (lectern.open) closeLectern();
  player.reachT = OPEN_TIME;
  if (reduced) {
    sfx.cork();
    showPanel(index);
    return;
  }
  mode = "opening";
  flasks[index].startOpening();
  opening = { index, t: 0 };
}

function showPanel(index: number) {
  flasks[index].setOpen(true);
  mode = "play";
  clearInput();
  panel.open(index);
}

function openLectern(focus: boolean) {
  autoWalk = null;
  lectern.setOpen(true);
  contactsUI.show(focus);
  sfx.page();
}

function closeLectern() {
  lectern.setOpen(false);
  contactsUI.hide();
}

function interact() {
  if (mode === "intro") return finishIntro();
  if (mode !== "play" || panel.isOpen) return;
  if (lectern.open) return contactsUI.activate();
  if (near instanceof Flask) openFlask(near.slot.index);
  else if (near) openLectern(true);
}

function finishIntro() {
  mode = "play";
  doorOpen = 1;
  fade = 0;
  player.x = Math.max(player.x, layout.spawnX);
  try {
    sessionStorage.setItem("dungeon-intro", "1");
  } catch {
    // storage can be unavailable (private mode); the intro just plays again
  }
  hintPending = true;
  hud.showHint(
    coarse
      ? "◀ ▶ move · Jump twice to double jump · tap a flask to inspect"
      : "← → move · Space jump (twice to double jump) · Shift roll · E inspect",
    10000,
  );
}

function startIntro() {
  let seen = false;
  try {
    seen = sessionStorage.getItem("dungeon-intro") === "1";
  } catch {
    // ignore
  }
  if (seen) return;
  if (reduced) return finishIntro();
  mode = "intro";
  introT = 0;
  doorOpen = 0;
  fade = 1;
  player.x = layout.doorX;
}

// ---------------------------------------------------------------- input -----

initInput();

window.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (panel.isOpen) return panel.handleKey(e);
  if (e.code === "Tab") return; // native focus order walks the flask buttons
  if (mode === "intro") return finishIntro();
  if (mode !== "play") return;

  const target = e.target instanceof HTMLElement ? e.target : null;
  const control = target?.closest("a, button") as HTMLElement | null;
  switch (e.code) {
    case "Space":
    case "ArrowUp":
    case "KeyW":
      if (control && e.code === "Space") return; // let the focused button activate
      e.preventDefault();
      if (!e.repeat) jumpQueued = true;
      break;
    case "KeyE":
    case "Enter":
      if (e.repeat) return;
      if (control && e.code === "Enter") return; // native activation
      e.preventDefault();
      if (control?.closest("#flask-nav")) control.click();
      else interact();
      break;
    case "Escape":
      if (lectern.open) closeLectern();
      else if (focusIndex >= 0) navButtons[focusIndex].blur();
      break;
    case "ArrowLeft":
    case "ArrowRight":
      e.preventDefault();
      if (lectern.open) contactsUI.step(e.code === "ArrowLeft" ? -1 : 1);
      else if (focusIndex >= 0) navButtons[focusIndex].blur();
      break;
    case "ShiftLeft":
    case "ShiftRight":
    case "KeyK":
    case "KeyL":
      if (!e.repeat && isRollKey(e.code)) rollQueued = true;
      break;
    case "KeyA":
    case "KeyD":
      if (focusIndex >= 0) navButtons[focusIndex].blur();
      break;
  }
});

function toWorld(e: PointerEvent): [number, number] {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * viewW + camera.x, ((e.clientY - r.top) / r.height) * VIEW_H];
}

// tap or click a flask / the lectern: walk there, then open it
canvas.addEventListener("pointerdown", (e) => {
  if (mode === "intro") return finishIntro();
  if (mode !== "play") return;
  const [wx, wy] = toWorld(e);
  const f = flasks.find((fl) => fl.hit(wx, wy));
  if (f) autoWalk = { x: f.x, then: () => openFlask(f.slot.index) };
  else if (lectern.hit(wx, wy) && !lectern.open) autoWalk = { x: lectern.x, then: () => openLectern(false) };
});

canvas.addEventListener("pointermove", (e) => {
  const [wx, wy] = toWorld(e);
  canvas.style.cursor = flasks.some((f) => f.hit(wx, wy)) || lectern.hit(wx, wy) ? "pointer" : "default";
});

// -------------------------------------------------------------- scaling -----

// Integer scale in *device* pixels so pixels stay crisp on any display, with
// the rest letterboxed. Narrow (portrait) screens get a narrower view instead
// of smaller pixels.
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const devW = Math.floor(window.innerWidth * dpr);
  const devH = Math.floor(window.innerHeight * dpr);
  let scale = Math.max(1, Math.floor(Math.min(devW / MAX_VIEW_W, devH / VIEW_H)));
  let w = MAX_VIEW_W;
  const narrow = Math.max(1, Math.floor(Math.min(devW / MIN_VIEW_W, devH / VIEW_H)));
  if (narrow > scale) {
    scale = narrow;
    w = Math.min(MAX_VIEW_W, Math.floor(devW / scale));
  }
  w = Math.max(160, Math.min(w, Math.floor(devW / scale)));

  viewW = w;
  canvas.width = w;
  canvas.height = VIEW_H;
  ctx.imageSmoothingEnabled = false;
  cssPerPx = scale / dpr;
  canvasLeft = Math.max(0, Math.floor((devW - w * scale) / 2)) / dpr;
  canvasTop = Math.max(0, Math.floor((devH - VIEW_H * scale) / 2)) / dpr;
  canvas.style.width = `${w * cssPerPx}px`;
  canvas.style.height = `${VIEW_H * cssPerPx}px`;
  canvas.style.left = `${canvasLeft}px`;
  canvas.style.top = `${canvasTop}px`;
  vignette = makeVignette(w);
  camera.snap(player.x, viewW);
}
window.addEventListener("resize", resize);

// --------------------------------------------------------------- update -----

// A flask is in reach when the player stands roughly under it and it is not
// too far overhead: lower flasks from the floor, upper ones from the platforms.
const REACH_UP = 115;
const REACH_DOWN = 30;

function findNear(): Flask | Lectern | null {
  let best: Flask | Lectern | null = null;
  let bestScore = Infinity;
  const head = player.headY;
  for (const f of flasks) {
    const dx = Math.abs(player.x - (f.x + f.dx));
    const dy = head - (f.top + FLASK_H / 2);
    if (dx > 14 || dy > REACH_UP || dy < -REACH_DOWN) continue;
    const score = dx + Math.abs(dy) * 0.15;
    if (score < bestScore) {
      best = f;
      bestScore = score;
    }
  }
  if (Math.abs(player.x - lectern.x) <= INTERACT_RANGE - 4 && player.y > FLOOR_Y - 20) best = lectern;
  return best;
}

function step(dt: number) {
  time += dt;
  let intent: Intent = { move: 0, jump: false, jumpHeld: false, down: false, roll: false };

  if (mode === "intro") {
    introT += dt;
    fade = clamp(1 - introT / 1.1, 0, 1);
    doorOpen = clamp((introT - 0.6) / 0.7, 0, 1);
    if (introT > 1.3) {
      if (player.x >= layout.spawnX) finishIntro();
      else intent.move = 1;
    }
  } else if (mode === "play") {
    const axis = moveAxis(!lectern.open);
    if (axis !== 0 || jumpQueued || rollQueued) {
      autoWalk = null;
      if (hintPending) {
        hintPending = false;
        hud.hideHint();
      }
    }
    if (autoWalk) {
      const d = autoWalk.x - player.x;
      if (Math.abs(d) < 3) {
        const then = autoWalk.then;
        player.x = autoWalk.x;
        player.vx = 0;
        autoWalk = null;
        then();
      } else intent.move = d > 0 ? 1 : -1;
    } else intent = { move: axis, jump: jumpQueued, jumpHeld: jumpHeld(), down: downHeld(), roll: rollQueued };
  }
  jumpQueued = false;
  rollQueued = false;

  for (const ev of player.update(intent, dt, 16, layout.roomW - 16)) {
    if (ev === "step") sfx.step();
    if (reduced) continue;
    if (ev === "jump") spawnDust(player.x, player.y, 4);
    if (ev === "land") {
      spawnDust(player.x, player.y, 6);
      sfx.step();
    }
    if (ev === "roll") spawnDust(player.x, player.y, 5, player.facing);
  }

  near = mode === "intro" ? null : findNear();
  for (const f of flasks) {
    f.inRange = f === near || f.slot.index === focusIndex;
    if (f.update(dt, time)) sfx.cork();
  }
  lectern.inRange = near === lectern || focusIndex === LECTERN_INDEX;
  lectern.update(dt);
  if (lectern.open && (Math.abs(player.x - lectern.x) > INTERACT_RANGE + 10 || player.y < FLOOR_Y - 40)) closeLectern();

  if (opening && (opening.t += dt) >= OPEN_TIME) {
    const { index } = opening;
    opening = null;
    showPanel(index);
  }

  updateParticles(dt);
  scene.update(dt, camera.x, viewW);
  const focusX = focusIndex < 0 ? null : focusIndex === LECTERN_INDEX ? lectern.x : flasks[focusIndex].x;
  camera.update(dt, player.x, viewW, focusX, reduced);
}

// --------------------------------------------------------------- render -----

function corners(x: number, y: number, w: number, h: number) {
  for (const [cx, cy] of [[x, y], [x + w - 3, y], [x, y + h - 3], [x + w - 3, y + h - 3]]) {
    px(ctx, cx, cy, 3, 3, PAL.ui);
  }
}

function render() {
  const g = ctx;
  const camX = camera.x;
  px(g, 0, 0, viewW, VIEW_H, PAL.fog0);
  scene.drawBack(g, camX, time);
  scene.drawPlayfield(g, camX, viewW, doorOpen);

  // light: additive glows on top of the dark scene
  g.globalCompositeOperation = "lighter";
  scene.drawTorchGlows(g, camX, viewW, time);
  const visible = flasks.filter((f) => f.onScreen(camX, viewW));
  for (const f of visible) f.drawGlow(g, camX, time);
  lectern.drawGlow(g, camX, time);
  g.globalCompositeOperation = "source-over";

  scene.drawTorches(g, camX, viewW, time);
  scene.drawDrips(g, camX);
  for (const f of visible) f.draw(g, camX, time);
  scene.drawPlaques(g, camX);
  lectern.draw(g, camX, time);
  if (mode !== "intro" || introT > 1.3) player.draw(g, camX);
  drawParticles(g, camX);

  // [E] prompt over whatever is in range
  const bob = reduced ? 0 : Math.round(Math.sin(time * 5));
  if (mode === "play" && near && !panel.isOpen && !lectern.open) {
    if (near instanceof Flask) g.drawImage(promptSprite, near.x + near.dx - camX - 4, near.top - 15 + bob);
    else g.drawImage(promptSprite, near.x - camX - 4, FLOOR_Y - LECTERN_H - 14 + bob);
  }
  // keyboard focus ring
  if (focusIndex >= 0 && focusIndex < LECTERN_INDEX) {
    const f = flasks[focusIndex];
    corners(f.x + f.dx - camX - 17, f.top - 4, 34, FLASK_H + 8);
  } else if (focusIndex === LECTERN_INDEX) {
    corners(lectern.x - camX - 16, FLOOR_Y - LECTERN_H - 4, 32, LECTERN_H + 6);
  }

  scene.drawFore(g, camX);
  g.drawImage(vignette, 0, 0);
  if (fade > 0) {
    g.globalAlpha = fade;
    px(g, 0, 0, viewW, VIEW_H, "#000000");
    g.globalAlpha = 1;
  }

  // keep the DOM contact links aligned with the floating icons
  if (lectern.open) {
    const size = Math.max(32, 22 * cssPerPx);
    contactItems.forEach((_, i) => {
      const p = lectern.iconPos(i, time);
      contactsUI.place(i, canvasLeft + (p.x - camX) * cssPerPx, canvasTop + p.y * cssPerPx, size);
    });
    // destination label sits on the floor below the lectern, clear of the icons
    contactsUI.placeLabel(canvasLeft + (lectern.x - camX) * cssPerPx, canvasTop + (FLOOR_Y + 8) * cssPerPx);
  }
}

// ----------------------------------------------------------------- loop -----

let last = performance.now();
let acc = 0;
function frame(now: number) {
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;
  while (acc >= STEP) {
    if (!panel.isOpen) step(STEP); // the game pauses while a panel is open
    acc -= STEP;
  }
  render();
  requestAnimationFrame(frame);
}

resize();
startIntro();
camera.snap(player.x, viewW);
requestAnimationFrame(frame);
