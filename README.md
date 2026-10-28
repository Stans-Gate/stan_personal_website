# Stan Chen · Pixel Dungeon Portfolio

A playable 2D pixel-art room: glass flasks hang from chains, each holding one project or role, and a lectern holds the contact links. Built from the spec in [website_update.md](website_update.md).

- **Stack:** Vite + TypeScript + Canvas 2D, with DOM overlays for the panels and HUD. No runtime dependencies.
- **Content:** everything lives in [src/content.ts](src/content.ts). Add an object to `entries` and a new flask appears, laid out automatically by category.
- **List view:** [list.html](list.html) is plain static HTML generated from the same content at build time (no JavaScript needed).
- **Art and sound:** all sprites are original and drawn in code at boot ([src/sprites.ts](src/sprites.ts), [src/scene.ts](src/scene.ts)); sound is synthesized with WebAudio, so there are no sprite or audio files to download.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check, then build to dist/
npm run preview  # serve the production build
```

## Controls

| Action | Keys |
| --- | --- |
| Move | ← → or A / D |
| Jump | Space, ↑ or W (hold for higher, press again in the air to double jump) |
| Dodge roll | Shift (or K / L) |
| Drop through a wooden platform | ↓ or S + Jump |
| Inspect | E or Enter |
| Close panel | Esc, E, or click outside |
| Cycle flasks | Tab / Shift+Tab |

Ledges are climbed automatically when you just miss the top. Upper flasks are only in reach from the platforms. On touch screens: on-screen buttons, or tap a flask or the lectern to walk there and open it.

## Credits

Cave backdrop: ["Cavernous"](https://opengameart.org/content/cavernous-background) by Spring Spring (CC0). Fonts: Press Start 2P and VT323 (Google Fonts, SIL Open Font License).
