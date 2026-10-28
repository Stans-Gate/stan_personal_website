// All sprites are original and generated in code at boot (no image downloads).
// Each builder draws into a small offscreen canvas that the game blits later.

import { PAL } from "./config";
import { drawMap, makeCanvas, mix, px, text, type Ctx } from "./gfx";
import type { IconName } from "./content";

// ---------------------------------------------------------------- player ----

export const PLAYER_W = 16;
export const PLAYER_H = 24;

interface Pose {
  a: [number, number]; // back leg: x, lift
  b: [number, number]; // front leg: x, lift
  bob?: number;
  lean?: number;
  cape?: number;
  arm?: number;
  squash?: number;
  ball?: number; // curled up for the roll / double-jump flip, rotation frame 0..3
}

const idleLegs = { a: [6, 0], b: [9, 0] } as const;
const walkA = [10, 9, 7, 5, 6, 7];
const walkB = [5, 6, 7, 10, 9, 7];
const runA = [11, 9, 7, 4, 5, 7];
const runB = [4, 5, 7, 11, 9, 7];

const POSES: Record<string, Pose[]> = {
  idle: [0, 0, 1, 1].map((bob) => ({ a: [6, 0], b: [9, 0], bob })),
  walk: walkA.map((ax, i) => ({
    a: [ax, [0, 0, 0, 0, 1, 1][i]],
    b: [walkB[i], [0, 1, 1, 0, 0, 0][i]],
    bob: [0, 1, 0, 0, 1, 0][i],
    cape: 1,
  })),
  run: runA.map((ax, i) => ({
    a: [ax, [0, 0, 0, 1, 2, 1][i]],
    b: [runB[i], [1, 2, 1, 0, 0, 0][i]],
    bob: [0, 1, 0, 0, 1, 0][i],
    lean: 1,
    cape: 2 + (i % 2),
  })),
  jump: [
    { a: [6, 0], b: [8, 1], bob: -1, cape: 0 },
    { a: [6, 1], b: [8, 1], bob: -1, cape: 1 },
  ],
  fall: [
    { a: [5, 1], b: [9, 0], cape: 2 },
    { a: [5, 1], b: [9, 0], cape: 3 },
  ],
  land: [
    { a: [5, 0], b: [10, 0], squash: 2 },
    { a: [6, 0], b: [9, 0], squash: 1 },
  ],
  reach: [1, 2, 3].map((arm) => ({ a: [idleLegs.a[0], 0], b: [idleLegs.b[0], 0], arm })),
  roll: [0, 1, 2, 3].map((ball) => ({ a: [6, 0], b: [9, 0], ball })),
  mantle: [
    { a: [6, 2], b: [9, 3], arm: 3, bob: 1 },
    { a: [6, 1], b: [9, 1], arm: 2, squash: 1 },
  ],
};

export type AnimName = keyof typeof POSES;

// A cloaked ball for the dodge roll; the hood, eye and scarf rotate around it.
function drawBall(g: Ctx, ox: number, frame: number) {
  const cx = ox + 7.5;
  const cy = 16.5;
  for (let y = 9; y < 24; y++) {
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - 7.5, y - cy);
      if (d > 7.2) continue;
      px(g, ox + x, y, 1, 1, d > 6.2 ? PAL.cloakD : PAL.cloak);
    }
  }
  const a = (frame * Math.PI) / 2;
  const at = (r: number, off: number): [number, number] => [
    Math.round(cx + Math.cos(a + off) * r),
    Math.round(cy + Math.sin(a + off) * r),
  ];
  const [hx, hy] = at(3.5, -Math.PI / 2);
  px(g, hx - 2, hy - 2, 4, 4, PAL.cloakL);
  px(g, hx - 1, hy - 1, 2, 2, "#0b0f16");
  px(g, hx, hy - 1, 1, 1, PAL.eye);
  for (let k = 0; k < 4; k++) {
    const [sx, sy] = at(6 + k * 0.6, Math.PI / 2 + k * 0.35);
    px(g, sx, sy, 1, 1, PAL.scarf);
  }
  const [bx, by] = at(5, Math.PI);
  px(g, bx - 1, by - 1, 2, 2, PAL.boot);
}

