// Follows the player with a small dead zone, clamped to the room. While the
// player pushes the dead-zone edge the camera tracks exactly (no sub-pixel
// jitter); larger gaps, like jumping focus to another flask, ease in.

import { clamp } from "./gfx";

const DEAD_ZONE = 14;

export class Camera {
  private center = 0;
  x = 0; // left edge of the view in world pixels (integer)

  constructor(private roomW: number) {}

  snap(targetX: number, viewW: number) {
    this.center = targetX;
    this.apply(viewW);
  }

  // `focus` pulls the camera straight to a point (keyboard flask cycling).
  update(dt: number, playerX: number, viewW: number, focus: number | null, instant: boolean) {
    const desired = focus ?? clamp(this.center, playerX - DEAD_ZONE, playerX + DEAD_ZONE);
    const diff = desired - this.center;
    if (instant || Math.abs(diff) < 3) this.center = desired;
    else this.center += diff * Math.min(1, dt * 9);
    this.apply(viewW);
  }

  private apply(viewW: number) {
    const half = viewW / 2;
    this.center = clamp(this.center, half, Math.max(half, this.roomW - half));
    this.x = Math.round(this.center - half);
  }
}
