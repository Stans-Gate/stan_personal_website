// Renders the list view as static HTML from content.ts. Used at build time by
// vite.config.ts, so the list works with no JavaScript and is what search
// engines index. Must stay free of DOM APIs.

import { categories, contact, entries, linkLabels, owner, type CategoryId, type EntryLinks } from "./content.ts";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const pretty = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const ext = (href: string, label: string) =>
  `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;

export function renderList(): string {
  const sections = (Object.keys(categories) as CategoryId[])
    .map((id) => {
      const group = entries.filter((e) => e.category === id);
      if (!group.length) return "";
      const cat = categories[id];
      const items = group
        .map((e) => {
          const meta = e.org ? [e.org, e.dates].filter(Boolean).join(" · ") : e.year ? String(e.year) : "";
          const links = (Object.keys(e.links) as (keyof EntryLinks)[])
            .map((k) => `<li>${ext(e.links[k]!, linkLabels[k])}</li>`)
            .join("");
          return `<article class="entry" id="${esc(e.id)}">
  <h3>${esc(e.title)}</h3>
  ${meta ? `<p class="meta">${esc(meta)}</p>` : ""}
  ${e.pitch ? `<p>${esc(e.pitch)}</p>` : ""}
  <ul class="highlights">${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
  <ul class="tags" aria-label="Tech stack">${e.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
  ${e.note ? `<p class="note">${esc(e.note)}</p>` : ""}
  ${links ? `<ul class="links">${links}</ul>` : ""}
</article>`;
        })
        .join("\n");
      return `<section style="--glow:${cat.glow}" aria-labelledby="h-${id}">
<h2 id="h-${id}">${esc(cat.label)}</h2>
${items}
</section>`;
    })
    .join("\n");

  return `${sections}
<section style="--glow:#e6edf3" aria-labelledby="h-contact">
<h2 id="h-contact">Contact</h2>
<ul class="contact-list">
  <li>Email: <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>
  <li>LinkedIn: ${ext(contact.linkedin, pretty(contact.linkedin))}</li>
  <li>GitHub: ${ext(contact.github, pretty(contact.github))}</li>
  <li>Resume: ${ext(contact.resume, "Open PDF")}</li>
</ul>
</section>`;
}

export const pageTokens = (): Record<string, string> => ({
  "{{name}}": esc(owner.name),
  "{{title}}": esc(owner.title),
  "{{blurb}}": esc(owner.blurb),
  "{{url}}": esc(owner.url),
  "{{list}}": renderList(),
});