function drawPose(g: Ctx, ox: number, p: Pose) {
  if (p.ball !== undefined) return drawBall(g, ox, p.ball);
  const dy = (p.bob ?? 0) + (p.squash ?? 0);
  const ux = ox + (p.lean ?? 0);
  const cape = p.cape ?? 0;
  const arm = p.arm ?? 0;

  // legs
  for (const [lx, lift] of [p.a, p.b]) {
    px(g, ox + lx, 19, 2, 5 - lift, PAL.boot);
    px(g, ox + lx + 2, 23 - lift, 1, 1, PAL.boot);
  }

  // trailing cape
  for (let k = 1; k <= cape; k++) {
    const h = 4 - k;
    px(g, ux + 3 - k, 20 - h + dy, 1, h, PAL.cloakD);
  }

  // cloak body
  const rows: [number, number][] = [
    [5, 11], [5, 11], [4, 11], [4, 11], [4, 11], [4, 12], [4, 12], [4, 12], [3, 12], [3, 12],
  ];
  rows.forEach(([x0, x1], i) => {
    const y = 10 + i + dy;
    if (y > 23) return;
    for (let x = x0; x <= x1; x++) {
      if (i === 9 && x % 3 === 1) continue; // ragged hem
      let col = PAL.cloak;
      if (x === x0 || (x === 9 && i >= 2)) col = PAL.cloakD;
      else if (x === x1 && i < 8) col = PAL.cloakL;
      px(g, ux + x, y, 1, 1, col);
    }
  });

  // scarf and its tail
  px(g, ux + 5, 9 + dy, 7, 1, PAL.scarf);
  for (let k = 1; k <= Math.max(1, cape); k++) px(g, ux + 5 - k, 9 + dy + (k > 1 ? 1 : 0), 1, 1, PAL.scarf);

  // hood
  px(g, ux + 6, 2 + dy, 5, 1, PAL.cloakL);
  px(g, ux + 5, 3 + dy, 7, 1, PAL.cloak);
  px(g, ux + 4, 4 + dy, 8, 5, PAL.cloak);
  px(g, ux + 4, 4 + dy, 1, 5, PAL.cloakD);
  px(g, ux + 5, 3 + dy, 1, 1, PAL.cloakD);
  px(g, ux + 3, 5 + dy, 1, 2, PAL.cloakD);
  px(g, ux + 8, 5 + dy, 4, 4, "#0b0f16"); // face in shadow
  px(g, ux + 7, 5 + dy, 1, 4, PAL.cloakL);
  px(g, ux + 8, 4 + dy, 4, 1, PAL.cloakL);
  px(g, ux + 10, 6 + dy, 1, 1, PAL.eye);

  // raised arm when inspecting
  for (let k = 0; k < arm; k++) px(g, ux + 12 + (k > 0 ? 1 : 0), 12 - k * 2 + dy, 1, 2, PAL.cloakL);
  if (arm > 0) px(g, ux + 13, 12 - arm * 2 + 1 + dy, 1, 1, PAL.skin);
}

export interface PlayerSheet {
  canvas: HTMLCanvasElement;
  anims: Record<string, { start: number; count: number }>;
}

export function buildPlayerSheet(): PlayerSheet {
  const total = Object.values(POSES).reduce((n, list) => n + list.length, 0);
  const [canvas, g] = makeCanvas(total * PLAYER_W, PLAYER_H);
  const anims: PlayerSheet["anims"] = {};
  let i = 0;
  for (const [name, list] of Object.entries(POSES)) {
    anims[name] = { start: i, count: list.length };
    for (const pose of list) drawPose(g, i++ * PLAYER_W, pose);
  }
  return { canvas, anims };
}

// ----------------------------------------------------------------- flask ----

export const FLASK_W = 28;
export const FLASK_H = 38;

export type FlaskShape = "round" | "square" | "cone" | "jar";
export const FLASK_SHAPES: FlaskShape[] = ["round", "square", "cone", "jar"];

