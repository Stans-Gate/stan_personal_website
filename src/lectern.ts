// The lectern: an open book whose contact icons rise out one by one and float
// in an arc. The icons are drawn here; ui/contacts.ts lays real links over them.

import { FLOOR_Y, PAL } from "./config";
import { clamp, px, type Ctx } from "./gfx";
import { drawGlow, glowSprite } from "./lighting";
import { contactItems } from "./links";
import { buildContactIcon, buildLectern, LECTERN_H, LECTERN_W } from "./sprites";

const STAGGER = 0.08;
const RISE = 0.32;

export class Lectern {
  open = false;
  inRange = false;
  selected = 0;
  private t = 0;
  private flutter = 0;
  private readonly sprite = buildLectern();
  private readonly icons = contactItems.map((c) => ({
    dim: buildContactIcon(c.id, "#aebccb"),
    lit: buildContactIcon(c.id, "#ffffff"),
  }));
  private readonly bookGlow = glowSprite("#bfe6ff", 36, 0.5);
  private readonly iconGlow = glowSprite("#ffffff", 20, 0.45);
  private readonly offsets: [number, number][];
  private readonly tMax: number;

  constructor(readonly x: number, private readonly reduced: boolean) {
    const n = contactItems.length;
    this.offsets = contactItems.map((_, i) => {
      const a = ((155 - (130 * i) / Math.max(1, n - 1)) * Math.PI) / 180;
      // a tight arc high above the book, clear of the flasks and the name sign
      return [Math.round(Math.cos(a) * 30), Math.round(-Math.sin(a) * 16 - 66)];
    });
    this.tMax = RISE + STAGGER * (n - 1);
  }

  get visible() {
    return this.t > 0;
  }

  setOpen(open: boolean) {
    if (open && !this.open) this.flutter = 0.5;
    this.open = open;
    if (this.reduced) this.t = open ? this.tMax : 0;
  }

  update(dt: number) {
    this.t = clamp(this.t + (this.open ? dt : -dt * 1.6), 0, this.tMax);
    this.flutter = Math.max(0, this.flutter - dt);
  }

  // Center of icon i in world pixels, plus how far it has risen (0..1).
  iconPos(i: number, time: number) {
    const raw = clamp((this.t - i * STAGGER) / RISE, 0, 1);
    const p = 1 - (1 - raw) * (1 - raw);
    const bob = this.reduced ? 0 : Math.sin(time * 2 + i * 1.3) * 1.5 * p;
    const [ox, oy] = this.offsets[i];
    const bookY = FLOOR_Y - LECTERN_H + 6;
    return { x: this.x + ox * p, y: bookY + oy * p + bob, p };
  }

  drawGlow(g: Ctx, camX: number, time: number) {
    const base = this.open ? 1 : this.inRange ? 0.6 : 0.3;
    const pulse = this.reduced ? 1 : 1 + 0.12 * Math.sin(time * 2.4);
    drawGlow(g, this.bookGlow, this.x - camX, FLOOR_Y - LECTERN_H + 6, base * pulse);
    if (!this.visible) return;
    contactItems.forEach((_, i) => {
      const { x, y, p } = this.iconPos(i, time);
      drawGlow(g, this.iconGlow, x - camX, y, p * (i === this.selected ? 1 : 0.4));
    });
  }

  draw(g: Ctx, camX: number, time: number) {
    const lx = this.x - camX - LECTERN_W / 2;
    const ly = FLOOR_Y - LECTERN_H;
    g.drawImage(this.sprite, lx, ly);
    if (this.flutter > 0 && !this.reduced) {
      // a page lifting and turning from right to left
      const k = Math.floor((0.5 - this.flutter) * 12);
      px(g, lx + 18 - k * 2, ly + 3 - (k % 3), 2, 6, "#fff8e2");
    }
    if (!this.visible) return;
    contactItems.forEach((_, i) => {
      const { x, y, p } = this.iconPos(i, time);
      if (p <= 0) return;
      const ix = Math.round(x - camX) - 8;
      const iy = Math.round(y) - 8;
      const sel = i === this.selected && this.open;
      g.globalAlpha = p;
      g.drawImage(sel ? this.icons[i].lit : this.icons[i].dim, ix, iy);
      g.globalAlpha = 1;
      if (sel) {
        for (const [cx, cy] of [[-3, -3], [17, -3], [-3, 17], [17, 17]]) {
          px(g, ix + cx, iy + cy, 2, 2, PAL.ui);
        }
      }
    });
  }

  hit(wx: number, wy: number) {
    return Math.abs(wx - this.x) <= 16 && wy >= FLOOR_Y - LECTERN_H - 6 && wy <= FLOOR_Y;
  }
}
