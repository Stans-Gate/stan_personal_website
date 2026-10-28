// Internal resolution and shared constants. Everything in the canvas is drawn
// in these "internal pixels" and scaled up by an integer factor.

export const VIEW_H = 270;
export const MAX_VIEW_W = 480;
export const MIN_VIEW_W = 256; // portrait phones get a narrower view, never blurry pixels
export const TILE = 16;
export const FLOOR_Y = 222; // top of the floor
export const BEAM_TOP = 16;
export const BEAM_Y = 28; // underside of the ceiling beam; chains anchor here
export const STEP = 1 / 60;
export const INTERACT_RANGE = 24;

// ~30 colors: cold blues, teals and slate for the world, warm only for fire.
export const PAL = {
  void: "#05070b",
  fog0: "#080c13",
  fog1: "#0b111c",
  fog2: "#111c2c",
  far0: "#0f1826",
  far1: "#162234",
  mortar: "#10161e",
  brick: "#18202b",
  brickL: "#1f2a37",
  brickD: "#141b25",
  moss: "#22392f",
  mossL: "#2f5443",
  stoneD: "#1e2632",
  stone: "#2b3644",
  stoneL: "#364454",
  stoneH: "#48596d",
  woodD: "#2a211e",
  wood: "#3a2f2a",
  woodL: "#4f3f34",
  metalD: "#2f3742",
  metal: "#4b5563",
  metalL: "#75828f",
  window: "#4d6c8c",
  windowL: "#7fa3c4",
  shaft: "#8fb4d8",
  water: "#1a2b3d",
  waterL: "#4a6a88",
  bone: "#7d898c",
  straw: "#6b6238",
  fire0: "#d9541e",
  fire1: "#ff9a3c",
  fire2: "#ffc85a",
  fire3: "#fff1b0",
  parchment: "#d9c9a3",
  parchmentD: "#8f7f5f",
  cloakD: "#283246",
  cloak: "#3d4b63",
  cloakL: "#5a6f93",
  scarf: "#6fa898",
  eye: "#c8f6ff",
  skin: "#c9d3e0",
  boot: "#151a23",
  ui: "#e6edf3",
};
