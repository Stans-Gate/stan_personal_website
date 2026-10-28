// Room layout (generated from content.ts), the four parallax layers, and the
// ambient life: torches, dust motes, drips and the occasional rat.

import { categories, entries, owner, type CategoryId, type Entry } from "./content";
import { BEAM_TOP, BEAM_Y, FLOOR_Y, MAX_VIEW_W, PAL, VIEW_H } from "./config";
import { clamp, makeCanvas, mulberry32, px, text, textW, type Ctx } from "./gfx";
import { drawGlow, drawPool, glowSprite } from "./lighting";
import { buildRat, drawFlame } from "./sprites";
import type { Solid } from "./player";

// ---------------------------------------------------------------- layout ----

export interface FlaskSlot {
  entry: Entry;
  index: number;
  x: number;
  chain: number;
}

export interface Layout {
  roomW: number;
  doorX: number;
  spawnX: number;
  lecternX: number;
  gateX: number;
  slots: FlaskSlot[];
  plaques: { x: number; label: string; glow: string }[];
  pillars: { x: number; torchY: number; bright: boolean }[];
  puddles: number[];
  solids: Solid[]; // parkour platforms (the floor is separate)
}

// The whole room is exactly one screen wide, so nothing scrolls on a normal
// display. Flasks are packed into stacked tiers between the cell door and the
// lectern: neighbours alternate tiers, so one hangs above and between the next.
const FLASKS_LEFT = 96;
const FLASKS_RIGHT = 310;
const MAX_STEP = 17;
const JITTER = [0, 9, 3, 12, 6, 1, 10, 4, 13, 7, 2, 11, 5, 8];

export function computeLayout(): Layout {
  const ordered = (Object.keys(categories) as CategoryId[]).flatMap((id) => entries.filter((e) => e.category === id));
  const n = ordered.length;
  const step = Math.min(MAX_STEP, (FLASKS_RIGHT - FLASKS_LEFT) / Math.max(1, n - 1));
  // two tiers normally; a third if the content list grows too long for two
  const tiers = step < 13 ? [10, 52, 94] : [14, 72];
  const spread = tiers.length === 3 ? 0.3 : 1;
  const slots: FlaskSlot[] = ordered.map((entry, index) => {
    const tier = index % tiers.length;
    const jitter = JITTER[index % JITTER.length] * spread * (tier === 0 ? 1 : 0.6);
    return { entry, index, x: Math.round(FLASKS_LEFT + index * step), chain: Math.round(tiers[tier] + jitter) };
  });
  const lecternX = 364;
  return {
    roomW: MAX_VIEW_W,
    doorX: 30,
    spawnX: 62,
    lecternX,
    gateX: 432,
    slots,
    plaques: [], // no room for group plaques in a one-screen hall; the HUD legend names the colors
    pillars: [
      { x: 72, torchY: 150, bright: false },
      { x: lecternX, torchY: 92, bright: true },
    ],
    puddles: [150, 290],
    // A climbable arc under the flasks: low wooden steps at the ends, stone
    // ledges, and a high wooden platform in the middle. Upper-tier flasks are
    // only in reach from up here.
    solids: [
      { x: 84, y: 194, w: 40, h: 4, oneWay: true },
      { x: 130, y: 168, w: 42, h: 10, oneWay: false },
      { x: 186, y: 150, w: 50, h: 4, oneWay: true },
      { x: 250, y: 168, w: 42, h: 10, oneWay: false },
      { x: 300, y: 194, w: 36, h: 4, oneWay: true },
    ],
  };
}

// ---------------------------------------------------------- layer builders ---

function arcade(g: Ctx, width: number, period: number, pw: number, top: number, rise: number, color: string) {
  g.fillStyle = color;
  for (let x = 0; x < width; x++) {
    const u = ((x % period) / period) * 2 - 1;
    const under = Math.round(top + rise * (1 - Math.sqrt(Math.max(0, 1 - u * u))));
    g.fillRect(x, 0, 1, under);
  }
  for (let cx = 0; cx < width + period; cx += period) {
    g.fillRect(cx - pw / 2, top, pw, FLOOR_Y - top);
    g.fillRect(cx - pw / 2 - 1, top + rise, pw + 2, 3);
  }
}

