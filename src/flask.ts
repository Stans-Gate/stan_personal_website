// A hanging flask: sways on its chain, glows with its category color, holds
// sloshing liquid, pops its cork when opened and keeps a rune once visited.

import { categories } from "./content";
import { BEAM_Y, PAL } from "./config";
import { mix, px, type Ctx } from "./gfx";
import { drawGlow, drawPool, glowSprite } from "./lighting";
import { buildFlask, buildIcon, FLASK_H, FLASK_SHAPES, FLASK_W, ICON_SIZE, type FlaskArt, type FlaskShape } from "./sprites";
import type { FlaskSlot } from "./scene";

export const OPEN_TIME = 0.45; // seconds from pressing E to the panel appearing
const POP_AT = 0.18;

const shapeCache = new Map<FlaskShape, FlaskArt>();
function shapeArt(shape: FlaskShape) {
  let art = shapeCache.get(shape);
  if (!art) shapeCache.set(shape, (art = buildFlask(shape)));
  return art;
}

interface Tint {
  icon: HTMLCanvasElement;
  glow: HTMLCanvasElement;
  surface: string;
  body: string;
  core: string;
  deep: string;
  bubble: string;
}
const tintCache = new Map<string, Tint>();
function tintFor(slot: FlaskSlot): Tint {
  const cat = categories[slot.entry.category];
  let tint = tintCache.get(slot.entry.category);
  if (!tint) {
    tint = {
      icon: buildIcon(cat.icon, cat.glow),
      glow: glowSprite(cat.glow, 44, 0.36),
      surface: mix(cat.glow, "#ffffff", 0.5),
      body: mix(cat.glow, "#000000", 0.4),
      core: mix(cat.glow, "#000000", 0.24),
      deep: mix(cat.glow, "#000000", 0.62),
      bubble: mix(cat.glow, "#ffffff", 0.65),
    };
    tintCache.set(slot.entry.category, tint);
  }
  return tint;
}

// ------------------------------------------------------------- particles ----

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  grav?: number;
}
const particles: Particle[] = [];

export function updateParticles(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.vy += (p.grav ?? 300) * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

// Little puffs of dust for jumps, landings and rolls.
export function spawnDust(x: number, y: number, count: number, dir = 0) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y - 1,
      vx: (Math.random() - 0.5) * 50 - dir * 30,
      vy: -10 - Math.random() * 25,
      life: 0.25 + Math.random() * 0.25,
      size: Math.random() < 0.4 ? 2 : 1,
      color: Math.random() < 0.5 ? "#59677a" : "#3e4a5a",
      grav: 40,
    });
  }
}

export function drawParticles(g: Ctx, camX: number) {
  for (const p of particles) px(g, Math.round(p.x) - camX, Math.round(p.y), p.size, p.size, p.color);
}

// ------------------------------------------------------------------ flask ---

export class Flask {
  readonly x: number;
  readonly chain: number;
  readonly color: string;
  state: "idle" | "opening" | "open" = "idle";
  visited = false;
  inRange = false;
  dx = 0; // current horizontal swing of the flask body, in pixels
  private t = 0;
  private amp: number;
  private swing = 0; // -1..1, drives the liquid tilt
  private popped = false;
  private readonly phase: number;
  private readonly speed: number;
  private readonly art: FlaskArt;
  private readonly tint: Tint;

  constructor(readonly slot: FlaskSlot, private readonly reduced: boolean) {
    this.x = slot.x;
    this.chain = slot.chain;
    this.color = categories[slot.entry.category].glow;
    // mix the shapes along the row so neighbours differ
    this.art = shapeArt(FLASK_SHAPES[(slot.index * 3 + Math.floor(slot.index / 4)) % FLASK_SHAPES.length]);
    this.tint = tintFor(slot);
    // offset timing so no two flasks move in sync
    this.phase = slot.index * 1.7;
    this.speed = 1.1 + ((slot.index * 37) % 10) / 22;
    this.amp = this.restAmp(false);
  }

  get top() {
    return BEAM_Y + this.chain;
  }

  // Swing angle sized so every flask travels a few pixels whatever its chain length.
  private restAmp(active: boolean) {
    return (active ? 4.5 : 2.5) / this.chain;
  }

  startOpening() {
    this.state = "opening";
    this.t = 0;
    this.popped = false;
  }

  setOpen(open: boolean) {
    this.state = open ? "open" : "idle";
  }

  // Returns true on the frame the cork pops.
  update(dt: number, time: number): boolean {
    let poppedNow = false;
    this.amp += (this.restAmp(this.inRange) - this.amp) * Math.min(1, dt * 4);
    this.swing = this.reduced ? 0 : Math.sin(time * this.speed + this.phase);
    let angle = this.swing * this.amp;
    if (this.state === "opening") {
      this.t += dt;
      if (!this.reduced) angle += (Math.sin(this.t * 42) * 3 * Math.max(0, 1 - this.t / OPEN_TIME)) / this.chain;
      if (!this.popped && this.t >= POP_AT) {
        this.popped = true;
        poppedNow = true;
        if (!this.reduced) this.burst();
      }
    }
    this.dx = Math.round(Math.sin(angle) * this.chain);
    return poppedNow;
  }

