# Pixel Dungeon Portfolio — Build Spec

Oct 3, 2026 · @Stan Chen

## Overview

Build a personal portfolio site as a single, playable 2D pixel-art room: a dim stone dungeon antechamber where glass flasks hang from chains, each holding one project or work experience. The visitor walks a small character left and right, stands under a flask to inspect it, and uses a lectern to reveal contact links.

The mood is inspired by the first room you step into after respawning in a dark-fantasy roguelike (the hall of hanging flasks holding unlocked items). **All art, characters and layouts must be original** — capture the feeling (damp stone, chains, glowing glass, warm torchlight against cold shadow), not any existing game's sprites or level.

**To the AI building this:** treat this doc as the spec. Build in the milestone order at the end, keep all portfolio content in one data file, and ask the owner for anything marked TODO rather than inventing it.

**Owner TODOs before build:**

- [ ] List of projects (name, one-line pitch, tech, links, optional screenshot)
- [ ] List of internships/jobs (company, role, dates, 2–3 bullet highlights)
- [ ] Contact links: email, LinkedIn, GitHub, resume PDF, any others
- [ ] Name/title to show on the sign above the doorway

## The scene

One wide room, about 3 screens wide, that scrolls horizontally with the player. The player spawns on the left, stepping out of a cell door; the flasks fill the middle; the lectern sits near the right end before a sealed exit gate.

```
  [cell door]   ~chain~   ~chain~   ~chain~   ~chain~   ~chain~        [ name sign ]
   (spawn)       (FLASK)   (FLASK)   (FLASK)   (FLASK)   (FLASK)   torch     [LECTERN]  [gate]
  ====P=======================================================================================
   stone floor, puddles, scattered bones/straw, a drain grate
```

**Parallax layers (back to front):**

1. Far background: dark arched vaults and pillars fading into blue-black fog, scrolls at \~0.2× camera speed.
2. Mid background: back wall of mossy brick, barred windows letting in faint cold light shafts, hanging cages, \~0.5×.
3. Playfield: floor tiles, flasks on chains anchored to a ceiling beam, lectern, torches, player. 1×.
4. Foreground: occasional dark silhouettes (chains, broken pillars, vines) drifting past at \~1.3×, partly occluding the view for depth.

**Ambient life (cheap, but sells the place):** torch flames flicker on 4–6 frame loops; dust motes float in the light shafts; water drips from the ceiling into puddles with a ripple; flasks sway gently on their chains (offset timing so they never move in sync); a small rat or crow occasionally crosses the background.

**Opening moment:** on load, the screen fades in from black, the cell door creaks open, and the character steps out. A small hint fades in: "← → to move · E to inspect". Skip this on revisit (remember via sessionStorage, with a try/catch).

## Art direction

Render at a fixed low internal resolution of **480×270** and scale up by an integer factor (2×, 3×, 4×) to fit the window, letterboxing the rest. Nearest-neighbor scaling only (`image-rendering: pixelated`, `imageSmoothingEnabled = false`), so pixels stay crisp.

| Element | Size (internal px) | Notes |
| --- | --- | --- |
| Tiles | 16×16 | Stone floor, brick wall, beam |
| Player | \~16×24 | Hooded or cloaked figure; original design |
| Flask | \~20×28 + chain | Round-bottom glass, cork/metal cap, item silhouette inside |
| Lectern | \~24×32 | Wooden stand with an open glowing book |
| Torch | 8×16 + flame | Wall sconce, 4–6 frame flame loop |

**Palette:** limited, about 24–32 colors. Base the world on cold desaturated blues, teal-greens and slate greys for stone and fog; use warm orange/amber only for torches, so warm light feels precious. Flask glows are the most saturated colors on screen and should be the first thing the eye finds.

**Lighting:** draw the scene fairly dark, then add light on top: soft radial glows around torches and flasks (additive blend or pre-drawn glow sprites), a slow pulse on each flask (brightness ±15% over \~2–3 s), and a faint colored light pool on the floor beneath each flask. Optional: a subtle vignette and very light film grain.

**Typography:** a pixel font for all UI, e.g. "Press Start 2P" for headings and "VT323" or "Silkscreen" for body (Google Fonts). Text panels look like parchment or dark iron plates with a 1–2 px pixel border.

**Asset sourcing:** either hand-draw in Aseprite/Piskel or generate placeholder rectangles first, then swap in finished sprites. Free CC0 dungeon tilesets (itch.io, OpenGameArt) are fine as a starting base if their license allows, but credit them in the footer.

## Player and controls

A small cloaked figure that walks, runs, jumps and idles. Movement should feel snappy, not floaty: quick acceleration, short stop, slight squash on landing.

