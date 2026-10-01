"use client";
import type { MouseEvent } from "react";
import { director } from "./director";
import { store } from "./store";

/** In-page links go through the director (smooth scroll below the header + focus). */
export function onNavClick(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  store.set({ menuOpen: false });
  director.navigate(href, { focus: true });
}

export function openBriefing(slug: string) {
  store.set({ briefing: slug });
}

/** Bring a side build into view and highlight it. */
export function openQuest(id: string) {
  window.dispatchEvent(new CustomEvent("nexus:quest", { detail: id }));
}