// Each shape is a body silhouette under a shared neck, collar and cork.
const BODIES: Record<FlaskShape, { inside(x: number, y: number): boolean; level: number; iconY: number }> = {
  // big, really round boiling flask
  round: { inside: (x, y) => Math.hypot(x - 13.5, y - 24) <= 13.4, level: 19, iconY: 20 },
  // boxy bottle with clipped shoulders
  square: {
    inside: (x, y) => x >= 3 && x <= 24 && y >= 13 && y <= 37 && Math.abs(x - 13.5) + (15 - y) * 1.2 <= 11.5,
    level: 19,
    iconY: 21,
  },
  // conical (Erlenmeyer) flask
  cone: {
    inside: (x, y) => y >= 11 && y <= 37 && Math.abs(x - 13.5) <= Math.min(13.4, 3 + (y - 11) * 0.48) && !(y === 37 && Math.abs(x - 13.5) > 12),
    level: 22,
    iconY: 23,
  },
  // squat, wide-bellied jar
  jar: { inside: (x, y) => ((x - 13.5) / 13.4) ** 2 + ((y - 27) / 10.4) ** 2 <= 1, level: 23, iconY: 21 },
};

export interface FlaskArt {
  back: HTMLCanvasElement; // dim glass interior, drawn behind the liquid
  front: HTMLCanvasElement; // glass outline, highlights, collar and cork
  frontOpen: HTMLCanvasElement; // same without the cork
  colTop: number[]; // per-column extent of the interior, for the liquid
  colBot: number[];
  level: number; // resting liquid surface (y)
  iconY: number;
}

export function buildFlask(shape: FlaskShape): FlaskArt {
  const body = BODIES[shape];
  const neckTop = shape === "square" ? 8 : 6;
  const inside = (x: number, y: number) =>
    x >= 0 && x < FLASK_W && y >= 0 && y < FLASK_H && ((y >= neckTop && y <= 16 && x >= 11 && x <= 16) || body.inside(x, y));
  const edge = (x: number, y: number) =>
    inside(x, y) && !(inside(x - 1, y) && inside(x + 1, y) && inside(x, y - 1) && inside(x, y + 1));

  const colTop = new Array<number>(FLASK_W).fill(FLASK_H);
  const colBot = new Array<number>(FLASK_W).fill(-1);
  const [back, bg] = makeCanvas(FLASK_W, FLASK_H);
  bg.globalAlpha = 0.82;
  for (let y = 0; y < FLASK_H; y++) {
    for (let x = 0; x < FLASK_W; x++) {
      if (!inside(x, y) || edge(x, y)) continue;
      px(bg, x, y, 1, 1, "#0c141f");
      if (y >= 12) {
        colTop[x] = Math.min(colTop[x], y);
        colBot[x] = Math.max(colBot[x], y);
      }
    }
  }

  // metal base cup: the bottom rows of the bottle sit in a riveted holder
  const maxBot = Math.max(...colBot);
  const cupTop = maxBot - 3;
  for (let x = 0; x < FLASK_W; x++) if (colBot[x] >= 0) colBot[x] = Math.min(colBot[x], cupTop - 1);

  const make = (corked: boolean) => {
    const [c, g] = makeCanvas(FLASK_W, FLASK_H);
    for (let y = 0; y < FLASK_H; y++) {
      for (let x = 0; x < FLASK_W; x++) {
        if (!edge(x, y)) continue;
        // lit from the upper left
        const lit = x + y * 0.8 < 28;
        px(g, x, y, 1, 1, lit ? "#c4d9ea" : "#566b80");
      }
    }
    // soft highlights on the glass: a long streak on the left, a glint lower right
    g.globalAlpha = 0.55;
    for (let y = 14; y < 30; y++) {
      const x = colTop.findIndex((t, i) => i > 1 && t <= y && colBot[i] >= y);
      if (x > 0 && y % 7 !== 6) px(g, x + 1, y, 1, 1, "#eaf6ff");
    }
    g.globalAlpha = 0.3;
    for (let y = 16; y < 26; y++) {
      const x = colTop.findIndex((t, i) => i > 1 && t <= y && colBot[i] >= y);
      if (x > 0) px(g, x + 2, y, 1, 1, "#eaf6ff");
    }
    g.globalAlpha = 0.5;
    px(g, 20, 30, 2, 1, "#d5e6f4");
    px(g, 21, 29, 1, 1, "#d5e6f4");
    g.globalAlpha = 1;
    // base cup
    for (let y = cupTop; y < FLASK_H; y++) {
      for (let x = 0; x < FLASK_W; x++) {
        if (!inside(x, y)) continue;
        px(g, x, y, 1, 1, y === cupTop ? PAL.metalL : edge(x, y) ? PAL.metalD : PAL.metal);
      }
    }
    for (let x = 6; x < FLASK_W - 4; x += 5) if (inside(x, cupTop + 2)) px(g, x, cupTop + 2, 1, 1, PAL.metalL);
    // metal collar the chain hooks onto
    px(g, 9, neckTop - 2, 10, 3, PAL.metal);
    px(g, 9, neckTop - 2, 10, 1, PAL.metalL);
    px(g, 9, neckTop, 10, 1, PAL.metalD);
    if (corked) {
      px(g, 11, neckTop - 6, 6, 4, "#8a6a4a");
      px(g, 11, neckTop - 6, 6, 1, "#a98862");
      px(g, 16, neckTop - 5, 1, 3, "#6b4f38");
    } else {
      px(g, 12, neckTop - 2, 4, 1, PAL.void);
    }
    return c;
  };
  return { back, front: make(true), frontOpen: make(false), colTop, colBot, level: body.level, iconY: body.iconY };
}

