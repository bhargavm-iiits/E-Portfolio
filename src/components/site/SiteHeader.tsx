"use client";
/**
 * Header (screenshot §3): the angular BM // NEXUS plate, a thin technical rail
 * running from the plate's diagonal joint to the GitHub control, tracked
 * navigation etched into it, and an outlined, chamfered GITHUB ↗. Fixed; it
 * gains a dark backdrop once the page scrolls. Small icon toggles (sound,
 * reduce motion) sit beside GitHub; phones get a menu.
 */
import { useEffect, useRef, useState } from "react";
import { SECTIONS, links } from "@/config/site";
import { store, useNexus } from "@/lib/store";
import { director } from "@/lib/director";
import { sound } from "@/lib/sound";
import { onNavClick } from "@/lib/nav";
import { trapFocus } from "@/lib/focusTrap";
import { Icon } from "@/components/hud/Icons";
import { Monogram } from "@/components/hud/HudFrame";

export function setManualMotion(reduced: boolean) {
  try {
    localStorage.setItem("nexus-motion", reduced ? "reduced" : "full");
  } catch {
    /* storage unavailable: the toggle still applies for this visit */
  }
  store.set({ reducedManual: reduced });
}

function Toggles() {
  const soundOn = useNexus((s) => s.sound);
  const reduced = useNexus((s) => s.reduced);
  return (
    <div className="site-toggles">
      <button
        type="button"
        className="icon-btn"
        aria-pressed={soundOn}
        aria-label="Interface sound"
        title={soundOn ? "Sound on" : "Sound off"}
        onClick={async () => {
          if (soundOn) {
            sound.disable();
            store.set({ sound: false });
          } else {
            await sound.enable();
            store.set({ sound: sound.isEnabled });
          }
        }}
      >
        {soundOn ? <Icon.sound size={16} /> : <Icon.mute size={16} />}
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-pressed={reduced}
        aria-label="Reduce motion"
        title="Reduce motion"
        onClick={() => setManualMotion(!reduced)}
      >
        <Icon.motion size={16} />
      </button>
    </div>
  );
}

/** The plate outline: irregular polygon, short upper-right diagonal, long lower-right diagonal. */
function PlateFrame() {
  return (
    <svg className="brand-plate__frame" viewBox="0 0 240 52" preserveAspectRatio="none" aria-hidden="true">
      <path className="brand-plate__fill" d="M 6 1 H 214 L 236 18 L 210 51 H 14 L 1 40 V 6 Z" />
      <path className="brand-plate__line" d="M 6 1 H 214 L 236 18 L 210 51 H 14 L 1 40 V 6 Z" />
      <path className="brand-plate__accent" d="M 1 26 V 6 L 6 1 H 40" />
      <path className="brand-plate__accent" d="M 120 51 H 210 L 220 38" />
    </svg>
  );
}

export function MobileMenu() {
  const open = useNexus((s) => s.menuOpen);
  const active = useNexus((s) => s.active);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    const release = trapFocus(ref.current);
    ref.current.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        store.set({ menuOpen: false });
        document.getElementById("menu-button")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      release();
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div id="mobile-menu" ref={ref} className="mobile-menu" data-open={open} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
      <nav aria-label="Sections">
        <ol>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={onNavClick} aria-current={active === s.id ? "true" : undefined}>
                <span className="mobile-menu__code">{s.code}</span>
                <span className="mobile-menu__label">{s.label}</span>
              </a>
            </li>
          ))}
          <li>
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              <span className="mobile-menu__code">↗</span>
              <span className="mobile-menu__label">GITHUB</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ol>
      </nav>
      <div className="mobile-menu__foot">
        <Toggles />
        <button type="button" className="plate plate--outline plate--sm" onClick={() => store.set({ menuOpen: false })}>
          CLOSE <Icon.close size={14} />
        </button>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const active = useNexus((s) => s.active);
  const entry = useNexus((s) => s.entry);
  const menuOpen = useNexus((s) => s.menuOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const playing = entry !== "idle" && entry !== "arrived";

  return (
    <header id="site-header" className="site-header" data-scrolled={scrolled}>
      <a href="#world" className="brand-plate" onClick={onNavClick} aria-label="BM // NEXUS: Bhargav M, back to the world entry">
        <PlateFrame />
        <Monogram size={26} />
        <span className="brand-plate__divider" aria-hidden="true" />
        <span className="brand-plate__word" aria-hidden="true">
          NEXUS
        </span>
      </a>

      <svg className="site-rail" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 0 2 H 1000" />
        <path className="site-rail__faint" d="M 40 38 H 1000" />
      </svg>

      <nav aria-label="Primary" className="site-nav">
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="site-nav__link" onClick={onNavClick} aria-current={active === s.id ? "true" : undefined}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="site-actions">
        {playing && (
          <button type="button" className="plate plate--outline plate--sm" onClick={() => director.skipEntry()}>
            SKIP <span className="sr-only">the entry sequence</span>
          </button>
        )}
        <Toggles />
        <a href={links.github} className="github-plate" target="_blank" rel="noopener noreferrer">
          <span>GITHUB</span>
          <Icon.external size={14} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <button
          id="menu-button"
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => store.set({ menuOpen: !menuOpen })}
        >
          <Icon.menu size={18} />
          <span>MENU</span>
        </button>
      </div>
    </header>
  );
}
