// Contact links derived from content.ts, shared by the lectern and the list view.

import { contact } from "./content";
import type { ContactIcon } from "./sprites";

export interface ContactItem {
  id: ContactIcon;
  label: string;
  href: string;
  dest: string; // short destination text shown under the highlighted icon
}

export const prettyUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const contactItems: ContactItem[] = [
  { id: "email", label: "Email", href: `mailto:${contact.email}`, dest: contact.email },
  { id: "linkedin", label: "LinkedIn", href: contact.linkedin, dest: prettyUrl(contact.linkedin) },
  { id: "github", label: "GitHub", href: contact.github, dest: prettyUrl(contact.github) },
  { id: "resume", label: "Resume", href: contact.resume, dest: "Resume (PDF)" },
];