// 12x12 category icons that float inside the flasks. '#' = light, '+' = shade.
const ICONS: Record<IconName, string[]> = {
  briefcase: [
    "............",
    "....####....",
    "...#....#...",
    ".##########.",
    ".#++++++++#.",
    ".#++++++++#.",
    ".####++####.",
    ".#++#..#++#.",
    ".#++####++#.",
    ".#++++++++#.",
    ".##########.",
    "............",
  ],
  rune: [
    "............",
    "............",
    ".......#....",
    "..#....#.#..",
    ".#....#...#.",
    "#.....#....#",
    "#....#.....#",
    ".#...#....#.",
    "..#.#....#..",
    "....#.......",
    "............",
    "............",
  ],
  cube: [
    "............",
    ".....##.....",
    "...##++##...",
    ".##++++++##.",
    ".#.##++##.#.",
    ".#...##...#.",
    ".#....#...#.",
    ".#....#...#.",
    ".#....#...#.",
    ".##...#..##.",
    "...##.#.##..",
    ".....###....",
  ],
  trophy: [
    "............",
    ".##########.",
    ".#.#++++#.#.",
    ".#.#++++#.#.",
    "..#.####.#..",
    "...######...",
    "....####....",
    ".....##.....",
    ".....##.....",
    "....####....",
    "...######...",
    "............",
  ],
  scroll: [
    "............",
    "..########..",
    ".#++++++++#.",
    "..########..",
    "..#......#..",
    "..#.####.#..",
    "..#......#..",
    "..#.####.#..",
    "..#......#..",
    "..########..",
    ".#++++++++#.",
    "..########..",
  ],
};

export const ICON_SIZE = 14;

export function buildIcon(name: IconName, color: string): HTMLCanvasElement {
  const [c, g] = makeCanvas(ICON_SIZE, ICON_SIZE);
  // dark outline so the icon reads against the liquid
  const shadow = mix(color, "#000000", 0.78);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) drawMap(g, ICONS[name], dx, dy, { "#": shadow, "+": shadow });
  drawMap(g, ICONS[name], 1, 1, { "#": mix(color, "#ffffff", 0.85), "+": mix(color, "#ffffff", 0.4) });
  return c;
}

// --------------------------------------------------------- contact icons ----
// Simple generic glyphs (not official logos): envelope, "in" badge, branch, page.

export type ContactIcon = "email" | "linkedin" | "github" | "resume";

const CONTACT_ICONS: Record<ContactIcon, string[]> = {
  email: [
    "................",
    "................",
    "................",
    ".##############.",
    ".##..........##.",
    ".#.##......##.#.",
    ".#...##..##...#.",
    ".#.....##.....#.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".#............#.",
    ".##############.",
    "................",
    "................",
    "................",
  ],
  linkedin: [
    "................",
    ".##############.",
    ".#............#.",
    ".#.##.........#.",
    ".#.##.........#.",
    ".#............#.",
    ".#.##.##.###..#.",
    ".#.##.###..##.#.",
    ".#.##.##...##.#.",
    ".#.##.##...##.#.",
    ".#.##.##...##.#.",
    ".#.##.##...##.#.",
    ".#............#.",
    ".#............#.",
    ".##############.",
    "................",
  ],
  github: [
    "................",
    "...###..........",
    "...#.#....###...",
    "...###....#.#...",
    "....#.....###...",
    "....#......#....",
    "....#......#....",
    "....#.....#.....",
    "....#....#......",
    "....#.###.......",
    "....##..........",
    "....#...........",
    "...###..........",
    "...#.#..........",
    "...###..........",
    "................",
  ],
  resume: [
    "................",
    "...#########....",
    "...#.......##...",
    "...#.......#.#..",
    "...#.......####.",
    "...#..........#.",
    "...#.######...#.",
    "...#..........#.",
    "...#.########.#.",
    "...#..........#.",
    "...#.########.#.",
    "...#..........#.",
    "...#.#####....#.",
    "...#..........#.",
    "...############.",
    "................",
  ],
};