  private burst() {
    const x = this.x + this.dx;
    const y = this.top;
    particles.push({ x: x - 2, y: y - 2, vx: 22, vy: -150, life: 0.9, size: 3, color: "#8a6a4a" });
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const s = 50 + Math.random() * 90;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.35 + Math.random() * 0.4,
        size: Math.random() < 0.3 ? 2 : 1,
        color: Math.random() < 0.5 ? this.color : this.tint.bubble,
      });
    }
  }

  private pulse(time: number) {
    // brightness +-15% over ~2.6 s
    const p = this.reduced ? 1 : 1 + 0.15 * Math.sin((time * Math.PI * 2) / 2.6 + this.phase);
    return p * (this.inRange || this.state !== "idle" ? 1 : 0.4);
  }

  drawGlow(g: Ctx, camX: number, time: number) {
    const a = this.pulse(time);
    drawGlow(g, this.tint.glow, this.x + this.dx - camX, this.top + 24, a);
    drawPool(g, this.color, this.x - camX, a * 0.45);
  }

  // Liquid is drawn column by column so its surface can slosh: it tilts
  // against the swing and carries a small travelling ripple.
  private drawLiquid(g: Ctx, fx: number, fy: number, time: number) {
    const { colTop, colBot, level } = this.art;
    const { surface, body, core, deep } = this.tint;
    const tilt = this.swing * (this.inRange ? 2.2 : 1.4);
    for (let x = 0; x < FLASK_W; x++) {
      const bot = colBot[x];
      if (bot < 0) continue;
      const ripple = this.reduced ? 0 : Math.sin(time * 2.8 + x * 0.6 + this.phase) * 0.6 + Math.sin(time * 4.3 - x * 0.9) * 0.3;
      const top = Math.max(colTop[x], Math.round(level - (tilt * (x - 13.5)) / 13 + ripple));
      if (top > bot) continue;
      const h = bot - top + 1;
      // clean bands, light to dark going down: meniscus, bright layer, body, deep
      px(g, fx + x, fy + top, 1, h, body);
      if (h > 3) px(g, fx + x, fy + top + 1, 1, Math.min(3, h - 3), core);
      px(g, fx + x, fy + bot - Math.min(h, 3) + 1, 1, Math.min(h, 3), deep);
      px(g, fx + x, fy + top, 1, 1, surface);
    }
  }

  draw(g: Ctx, camX: number, time: number) {
    const ax = this.x - camX;
    // chain: one pixel per row, leaning toward the swung flask
    for (let i = 0; i < this.chain + 2; i++) {
      px(g, ax + Math.round((this.dx * i) / this.chain), BEAM_Y + i, 1, 1, i % 4 < 2 ? PAL.metalL : PAL.metalD);
    }
    const fx = ax + this.dx - FLASK_W / 2;
    const fy = this.top;
    const art = this.art;
    g.drawImage(art.back, fx, fy);
    this.drawLiquid(g, fx, fy, time);

    // rising bubbles
    if (!this.reduced) {
      g.fillStyle = this.tint.bubble;
      for (let b = 0; b < 4; b++) {
        const bx = [8, 18, 12, 21][b];
        const span = art.colBot[bx] - art.level - 2;
        if (span < 3) continue;
        const rise = (time * (5 + b * 1.7) + this.phase * 3 + b * 4) % span;
        g.globalAlpha = 0.85 - (rise / span) * 0.5;
        const wobble = Math.round(Math.sin(time * 3 + b * 2 + rise * 0.6));
        g.fillRect(fx + bx + wobble, fy + art.colBot[bx] - 1 - Math.floor(rise), 1, 1);
      }
      g.globalAlpha = 1;
    }

    // icon suspended in the liquid
    const bob = this.reduced ? 0 : Math.round(Math.sin(time * 1.4 + this.phase) * 1.2);
    g.drawImage(this.tint.icon, fx + (FLASK_W - ICON_SIZE) / 2, fy + art.iconY + bob);

    const corked = this.state === "idle" || (this.state === "opening" && !this.popped);
    g.drawImage(corked ? art.front : art.frontOpen, fx, fy);

    // visited rune: a small star beside the collar
    if (this.visited) {
      const sx = fx + FLASK_W - 7;
      const sy = fy;
      px(g, sx + 2, sy, 1, 5, "#ffe9a8");
      px(g, sx, sy + 2, 5, 1, "#ffe9a8");
      px(g, sx + 1, sy + 1, 3, 3, "#fff6d6");
    }
  }

  // hit box for taps and clicks (world coordinates)
  hit(wx: number, wy: number) {
    return Math.abs(wx - (this.x + this.dx)) <= FLASK_W / 2 + 2 && wy >= this.top - 4 && wy <= this.top + FLASK_H + 4;
  }

  onScreen(camX: number, viewW: number) {
    return this.x - camX > -70 && this.x - camX < viewW + 70;
  }
}
