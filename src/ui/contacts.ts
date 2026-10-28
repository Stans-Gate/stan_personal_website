// Real links laid over the floating contact icons, so they work with mouse,
// touch, keyboard and screen readers. The canvas draws the art underneath.

import { contact } from "../content";
import { contactItems } from "../links";

export interface ContactsUI {
  show(focus: boolean): void;
  hide(): void;
  place(i: number, x: number, y: number, size: number): void;
  placeLabel(x: number, y: number): void;
  step(dir: number): void;
  activate(): void;
}

export function createContactsUI(onSelect: (i: number) => void): ContactsUI {
  const root = document.getElementById("contacts")!;
  const label = document.createElement("div");
  label.className = "contact-label";
  label.setAttribute("aria-live", "polite");
  let selected = 0;
  let copied = false;

  const select = (i: number) => {
    selected = i;
    copied = false;
    label.textContent = contactItems[i].dest;
    onSelect(i);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = contact.email;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    copied = true;
    label.textContent = "Copied! ";
    const mail = document.createElement("a");
    mail.href = `mailto:${contact.email}`;
    mail.textContent = "Open mail app";
    label.append(mail);
  };

  const links = contactItems.map((item, i) => {
    const a = document.createElement("a");
    a.className = "contact";
    a.href = item.href;
    if (item.id !== "email") {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    a.setAttribute("aria-label", `${item.label}: ${item.dest}`);
    a.addEventListener("focus", () => select(i));
    a.addEventListener("pointerenter", () => select(i));
    if (item.id === "email") {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        void copyEmail();
      });
    }
    root.append(a);
    return a;
  });
  root.append(label);

  return {
    show(focus) {
      root.hidden = false;
      select(selected);
      if (focus) links[selected].focus({ preventScroll: true });
    },
    hide() {
      if (root.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
      root.hidden = true;
    },
    place(i, x, y, size) {
      const s = links[i].style;
      s.left = `${x - size / 2}px`;
      s.top = `${y - size / 2}px`;
      s.width = s.height = `${size}px`;
    },
    placeLabel(x, y) {
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
    },
    step(dir) {
      const n = links.length;
      select((selected + dir + n) % n);
      links[selected].focus({ preventScroll: true });
    },
    activate() {
      if (selected === 0 && copied) window.location.href = contactItems[0].href;
      else links[selected].click();
    },
  };
}