export function buildContactIcon(name: ContactIcon, color: string): HTMLCanvasElement {
  const [c, g] = makeCanvas(16, 16);
  drawMap(g, CONTACT_ICONS[name], 0, 0, { "#": color });
  return c;
}

// --------------------------------------------------------------- lectern ----

export const LECTERN_W = 24;
export const LECTERN_H = 32;

export function buildLectern(): HTMLCanvasElement {
  const [c, g] = makeCanvas(LECTERN_W, LECTERN_H);
  // foot and post
  px(g, 5, 29, 14, 3, PAL.woodD);
  px(g, 7, 27, 10, 2, PAL.wood);
  px(g, 10, 13, 4, 14, PAL.wood);
  px(g, 10, 13, 1, 14, PAL.woodL);
  px(g, 13, 13, 1, 14, PAL.woodD);
  // slanted desk
  px(g, 3, 10, 18, 1, PAL.woodL);
  px(g, 2, 11, 20, 2, PAL.wood);
  px(g, 2, 13, 20, 1, PAL.woodD);
  // open book
  px(g, 3, 9, 18, 1, "#24404a");
  px(g, 4, 5, 8, 4, PAL.parchment);
  px(g, 12, 5, 8, 4, PAL.parchment);
  px(g, 5, 4, 6, 1, PAL.parchment);
  px(g, 13, 4, 6, 1, PAL.parchment);
  px(g, 11, 4, 2, 6, PAL.woodD);
  px(g, 5, 6, 5, 1, PAL.parchmentD);
  px(g, 5, 8, 4, 1, PAL.parchmentD);
  px(g, 14, 6, 5, 1, PAL.parchmentD);
  px(g, 14, 8, 4, 1, PAL.parchmentD);
  return c;
}

// ---------------------------------------------------------- small pieces ----

const FLAME_HEIGHTS = [
  [3, 5, 7, 6, 4],
  [4, 6, 6, 7, 3],
  [3, 6, 8, 5, 4],
  [4, 5, 7, 7, 3],
  [3, 7, 6, 6, 4],
  [4, 6, 8, 6, 3],
];

// 6-frame flame; (x, y) is the center of its base.
export function drawFlame(g: Ctx, x: number, y: number, frame: number, big = false) {
  const heights = FLAME_HEIGHTS[frame % FLAME_HEIGHTS.length];
  for (let i = 0; i < 5; i++) {
    const h = heights[i] + (big ? 2 : 0);
    const edge = Math.abs(i - 2);
    for (let k = 0; k < h; k++) {
      let col: string = PAL.fire1;
      if (k >= h - 1) col = PAL.fire0;
      else if (edge === 0 && k < h - 3) col = PAL.fire3;
      else if (edge <= 1 && k < h - 2) col = PAL.fire2;
      px(g, x - 2 + i, y - 1 - k, 1, 1, col);
    }
  }
}

// The bobbing [E] key prompt.
export function buildPrompt(): HTMLCanvasElement {
  const [c, g] = makeCanvas(9, 10);
  px(g, 0, 0, 9, 9, PAL.ui);
  px(g, 1, 1, 7, 7, "#121822");
  px(g, 1, 9, 7, 1, "#7d8894");
  text(g, "E", 3, 2, PAL.ui);
  return c;
}

const RAT = [
  ["....##...", ".#######.", "+########", ".#.#..#.."],
  ["....##...", ".#######.", "+########", "..#..#.#."],
];

export function buildRat(): HTMLCanvasElement[] {
  return RAT.map((rows) => {
    const [c, g] = makeCanvas(9, 4);
    drawMap(g, rows, 0, 0, { "#": "#2c3340", "+": "#5b4a52" });
    return c;
  });
}
