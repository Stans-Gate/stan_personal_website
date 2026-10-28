// The info panel: a real DOM dialog over the canvas. It traps focus while
// open, closes with Esc / E / a click outside, and steps between flasks with
// the arrow keys.

import { categories, linkLabels, orderedEntries, type Entry, type EntryLinks } from "../content";

export interface Panel {
  readonly isOpen: boolean;
  readonly index: number;
  open(index: number): void;
  close(): void;
  handleKey(e: KeyboardEvent): void;
}

interface PanelOptions {
  onStep(from: number, to: number): void;
  // Returns the element that should receive focus again, if any.
  onClose(index: number): HTMLElement | null;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, textContent?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
}

export function createPanel(opts: PanelOptions): Panel {
  const backdrop = el("div", "panel-backdrop");
  backdrop.hidden = true;
  const dialog = el("section", "panel");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "panel-title");
  dialog.tabIndex = -1;

  const close = el("button", "panel-close", "✕");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  const body = el("div", "panel-body");
  const nav = el("div", "panel-nav");
  const prev = el("button", "btn", "◀ Prev");
  const next = el("button", "btn", "Next ▶");
  prev.type = next.type = "button";
  prev.setAttribute("aria-label", "Previous flask");
  next.setAttribute("aria-label", "Next flask");
  const counter = el("span", "panel-count");
  nav.append(prev, counter, next);
  dialog.append(close, body, nav);
  backdrop.append(dialog);
  document.getElementById("panel-root")!.append(backdrop);

  let isOpen = false;
  let index = 0;
  const background = ["hud", "flask-nav", "touch", "stage"].map((id) => document.getElementById(id)!);

  function fill(entry: Entry) {
    const cat = categories[entry.category];
    dialog.style.setProperty("--glow", cat.glow);
    body.replaceChildren();

    body.append(el("span", "chip", cat.label));
    const title = el("h2", "panel-title", entry.title);
    title.id = "panel-title";
    body.append(title);
    if (entry.org) body.append(el("p", "panel-meta", [entry.org, entry.dates].filter(Boolean).join(" · ")));
    if (entry.pitch) body.append(el("p", "panel-pitch", entry.pitch));
    if (entry.year && !entry.org) body.append(el("p", "panel-meta", String(entry.year)));

    const list = el("ul", "panel-list");
    for (const h of entry.highlights) list.append(el("li", undefined, h));
    body.append(list);

    const tags = el("ul", "tags");
    tags.setAttribute("aria-label", "Tech stack");
    for (const t of entry.tech) tags.append(el("li", undefined, t));
    body.append(tags);

    if (entry.image) {
      const fig = el("figure", "panel-shot");
      const img = el("img");
      img.src = entry.image;
      img.alt = `Screenshot of ${entry.title}`;
      img.loading = "lazy";
      fig.append(img);
      body.append(fig);
    }
    if (entry.note) body.append(el("p", "panel-note", entry.note));

    const keys = Object.keys(entry.links) as (keyof EntryLinks)[];
    if (keys.length) {
      const links = el("div", "panel-links");
      for (const key of keys) {
        const a = el("a", "btn btn-primary", linkLabels[key]);
        a.href = entry.links[key]!;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        links.append(a);
      }
      body.append(links);
    }
    counter.textContent = `${index + 1} / ${orderedEntries.length}`;
    dialog.scrollTop = 0;
  }

  function step(dir: number) {
    const n = orderedEntries.length;
    const from = index;
    index = (index + dir + n) % n;
    fill(orderedEntries[index]);
    opts.onStep(from, index);
  }

  function doClose() {
    if (!isOpen) return;
    isOpen = false;
    backdrop.hidden = true;
    dialog.classList.remove("in");
    for (const b of background) b.inert = false;
    const returnTo = opts.onClose(index);
    if (returnTo && returnTo.isConnected) returnTo.focus({ preventScroll: true });
    else (document.activeElement as HTMLElement | null)?.blur();
  }

  close.addEventListener("click", doClose);
  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  backdrop.addEventListener("pointerdown", (e) => {
    if (e.target === backdrop) doClose();
  });

  return {
    get isOpen() {
      return isOpen;
    },
    get index() {
      return index;
    },
    open(i) {
      index = i;
      fill(orderedEntries[i]);
      isOpen = true;
      backdrop.hidden = false;
      for (const b of background) b.inert = true;
      // next frame so the slide-up transition runs
      requestAnimationFrame(() => dialog.classList.add("in"));
      close.focus({ preventScroll: true });
    },
    close: doClose,
    handleKey(e) {
      if (e.key === "Escape" || e.code === "KeyE") {
        e.preventDefault();
        doClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "Tab") {
        // focus trap
        const items = Array.from(dialog.querySelectorAll<HTMLElement>("a[href], button"));
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!dialog.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
  };
}
