// Light is drawn on top of a dark scene: soft radial glows (additive), colored
// pools on the floor, and a vignette. Falloff is a smooth gaussian so light
// blends into its surroundings instead of spreading in visible rings.

import { makeCanvas, rgb, type Ctx } from "./gfx";
import { FLOOR_Y, VIEW_H } from "./config";

const cache = new Map<string, HTMLCanvasElement>();

// Gaussian that reaches exactly zero at the edge (d = 1).
const EDGE = Math.exp(-4.5);
const falloff = (d: number) => (d >= 1 ? 0 : (Math.exp(-4.5 * d * d) - EDGE) / (1 - EDGE));

// A little per-pixel noise hides the last traces of 8-bit stepping.
const dither = (x: number, y: number) => (((x * 13 + y * 29) % 7) / 7 - 0.5) * 1.2;

function softSprite(key: string, w: number, h: number, color: string, alphaAt: (x: number, y: number) => number) {
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = makeCanvas(w, h);
  const img = g.createImageData(w, h);
  const [r, gr, b] = rgb(color);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = alphaAt(x, y) * 255;
      if (a <= 0.4) continue;
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = gr;
      img.data[i + 2] = b;
      img.data[i + 3] = Math.max(0, Math.min(255, Math.round(a + dither(x, y))));
    }
  }
  g.putImageData(img, 0, 0);
  cache.set(key, c);
  return c;
}

export function glowSprite(color: string, radius: number, strength: number): HTMLCanvasElement {
  const size = radius * 2;
  return softSprite(`glow|${color}|${radius}|${strength}`, size, size, color, (x, y) => {
    return falloff(Math.hypot(x + 0.5 - radius, y + 0.5 - radius) / radius) * strength;
  });
}

// Call with globalCompositeOperation = "lighter".
export function drawGlow(g: Ctx, sprite: HTMLCanvasElement, cx: number, cy: number, alpha: number) {
  g.globalAlpha = Math.max(0, Math.min(1, alpha));
  g.drawImage(sprite, Math.round(cx - sprite.width / 2), Math.round(cy - sprite.height / 2));
  g.globalAlpha = 1;
}

// Faint colored light on the floor under a flask or torch: a soft ellipse
// lying on the floor, brightest at the front edge.
const POOL_W = 64;
const POOL_H = 16;

export function drawPool(g: Ctx, color: string, cx: number, alpha: number, wide = 1) {
  const sprite = softSprite(`pool|${color}`, POOL_W, POOL_H, color, (x, y) => {
    return falloff(Math.hypot((x + 0.5 - POOL_W / 2) / (POOL_W / 2), (y + 0.5) / POOL_H)) * 0.42;
  });
  const w = Math.round(POOL_W * wide);
  g.globalAlpha = Math.max(0, Math.min(1, alpha));
  g.drawImage(sprite, Math.round(cx - w / 2), FLOOR_Y, w, POOL_H);
  g.globalAlpha = 1;
}

export function makeVignette(w: number): HTMLCanvasElement {
  const [c, g] = makeCanvas(w, VIEW_H);
  const img = g.createImageData(w, VIEW_H);
  for (let y = 0; y < VIEW_H; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - w / 2) / (w / 2);
      const dy = (y - VIEW_H / 2) / (VIEW_H / 2);
      const t = Math.max(0, Math.min(1, (Math.hypot(dx * 0.9, dy * 0.8) - 0.55) / 0.7));
      const a = t * t * (3 - 2 * t) * 0.6 * 255;
      img.data[(y * w + x) * 4 + 3] = a < 0.5 ? 0 : Math.max(0, Math.min(255, Math.round(a + dither(x, y))));
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}
