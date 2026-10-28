// The cloaked wanderer. Movement is tuned to feel quick and forgiving, in the
// spirit of action platformers like Dead Cells: always-on fast run, high
// acceleration, variable-height jumps with apex hang, coyote time and jump
// buffering, a double jump, a dodge roll, drop-through platforms and automatic
// ledge mantling.

import { FLOOR_Y } from "./config";
import type { Ctx } from "./gfx";
import { buildPlayerSheet, PLAYER_H, PLAYER_W, type PlayerSheet } from "./sprites";

export interface Solid {
  x: number;
  y: number; // top surface
  w: number;
  h: number;
  oneWay: boolean; // wooden platforms: jump up through, stand on top, drop through
}

export interface Intent {
  move: -1 | 0 | 1;
  jump: boolean; // pressed this step (buffered)
  jumpHeld: boolean;
  down: boolean;
  roll: boolean; // pressed this step
}

export type PlayerEvent = "step" | "jump" | "land" | "roll";

// tuning (internal pixels, seconds)
const RUN = 118;
const ACCEL_GROUND = 1600;
const ACCEL_AIR = 1150;
const DECEL_GROUND = 2000;
const DECEL_AIR = 650;
const GRAV_UP = 1150;
const GRAV_DOWN = 1750;
const GRAV_APEX = 520; // gentle hang at the top of a held jump
const APEX_BAND = 45;
const JUMP_V = 360; // ~3.5 tiles
const DOUBLE_V = 305;
const JUMP_CUT = 0.45; // releasing jump early trims the rise
const MAX_FALL = 430;
const FAST_FALL = 580;
const COYOTE = 0.1;
const BUFFER = 0.13;
const ROLL_TIME = 0.32;
const ROLL_SPEED = 230;
const ROLL_COOLDOWN = 0.12;
const MANTLE_REACH = 14; // how far below a ledge top the feet can be and still climb up
const HALF_W = 5;
const BODY_H = 22;
const ROLL_H = 12;

export class Player {
  x: number;
  y = FLOOR_Y; // feet
  vx = 0;
  vy = 0;
  facing: 1 | -1 = 1;
  onGround = true;
  reachT = 0; // > 0 while playing the "reach/inspect" pose
  private landT = 0;
  private coyoteT = 0;
  private bufferT = 0;
  private airJumps = 1;
  private rollT = 0;
  private rollCool = 0;
  private dropT = 0;
  private mantleT = 0;
  private flipT = 0;
  private ground: Solid | null = null;
  private anim = "idle";
  private animT = 0;
  private lastStepFrame = -1;
  private sheet: PlayerSheet = buildPlayerSheet();

  constructor(x: number, private solids: Solid[]) {
    this.x = x;
  }

  get rolling() {
    return this.rollT > 0;
  }

  get headY() {
    return this.y - (this.rolling ? ROLL_H : BODY_H);
  }

  // Put the player on the floor at x (used when opening things from the keyboard).
  teleport(x: number) {
    this.x = x;
    this.y = FLOOR_Y;
    this.vx = this.vy = 0;
    this.onGround = true;
    this.ground = null;
    this.rollT = 0;
  }