function buildFar(width: number): HTMLCanvasElement {
  const [c, g] = makeCanvas(width, VIEW_H);
  px(g, 0, 0, width, VIEW_H, PAL.fog0);
  px(g, 0, 130, width, 50, PAL.fog1);
  px(g, 0, 180, width, 90, PAL.fog2);
  for (let x = 0; x < width; x += 2) {
    px(g, x, 128, 1, 1, PAL.fog1);
    px(g, x + 1, 129, 1, 1, PAL.fog1);
    px(g, x, 178, 1, 1, PAL.fog2);
    px(g, x + 1, 179, 1, 1, PAL.fog2);
  }
  arcade(g, width, 46, 8, 74, 14, PAL.far0);
  arcade(g, width, 104, 16, 46, 30, PAL.far1);
  return c;
}

function buildMid(width: number, rnd: () => number): { canvas: HTMLCanvasElement; windows: number[] } {
  const [c, g] = makeCanvas(width, VIEW_H);
  px(g, 0, 0, width, FLOOR_Y, PAL.mortar);
  for (let row = 0; row * 8 < FLOOR_Y; row++) {
    const off = row % 2 ? 8 : 0;
    for (let bx = -off; bx < width; bx += 16) {
      const r = rnd();
      px(g, bx, row * 8, 15, 7, r < 0.12 ? PAL.brickL : r < 0.24 ? PAL.brickD : PAL.brick);
    }
  }
  // moss, thicker near the floor
  for (let n = 0; n < width / 9; n++) {
    const mx = Math.floor(rnd() * width);
    const my = Math.floor(FLOOR_Y - 4 - rnd() * rnd() * 150);
    for (let k = 0; k < 9; k++) {
      px(g, mx + Math.floor(rnd() * 10), my + Math.floor(rnd() * 5), 1 + Math.floor(rnd() * 2), 1, rnd() < 0.6 ? PAL.moss : PAL.mossL);
    }
  }

  // the wall is ruined: everything above a jagged, brick-stepped line is gone
  const brokenTop = (x: number) =>
    Math.round((84 + 16 * Math.sin(x * 0.029 + 1) + 9 * Math.sin(x * 0.081 + 2) + 5 * Math.sin(x * 0.19)) / 4) * 4;
  for (let x = 0; x < width; x++) {
    const t = brokenTop(x);
    g.clearRect(x, 0, 1, t);
    px(g, x, t, 1, 2, PAL.brickD);
    if (rnd() < 0.08) px(g, x, t - 2, 2 + Math.floor(rnd() * 3), 2, PAL.brick);
  }

  // tall open arches that show the vaults beyond, some with a hanging cage
  const hw = 34;
  const top = 92;
  let n = 0;
  for (let cx = 150; cx < width + hw; cx += 200, n++) {
    for (let x = -hw; x <= hw; x++) {
      const u = x / hw;
      const yTop = Math.round(top + hw * (1 - Math.sqrt(1 - u * u)));
      px(g, cx + x, yTop - 3, 1, 3, PAL.stoneD);
      g.clearRect(cx + x, yTop, 1, FLOOR_Y - yTop);
    }
    px(g, cx - hw - 3, top + hw, 3, FLOOR_Y - top - hw, PAL.stoneD);
    px(g, cx + hw + 1, top + hw, 3, FLOOR_Y - top - hw, PAL.stoneD);
    if (n % 2 === 0) {
      for (let y = BEAM_Y; y < 100; y += 2) px(g, cx, y, 1, 1, PAL.metalD);
      px(g, cx - 3, 98, 7, 2, PAL.metalD);
      px(g, cx - 7, 100, 15, 2, PAL.metalD);
      px(g, cx - 7, 122, 15, 2, PAL.metalD);
      for (let bx = -7; bx <= 7; bx += 2) px(g, cx + bx, 102, 1, 20, PAL.metalD);
    }
  }

  // cold light spilling in through the broken top of the wall
  const windows: number[] = [];
  for (let wx = 230; wx < width; wx += 200) {
    windows.push(wx);
    g.globalCompositeOperation = "lighter";
    g.fillStyle = PAL.shaft;
    const y0 = brokenTop(wx) + 2;
    for (let y = y0; y < FLOOR_Y; y++) {
      const t = (y - y0) / (FLOOR_Y - y0);
      const x0 = Math.round(wx - 9 + 54 * t);
      const w = Math.round(18 + 14 * t);
      const a = 0.08 * (1 - t * 0.75);
      for (let i = 0; i < w; i++) {
        g.globalAlpha = a * Math.min(1, (Math.min(i, w - 1 - i) + 1) / 5);
        g.fillRect(x0 + i, y, 1, 1);
      }
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  }
  return { canvas: c, windows };
}

function buildFore(width: number, rnd: () => number): HTMLCanvasElement {
  const [c, g] = makeCanvas(width, VIEW_H);
  const dark = "#04060a";
  for (let x = 120; x < width; x += 190 + Math.floor(rnd() * 160)) {
    const kind = rnd();
    if (kind < 0.45) {
      // hanging chain with a hook
      const len = 40 + Math.floor(rnd() * 60);
      for (let y = 0; y < len; y += 4) {
        px(g, x, y, 2, 3, dark);
        px(g, x + (y % 8 ? 1 : -1), y + 3, 2, 1, dark);
      }
      px(g, x - 2, len, 6, 2, dark);
      px(g, x + 2, len + 2, 2, 4, dark);
      px(g, x - 2, len + 5, 5, 2, dark);
    } else if (kind < 0.75) {
      // broken pillar stub
      const w = 22 + Math.floor(rnd() * 10);
      px(g, x, 246, w, 24, dark);
      px(g, x + 3, 240, Math.floor(w / 2), 6, dark);
      px(g, x + 6, 236, Math.floor(w / 4), 4, dark);
      px(g, x - 3, 262, w + 6, 8, dark);
    } else {
      // vines
      for (let v = 0; v < 4; v++) {
        const vx = x + v * 5;
        const len = 14 + Math.floor(rnd() * 34);
        for (let y = 0; y < len; y++) px(g, vx + (Math.floor(y / 5) % 2), y, 1, 1, dark);
        px(g, vx - 1, len - 2, 3, 2, dark);
      }
    }
  }
  return c;
}

function wallBlock(g: Ctx, x0: number, x1: number, rnd: () => number) {
  px(g, x0, BEAM_Y, x1 - x0, FLOOR_Y - BEAM_Y, PAL.stoneD);
  for (let row = 0; BEAM_Y + row * 12 < FLOOR_Y; row++) {
    const off = row % 2 ? 10 : 0;
    for (let bx = x0 - off; bx < x1; bx += 20) {
      const left = Math.max(bx, x0);
      const w = Math.min(bx + 19, x1) - left;
      if (w <= 0) continue;
      px(g, left, BEAM_Y + row * 12, w, 11, rnd() < 0.25 ? PAL.stoneL : PAL.stone);
      px(g, left, BEAM_Y + row * 12, w, 1, PAL.stoneL);
    }
  }
}

function buildPlayfield(layout: Layout, rnd: () => number): HTMLCanvasElement {
  const { roomW } = layout;
  const [c, g] = makeCanvas(roomW, VIEW_H);

  // ceiling and beam
  px(g, 0, BEAM_TOP, roomW, BEAM_Y - BEAM_TOP, PAL.wood);
  px(g, 0, BEAM_TOP, roomW, 1, PAL.woodL);
  px(g, 0, BEAM_Y - 2, roomW, 2, PAL.woodD);
  for (let x = 0; x < roomW; x += 7) px(g, x + Math.floor(rnd() * 5), BEAM_TOP + 3 + Math.floor(rnd() * 5), 3 + Math.floor(rnd() * 6), 1, PAL.woodD);
  for (let x = 40; x < roomW; x += 96) {
    px(g, x, BEAM_TOP, 4, BEAM_Y - BEAM_TOP, PAL.metalD);
    px(g, x, BEAM_TOP, 1, BEAM_Y - BEAM_TOP, PAL.metal);
  }
  for (const s of layout.slots) px(g, s.x - 1, BEAM_Y, 3, 2, PAL.metalL);

  // end walls
  const leftEnd = layout.doorX + 32;
  const rightStart = layout.gateX - 54;
  wallBlock(g, 0, leftEnd, rnd);
  wallBlock(g, rightStart, roomW, rnd);
  px(g, leftEnd, BEAM_Y, 3, FLOOR_Y - BEAM_Y, PAL.stoneD);
  px(g, rightStart - 3, BEAM_Y, 3, FLOOR_Y - BEAM_Y, PAL.stoneD);

  // cell doorway (the barred door itself is drawn live so it can swing open)
  const dx = layout.doorX;
  for (let x = -13; x <= 13; x++) {
    const yTop = Math.round(186 - Math.sqrt(Math.max(0, 169 - x * x)) * 0.6);
    px(g, dx + x, yTop - 3, 1, FLOOR_Y - yTop + 3, PAL.stoneH);
    if (Math.abs(x) <= 10) px(g, dx + x, Math.max(yTop, 180), 1, FLOOR_Y - Math.max(yTop, 180), PAL.void);
  }

  // sealed exit gate with the name sign above it
  const gx = layout.gateX;
  px(g, gx - 19, 172, 38, 50, PAL.stoneH);
  px(g, gx - 16, 175, 32, 47, PAL.void);
  for (let bx = -14; bx <= 14; bx += 4) px(g, gx + bx, 175, 2, 47, PAL.metalD);
  for (let by = 182; by < FLOOR_Y; by += 10) px(g, gx - 16, by, 32, 2, PAL.metalD);
  for (let bx = -14; bx <= 14; bx += 4) px(g, gx + bx, 175, 1, 47, PAL.metal);
  px(g, gx - 3, 196, 6, 7, PAL.metal);
  px(g, gx - 1, 198, 2, 3, PAL.void);

  const name = owner.name;
  const title = owner.title.replace("@", "AT");
  const sw = Math.max(textW(name, 2), textW(title)) + 12;
  const sx = Math.round(gx - sw / 2);
  px(g, sx, 136, sw, 28, PAL.woodD);
  px(g, sx + 1, 137, sw - 2, 26, PAL.wood);
  px(g, sx + 1, 137, sw - 2, 1, PAL.woodL);
  px(g, sx + 2, 139, 2, 2, PAL.metalL);
  px(g, sx + sw - 4, 139, 2, 2, PAL.metalL);
  text(g, name, Math.round(gx - textW(name, 2) / 2), 141, PAL.parchment, 2);
  text(g, title, Math.round(gx - textW(title) / 2), 155, "#b3a47f");

  // torch pillars
  for (const p of layout.pillars) {
    px(g, p.x - 7, BEAM_Y, 14, FLOOR_Y - BEAM_Y, PAL.stone);
    px(g, p.x - 7, BEAM_Y, 2, FLOOR_Y - BEAM_Y, PAL.stoneL);
    px(g, p.x + 4, BEAM_Y, 3, FLOOR_Y - BEAM_Y, PAL.stoneD);
    for (let y = BEAM_Y + 18; y < FLOOR_Y - 8; y += 22) px(g, p.x - 7, y, 14, 1, PAL.stoneD);
    px(g, p.x - 9, BEAM_Y, 18, 5, PAL.stoneL);
    px(g, p.x - 9, FLOOR_Y - 8, 18, 8, PAL.stoneL);
    px(g, p.x - 9, FLOOR_Y - 8, 18, 1, PAL.stoneH);
    // sconce
    px(g, p.x - 3, p.torchY, 6, 3, PAL.metal);
    px(g, p.x - 3, p.torchY, 6, 1, PAL.metalL);
    px(g, p.x - 1, p.torchY + 3, 2, 9, PAL.woodL);
    px(g, p.x - 2, p.torchY + 10, 4, 2, PAL.metalD);
  }

  // parkour platforms
  for (const s of layout.solids) {
    if (s.oneWay) {
      // wooden scaffold: plank on two posts
      for (const postX of [s.x + 3, s.x + s.w - 6]) {
        px(g, postX, s.y + s.h, 3, FLOOR_Y - s.y - s.h, PAL.woodD);
        px(g, postX, s.y + s.h, 1, FLOOR_Y - s.y - s.h, PAL.wood);
      }
      if (FLOOR_Y - s.y > 30) {
        // cross brace
        const h = FLOOR_Y - s.y - s.h;
        for (let i = 0; i < h; i += 1) px(g, Math.round(s.x + 5 + ((s.w - 11) * i) / h), s.y + s.h + i, 2, 1, PAL.woodD);
      }
      px(g, s.x, s.y, s.w, s.h, PAL.wood);
      px(g, s.x, s.y, s.w, 1, PAL.woodL);
      px(g, s.x, s.y + s.h - 1, s.w, 1, PAL.woodD);
      for (let x = s.x + 6; x < s.x + s.w - 2; x += 12) px(g, x, s.y + 1, 1, 1, PAL.metalL);
    } else {
      // floating stone ledge with a ragged underside and moss on top
      px(g, s.x, s.y, s.w, s.h, PAL.stoneL);
      for (let x = s.x; x < s.x + s.w; x += 10) px(g, x + (x % 20 ? 0 : 5), s.y + 1, 1, 4, PAL.stone);
      for (let x = s.x + 5; x < s.x + s.w; x += 10) px(g, x, s.y + 6, 1, s.h - 6, PAL.stone);
      px(g, s.x, s.y + 5, s.w, 1, PAL.stone);
      px(g, s.x, s.y, s.w, 2, PAL.stoneH);
      px(g, s.x, s.y, 1, s.h, PAL.stoneH);
      px(g, s.x + s.w - 1, s.y, 1, s.h, PAL.stone);
      px(g, s.x, s.y + s.h - 2, s.w, 2, PAL.stoneD);
      for (let x = s.x + 2; x < s.x + s.w - 2; x += 3) {
        const d = Math.floor(rnd() * 4);
        if (d) px(g, x, s.y + s.h, 2, d, PAL.stoneD);
        if (rnd() < 0.5) px(g, x, s.y - 1, 1 + Math.floor(rnd() * 3), 1, rnd() < 0.5 ? PAL.moss : PAL.mossL);
      }
    }
  }

  // floor
  px(g, 0, FLOOR_Y, roomW, VIEW_H - FLOOR_Y, PAL.stoneD);
  for (let row = 0; row < 3; row++) {
    const y = FLOOR_Y + row * 16;
    const base = [PAL.stone, "#232c38", "#1a212b"][row];
    const off = row % 2 ? 8 : 0;
    for (let bx = -off; bx < roomW; bx += 16) {
      px(g, bx, y, 15, 15, rnd() < 0.2 && row === 0 ? PAL.stoneL : base);
    }
  }
  px(g, 0, FLOOR_Y, roomW, 1, PAL.stoneH);
  for (let n = 0; n < roomW / 6; n++) {
    px(g, Math.floor(rnd() * roomW), FLOOR_Y + 2 + Math.floor(rnd() * 44), 1 + Math.floor(rnd() * 3), 1, rnd() < 0.3 ? PAL.moss : PAL.stoneD);
  }

  // puddles
  for (const p of layout.puddles) {
    px(g, p - 10, FLOOR_Y, 20, 2, PAL.water);
    px(g, p - 7, FLOOR_Y + 2, 14, 1, PAL.water);
    px(g, p - 6, FLOOR_Y, 5, 1, PAL.waterL);
    px(g, p + 3, FLOOR_Y + 1, 3, 1, PAL.waterL);
  }

  // drain grate, bones and straw
  const grate = layout.spawnX + 52;
  px(g, grate, FLOOR_Y + 3, 16, 6, PAL.void);
  for (let bx = 1; bx < 16; bx += 3) px(g, grate + bx, FLOOR_Y + 3, 1, 6, PAL.metalD);
  for (let x = 130; x < layout.lecternX - 40; x += 150 + Math.floor(rnd() * 120)) {
    if (rnd() < 0.5) {
      px(g, x, FLOOR_Y - 1, 6, 1, PAL.bone);
      px(g, x - 1, FLOOR_Y - 2, 1, 1, PAL.bone);
      px(g, x + 6, FLOOR_Y - 2, 1, 1, PAL.bone);
      px(g, x + 9, FLOOR_Y - 2, 3, 2, PAL.bone);
      px(g, x + 10, FLOOR_Y - 1, 1, 1, PAL.void);
    } else {
      for (let k = 0; k < 7; k++) px(g, x + Math.floor(rnd() * 14), FLOOR_Y - 1 - Math.floor(rnd() * 2), 2 + Math.floor(rnd() * 3), 1, PAL.straw);
    }
  }
  return c;
}

function buildPlaque(label: string, glow: string): HTMLCanvasElement {
  const w = textW(label) + 10;
  const [c, g] = makeCanvas(w, 20);
  for (let y = 0; y < 7; y += 2) {
    px(g, 3, y, 1, 1, PAL.metalL);
    px(g, w - 4, y, 1, 1, PAL.metalL);
  }
  px(g, 0, 7, w, 12, PAL.woodD);
  px(g, 1, 8, w - 2, 10, PAL.wood);
  px(g, 1, 8, w - 2, 1, PAL.woodL);
  text(g, label, 5, 10, PAL.parchment);
  px(g, 5, 16, w - 10, 1, glow);
  return c;
}

// ----------------------------------------------------------------- scene ----

export interface Scene {
  layout: Layout;
  update(dt: number, camX: number, viewW: number): void;
  drawBack(g: Ctx, camX: number, time: number): void;
  drawPlayfield(g: Ctx, camX: number, viewW: number, doorOpen: number): void;
  drawTorchGlows(g: Ctx, camX: number, viewW: number, time: number): void;
  drawTorches(g: Ctx, camX: number, viewW: number, time: number): void;
  drawPlaques(g: Ctx, camX: number): void;
  drawDrips(g: Ctx, camX: number): void;
  drawFore(g: Ctx, camX: number): void;
}

export function createScene(layout: Layout, reduced: boolean): Scene {
  // prefers-reduced-motion: every layer scrolls with the room (no parallax)
  const f = reduced ? { far: 1, mid: 1, fore: 1 } : { far: 0.2, mid: 0.5, fore: 1.3 };
  const layerW = (factor: number) => MAX_VIEW_W + Math.ceil(layout.roomW * factor);
  const rnd = mulberry32(7);

  const far = buildFar(layerW(f.far));
  // "Cavernous" background by Spring Spring (CC0), opengameart.org/content/cavernous-background
  const cavern = new Image();
  cavern.src = "/bg/cavernous.png";
  const mid = buildMid(layerW(f.mid), rnd);
  const fore = buildFore(layerW(f.fore), rnd);
  const playfield = buildPlayfield(layout, rnd);
  const plaques = layout.plaques.map((p) => ({ x: p.x, sprite: buildPlaque(p.label, p.glow) }));
  const rat = buildRat();
  const torchGlow = glowSprite(PAL.fire1, 64, 0.5);
  const torchGlowBig = glowSprite(PAL.fire2, 96, 0.55);

  // dust motes drifting in the window light shafts (mid-layer coordinates)
  const motes = mid.windows.flatMap((wx) =>
    Array.from({ length: 6 }, () => ({ wx, t: rnd(), speed: 0.02 + rnd() * 0.03, off: rnd() * 18, phase: rnd() * 6 })),
  );

  // water drips over each puddle
  const drips = layout.puddles.map((x, i) => ({ x, y: BEAM_Y, vy: 0, wait: 1 + i * 0.7, ripple: -1 }));

  // a rat that sometimes scurries along the back wall
  const critter = { active: false, x: 0, dir: 1, wait: 9 };

  return {
    layout,

    update(dt, camX, viewW) {
      if (reduced) return;
      for (const m of motes) {
        m.t += m.speed * dt;
        if (m.t > 1) m.t -= 1;
      }
      for (const d of drips) {
        if (d.ripple >= 0) {
          d.ripple += dt;
          if (d.ripple > 0.5) d.ripple = -1;
        }
        if (d.wait > 0) {
          d.wait -= dt;
          continue;
        }
        d.vy += 520 * dt;
        d.y += d.vy * dt;
        if (d.y >= FLOOR_Y) {
          d.y = BEAM_Y;
          d.vy = 0;
          d.wait = 2 + Math.random() * 4;
          d.ripple = 0;
        }
      }
      if (critter.active) {
        critter.x += critter.dir * 62 * dt;
        const left = camX * f.mid - 20;
        if (critter.x < left - 10 || critter.x > left + viewW + 40) {
          critter.active = false;
          critter.wait = 12 + Math.random() * 16;
        }
      } else if ((critter.wait -= dt) <= 0) {
        critter.active = true;
        critter.dir = Math.random() < 0.5 ? 1 : -1;
        critter.x = camX * f.mid + (critter.dir > 0 ? -12 : viewW + 12);
      }
    },

    drawBack(g, camX, time) {
      if (cavern.complete && cavern.naturalWidth) {
        const ox = -Math.round(camX * f.far) - 16;
        g.drawImage(cavern, ox, -10);
        if (ox + cavern.naturalWidth < g.canvas.width) g.drawImage(cavern, ox + cavern.naturalWidth, -10);
        g.globalAlpha = 0.3;
        px(g, 0, 0, g.canvas.width, VIEW_H, PAL.fog0);
        g.globalAlpha = 1;
      } else g.drawImage(far, -Math.round(camX * f.far), 0);
      const mx = Math.round(camX * f.mid);
      g.drawImage(mid.canvas, -mx, 0);
      if (!reduced) {
        g.fillStyle = "#cfe4f7";
        for (const m of motes) {
          const y = 84 + m.t * (FLOOR_Y - 90);
          const tt = (y - 80) / (FLOOR_Y - 80);
          const x = m.wx - 9 + 54 * tt + m.off * (0.5 + tt * 0.5) + Math.sin(time * 0.7 + m.phase) * 3;
          g.globalAlpha = 0.25 + 0.25 * Math.sin(time * 1.3 + m.phase);
          g.fillRect(Math.round(x) - mx, Math.round(y), 1, 1);
        }
        g.globalAlpha = 1;
        if (critter.active) {
          const sprite = rat[Math.floor(time * 12) % 2];
          const rx = Math.round(critter.x) - mx;
          if (critter.dir > 0) g.drawImage(sprite, rx, FLOOR_Y - 4);
          else {
            g.save();
            g.translate(rx + 9, FLOOR_Y - 4);
            g.scale(-1, 1);
            g.drawImage(sprite, 0, 0);
            g.restore();
          }
        }
      }
    },

    drawPlayfield(g, camX, viewW, doorOpen) {
      g.drawImage(playfield, camX, 0, viewW, VIEW_H, 0, 0, viewW, VIEW_H);
      // barred cell door, hinged on the left; narrows as it swings open
      const w = Math.round(20 * (1 - clamp(doorOpen, 0, 1) * 0.85));
      const x0 = layout.doorX - 10 - camX;
      if (x0 + 20 < 0) return;
      for (let bx = 0; bx < w; bx += w > 8 ? 4 : 2) {
        px(g, x0 + bx, 182, 1, FLOOR_Y - 182, PAL.metalL);
        px(g, x0 + bx + 1, 182, 1, FLOOR_Y - 182, PAL.metalD);
      }
      px(g, x0, 190, w, 2, PAL.metal);
      px(g, x0, 210, w, 2, PAL.metal);
    },

    drawTorchGlows(g, camX, viewW, time) {
      for (const p of layout.pillars) {
        const x = p.x - camX;
        if (x < -100 || x > viewW + 100) continue;
        const flick = 0.86 + 0.14 * Math.sin(time * 9 + p.x) * Math.sin(time * 5.3 + p.x * 0.5);
        drawGlow(g, p.bright ? torchGlowBig : torchGlow, x, p.torchY - 4, flick);
        drawPool(g, PAL.fire1, x, flick * (p.bright ? 1 : 0.6), p.bright ? 1.6 : 1.2);
      }
    },

    drawTorches(g, camX, viewW, time) {
      for (const p of layout.pillars) {
        const x = p.x - camX;
        if (x < -10 || x > viewW + 10) continue;
        drawFlame(g, x, p.torchY, Math.floor(time * 10 + p.x) % 6, p.bright);
      }
    },

    drawPlaques(g, camX) {
      for (const p of plaques) g.drawImage(p.sprite, Math.round(p.x - p.sprite.width / 2) - camX, BEAM_Y);
    },

    drawDrips(g, camX) {
      if (reduced) return;
      for (const d of drips) {
        const x = d.x - camX;
        if (d.wait <= 0) px(g, x, Math.round(d.y), 1, 2, PAL.waterL);
        if (d.ripple >= 0) {
          const r = Math.round(2 + d.ripple * 14);
          g.globalAlpha = 1 - d.ripple * 2;
          px(g, x - r, FLOOR_Y, 2, 1, PAL.shaft);
          px(g, x + r - 1, FLOOR_Y, 2, 1, PAL.shaft);
          px(g, x - 1, FLOOR_Y - 1 - Math.round(d.ripple * 4), 1, 1, PAL.shaft);
          g.globalAlpha = 1;
        }
      }
    },

    drawFore(g, camX) {
      g.drawImage(fore, -Math.round(camX * f.fore), 0);
    },
  };
}