| Action | Keys | Behavior |
| --- | --- | --- |
| Move | ← → or A / D | Walk; hold Shift to run (\~1.8× speed) |
| Jump | Space, ↑ or W | Short hop, \~1.5 tiles high; purely for fun |
| Inspect / interact | E or Enter | Open the nearest flask or the lectern when in range |
| Close panel | Esc, E again, or click outside | Return to play |
| Cycle flasks | Tab / Shift+Tab | Jump the camera and focus to next/previous flask (accessibility shortcut) |

**Animations (frames):** idle breathing 4, walk 6–8, run 6–8, jump up 2, fall 2, land 2, "reach/inspect" 3. Sprite flips horizontally for facing direction.

**Physics:** fixed timestep (60 updates/s) independent of frame rate; simple AABB collision with the floor and room edges; no enemies, no damage. Camera follows the player with slight easing and a small dead zone, clamped to room bounds.

**Interaction prompt:** when the player is within \~24 px of a flask or the lectern, show a bobbing key icon `[E]` above it and brighten that object's glow.

## Hanging flasks: projects and experience

Each flask holds one entry, and its glow color tells the visitor what kind of entry it is before they read anything. Flasks hang at slightly different chain lengths so the row feels hand-placed, and are grouped by type with a small hanging plaque above each group.

| Category | Glow color | Hex (suggested) | Icon inside the flask |
| --- | --- | --- | --- |
| Internship / job | Amber gold | #F2B33D | Small briefcase or badge |
| Software / web project | Teal cyan | #3EE6D0 | Sword or code bracket rune |
| AI / ML / data project | Violet | #A066FF | Floating orb or eye |
| Hackathon / award | Crimson | #FF4D5E | Trophy or flame |
| Research / open source | Emerald | #4CDB6A | Scroll or gear |

Keep to 3–5 categories; adjust to the owner's actual mix. A small legend (colored dots + labels) sits in a corner of the HUD.

**Inside the flask:** a 12×12 pixel icon for the category, or a custom mini-sprite per item if the owner wants (e.g. a tiny phone for a mobile app). The icon bobs slowly, as if suspended in liquid, with 2–3 rising bubble pixels.

**States:**

- Idle: soft pulse, gentle sway.
- In range: glow brightens, chain sways a little more, `[E]` prompt appears.
- Opened: flask tilts toward the camera and pops its cork with a small particle burst in its color, then the info panel opens.
- Visited: after closing, a tiny tick or star rune stays on the flask so visitors know what they have seen.

**Info panel (on open):** a centered pixel-bordered panel, tinted with the flask's color, sliding up from the bottom. Contents:

1. Title and category tag (colored chip)
2. For experience: company, role, dates. For projects: one-line pitch and year
3. 2–4 short bullet highlights
4. Tech stack as small pixel tags
5. Optional screenshot or GIF, scaled with pixelated rendering on a frame
6. Buttons: Live demo, GitHub, Case study (only those that exist), opening in a new tab

The game pauses while a panel is open. Arrow keys inside the panel step to the previous/next flask without closing.

## Lectern: contact links

A wooden lectern with an open book stands under the brightest torch near the right end of the room. Pressing E there makes the book's pages flutter and glow, and the contact icons rise out of it one by one (staggered \~80 ms), floating in an arc above the lectern.

**Icons (pixel-art, \~16×16, white with a soft glow):** Email (envelope), LinkedIn, GitHub, Resume (scroll), plus optional extras such as personal blog, X/Bluesky, or Devpost.

**Interaction:**

- While the icons float, ← → (or Tab) moves a highlight between them; E/Enter opens the selected one. Mouse hover and click also work.
- A small label under the highlighted icon shows the destination (e.g. "github.com/username").
- Email copies the address to the clipboard and shows "Copied!" as well as offering a mailto link.
- Resume opens the PDF in a new tab.
- Walking away or pressing Esc makes the icons sink back into the book.

Use simple, recognizable glyphs for the platform icons rather than copying official logos pixel-for-pixel; follow each platform's brand guidelines if using their marks.

## UI, accessibility and mobile

Recruiters may spend 20 seconds on the site, so the game must never hide the content.

**HUD (minimal, pixel-styled):** owner's name and title on a hanging sign at top-left; flask legend at top-right; a sound toggle (off by default); a "Skip to list view" button always visible.

**List view:** a plain, fast HTML page (same pixel font and palette) listing every experience, project and contact link. It is the fallback for screen readers, no-JS, and impatient visitors, and it is what search engines index.

**Mobile and touch (under \~800 px wide or touch device):**

- On-screen pixel buttons: ◀ ▶ bottom-left, Jump and Inspect bottom-right.
- Tapping a flask or the lectern walks the player to it automatically and opens it.
- Panels go full-screen with a large close button.