  update(intent: Intent, dt: number, minX: number, maxX: number): PlayerEvent[] {
    const events: PlayerEvent[] = [];
    this.landT = Math.max(0, this.landT - dt);
    this.reachT = Math.max(0, this.reachT - dt);
    this.coyoteT = this.onGround ? COYOTE : Math.max(0, this.coyoteT - dt);
    this.bufferT = intent.jump ? BUFFER : Math.max(0, this.bufferT - dt);
    this.rollCool = Math.max(0, this.rollCool - dt);
    this.dropT = Math.max(0, this.dropT - dt);
    this.mantleT = Math.max(0, this.mantleT - dt);
    this.flipT = Math.max(0, this.flipT - dt);

    // ---- dodge roll ----
    if (intent.roll && !this.rolling && this.rollCool === 0) {
      if (intent.move) this.facing = intent.move;
      this.rollT = ROLL_TIME;
      this.vx = this.facing * ROLL_SPEED;
      if (!this.onGround) this.vy = Math.min(this.vy, 80);
      events.push("roll");
    }

    // ---- horizontal ----
    if (this.rolling) {
      this.rollT -= dt;
      const t = 1 - this.rollT / ROLL_TIME;
      this.vx = this.facing * ROLL_SPEED * (1 - 0.35 * t);
      if (this.rollT <= 0) {
        this.rollT = 0;
        this.rollCool = ROLL_COOLDOWN;
        this.vx = this.facing * RUN * (intent.move === this.facing ? 1 : 0.4);
      }
    } else if (intent.move) {
      this.facing = intent.move;
      const accel = this.onGround ? ACCEL_GROUND : ACCEL_AIR;
      // turning around is snappier than speeding up
      const turn = Math.sign(this.vx) === -intent.move ? 1.8 : 1;
      this.vx += intent.move * accel * turn * dt;
      if (Math.abs(this.vx) > RUN) this.vx = Math.sign(this.vx) * RUN;
    } else {
      const drop = (this.onGround ? DECEL_GROUND : DECEL_AIR) * dt;
      this.vx = Math.abs(this.vx) <= drop ? 0 : this.vx - Math.sign(this.vx) * drop;
    }

    // ---- jumping ----
    if (this.bufferT > 0 && !this.rolling) {
      if (intent.down && this.onGround && this.ground?.oneWay) {
        // drop through a wooden platform
        this.dropT = 0.22;
        this.onGround = false;
        this.ground = null;
        this.coyoteT = 0;
        this.y += 1;
        this.bufferT = 0;
      } else if (this.coyoteT > 0) {
        this.vy = -JUMP_V;
        this.onGround = false;
        this.coyoteT = 0;
        this.bufferT = 0;
        this.airJumps = 1;
        events.push("jump");
      } else if (this.airJumps > 0) {
        this.vy = -DOUBLE_V;
        this.airJumps--;
        this.bufferT = 0;
        this.flipT = 0.32;
        events.push("jump");
      }
    }
    if (!intent.jumpHeld && this.vy < -60 && !this.onGround) this.vy *= Math.pow(JUMP_CUT, dt * 18);

    // ---- gravity ----
    if (!this.onGround) {
      let g = this.vy < 0 ? GRAV_UP : GRAV_DOWN;
      if (intent.jumpHeld && Math.abs(this.vy) < APEX_BAND) g = GRAV_APEX;
      if (intent.down && this.vy > 0) g *= 1.4;
      this.vy = Math.min(this.vy + g * dt, intent.down ? FAST_FALL : MAX_FALL);
    }

    // ---- move and collide: x first, then y ----
    const wasGround = this.onGround;
    let pushing: Solid | null = null;
    this.x += this.vx * dt;
    for (const s of this.solids) {
      if (s.oneWay || !this.overlaps(s)) continue;
      if (this.vx > 0 || (this.vx === 0 && this.x < s.x + s.w / 2)) this.x = s.x - HALF_W;
      else this.x = s.x + s.w + HALF_W;
      pushing = s;
      if (!this.rolling) this.vx = 0;
    }
    if (this.x < minX) {
      this.x = minX;
      this.vx = 0;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.vx = 0;
    }

    const prevFeet = this.y;
    const prevHead = this.headY;
    this.y += this.vy * dt;
    this.onGround = false;
    if (this.vy >= 0) {
      let landed: Solid | null = null;
      for (const s of this.solids) {
        if (s.oneWay && this.dropT > 0) continue;
        if (this.spans(s) && prevFeet <= s.y + 0.5 && this.y >= s.y && (!landed || s.y < landed.y)) landed = s;
      }
      if (landed) this.settle(landed.y, landed);
      else if (this.y >= FLOOR_Y) this.settle(FLOOR_Y, null);
    } else {
      for (const s of this.solids) {
        if (s.oneWay || !this.spans(s)) continue;
        const bottom = s.y + s.h;
        if (prevHead >= bottom - 0.5 && this.headY < bottom) {
          this.y = bottom + (this.rolling ? ROLL_H : BODY_H);
          this.vy = 0;
        }
      }
    }

    // ---- ledge mantle: climb automatically when the feet just miss a top ----
    if (!this.onGround && this.vy > -150 && !this.rolling) {
      for (const s of this.solids) {
        if (s.oneWay && this.dropT > 0) continue;
        const below = this.y - s.y;
        if (below <= 0 || below > MANTLE_REACH) continue;
        const besideSolid = s === pushing && intent.move !== 0;
        const overOneWay = s.oneWay && this.overlapW(s) >= 3 && (intent.move !== 0 || intent.jumpHeld);
        if (besideSolid || overOneWay) {
          if (besideSolid) this.x = this.vx >= 0 && this.x < s.x + s.w / 2 ? s.x + HALF_W + 1 : s.x + s.w - HALF_W - 1;
          this.mantleT = 0.14;
          this.settle(s.y, s);
          break;
        }
      }
    }

    if (this.onGround && !wasGround && this.landT > 0) events.push("land");
    if (!this.onGround) this.ground = null;

    // ---- animation ----
    let next = "idle";
    if (this.rolling) next = "roll";
    else if (this.mantleT > 0) next = "mantle";
    else if (!this.onGround) next = this.flipT > 0 ? "roll" : this.vy < 0 ? "jump" : "fall";
    else if (this.landT > 0) next = "land";
    else if (this.reachT > 0) next = "reach";
    else if (Math.abs(this.vx) > 70) next = "run";
    else if (Math.abs(this.vx) > 6) next = "walk";
    if (next !== this.anim) {
      this.anim = next;
      this.animT = 0;
      this.lastStepFrame = -1;
    } else this.animT += dt;

    if (this.anim === "walk" || this.anim === "run") {
      const frame = this.frame();
      if ((frame === 0 || frame === 3) && frame !== this.lastStepFrame) events.push("step");
      this.lastStepFrame = frame;
    }
    return events;
  }

  private settle(y: number, s: Solid | null) {
    if (!this.onGround && this.vy > 160) this.landT = this.vy > 330 ? 0.14 : 0.08;
    this.y = y;
    this.vy = 0;
    this.onGround = true;
    this.ground = s;
    this.airJumps = 1;
  }

  private spans(s: Solid) {
    return this.x + HALF_W > s.x && this.x - HALF_W < s.x + s.w;
  }

  private overlapW(s: Solid) {
    return Math.min(this.x + HALF_W, s.x + s.w) - Math.max(this.x - HALF_W, s.x);
  }

  private overlaps(s: Solid) {
    return this.spans(s) && this.y > s.y && this.headY < s.y + s.h;
  }

  private frame(): number {
    switch (this.anim) {
      case "idle":
        return Math.floor(this.animT * 4) % 4;
      case "walk":
        return Math.floor(this.animT * 12) % 6;
      case "run":
        return Math.floor(this.animT * 16) % 6;
      case "jump":
        return this.vy < -150 ? 0 : 1;
      case "fall":
        return Math.floor(this.animT * 10) % 2;
      case "land":
        return this.landT > 0.06 ? 0 : 1;
      case "reach":
        return Math.min(2, Math.floor(this.animT * 12));
      case "roll":
        return Math.floor(this.animT * 22) % 4;
      case "mantle":
        return this.mantleT > 0.07 ? 0 : 1;
      default:
        return 0;
    }
  }

  draw(g: Ctx, camX: number) {
    const a = this.sheet.anims[this.anim];
    const sx = (a.start + (this.frame() % a.count)) * PLAYER_W;
    const dx = Math.round(this.x) - camX - PLAYER_W / 2;
    const dy = Math.round(this.y) - PLAYER_H;
    if (this.facing === 1) {
      g.drawImage(this.sheet.canvas, sx, 0, PLAYER_W, PLAYER_H, dx, dy, PLAYER_W, PLAYER_H);
    } else {
      g.save();
      g.translate(dx + PLAYER_W, dy);
      g.scale(-1, 1);
      g.drawImage(this.sheet.canvas, sx, 0, PLAYER_W, PLAYER_H, 0, 0, PLAYER_W, PLAYER_H);
      g.restore();
    }
  }
}