**Accessibility:**

- All panels are real DOM elements over the canvas, with focus trapped while open and returned on close.
- Every flask has a text label for screen readers; Tab cycling works without the character.
- Respect `prefers-reduced-motion`: disable sway, particles, screen fade and parallax.
- Text contrast at least 4.5:1 on panels; minimum body text 16 px on screen.

**Sound (optional, off by default):** low dungeon ambience loop, footsteps, cork pop, page flutter. Keep each file small (OGG/MP3, under 200 KB).

## Tech stack and data

**Recommended stack:** Vite + TypeScript + plain HTML5 Canvas 2D for the scene, with DOM overlays for panels and the HUD. This keeps the bundle small and gives full control over pixel scaling. If the builder prefers an engine, Phaser 3 is the acceptable alternative (set `pixelArt: true`). Avoid React for the game loop; it is fine only for the list view if wanted.

**Hosting:** static build deployed to Vercel, Netlify, or GitHub Pages. Target under 1.5 MB total initial load; pack sprites into one or two spritesheets (PNG) with JSON frame data exported from Aseprite.

**Suggested file structure:**

```
/public
  /sprites      player.png, player.json, tiles.png, props.png, flasks.png, icons.png
  /audio        ambience.ogg, step.ogg, cork.ogg, page.ogg
  resume.pdf
/src
  main.ts         boot, scaling, game loop (fixed timestep)
  input.ts        keyboard + touch
  player.ts       movement, animation state machine
  camera.ts       follow, clamp, parallax offsets
  scene.ts        room layout, layers, ambient effects
  flask.ts        flask entity: sway, glow, states
  lectern.ts      lectern + floating icons
  lighting.ts     glow sprites, pulse, vignette
  ui/panel.ts     info panel (DOM)
  ui/hud.ts       name sign, legend, toggles
  list.html       accessible list view
  content.ts      ALL portfolio data (see below)
```

**Content data:** the scene is generated from one file, so adding a project means adding one object, and flask positions are laid out automatically by category and order.

```
export const categories = {
  work:     { label: "Experience",  glow: "#F2B33D", icon: "briefcase" },
  software: { label: "Projects",    glow: "#3EE6D0", icon: "rune" },
  ai:       { label: "AI / ML",     glow: "#A066FF", icon: "orb" },
};

export const entries = [
  {
    id: "acme-intern",
    category: "work",
    title: "Software Engineering Intern",
    org: "Acme Corp",            // TODO owner
    dates: "Jun–Aug 2026",
    highlights: ["…", "…"],
    tech: ["Go", "Postgres"],
    links: {},
    image: null,
  },
  {
    id: "project-x",
    category: "software",
    title: "Project X",
    pitch: "One-line description",
    year: 2025,
    highlights: ["…"],
    tech: ["React", "Node"],
    links: { demo: "…", github: "…" },
    image: "/shots/project-x.gif",
  },
];

export const contact = {
  email: "you@example.com",
  linkedin: "https://linkedin.com/in/…",
  github: "https://github.com/…",
  resume: "/resume.pdf",
};
```

## Build milestones

Build in this order, with a working, viewable result at the end of each step. Use colored rectangles as placeholders until art is ready, so gameplay is never blocked on sprites.

1. **Skeleton:** Vite project, canvas at 480×270 with integer scaling, fixed-timestep loop, `content.ts` loaded.
2. **Movement:** placeholder player box that walks, runs and jumps on a flat floor; camera follow and room bounds.
3. **Flasks:** generate flasks from `content.ts`, proximity prompt, open/close info panel with real content.
4. **Lectern:** floating contact icons, keyboard and mouse selection, copy-email.
5. **List view + mobile:** accessible list page, touch controls, tap-to-walk.
6. **Art pass:** tiles, parallax layers, player animations, flask and lectern sprites, glow and lighting.
7. **Polish:** ambient effects, opening sequence, cork-pop particles, visited runes, optional sound, reduced-motion.
8. **Ship:** performance check, meta tags and social preview image, deploy.

**Done when:**

- [ ] Holds 60 fps on a mid-range laptop and a recent phone
- [ ] Pixels are crisp at every window size (no blur, no sub-pixel jitter)
- [ ] Every entry in `content.ts` appears as a flask with the right glow color
- [ ] Every project and contact link is reachable by keyboard only, by touch only, and from the list view
- [ ] Panels pause the game, trap focus, and close with Esc
- [ ] `prefers-reduced-motion` disables motion effects
- [ ] Initial load under 1.5 MB; first playable frame under 2 s on 4G
- [ ] No sprite, layout or logo copied from an existing game
