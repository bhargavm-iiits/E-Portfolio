"use client";
/**
 * 01 WORLD ENTRY (screenshot §4). Copy on the dark left half; the 3D world
 * (portal machinery, the city through its aperture, the explorer on the
 * ledge) renders through this section as a window. A poster frame of the same
 * scene covers first paint, phones before the stage loads, and no-WebGL.
 */
import { hero } from "@/data/nexus";
import { director } from "@/lib/director";
import { onNavClick } from "@/lib/nav";
import { useWindow } from "@/lib/windows";
import { Icon } from "@/components/hud/Icons";

function Chevrons() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true" className="hero-hud__chev">
      <path d="M2 1 L8 6 L14 1 M2 7 L8 12 L14 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Hero() {
  const win = useWindow("hero");
  return (
    <section id="world" ref={win} className="hero" data-section="world" aria-labelledby="hero-title">
      <div className="hero__poster" aria-hidden="true">
        <picture>
          <source media="(min-width: 768px)" srcSet="/nexus/entry-poster.webp" />
          <img src="/nexus/entry-poster-sm.webp" alt="" width={720} height={1280} fetchPriority="high" />
        </picture>
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div id="hero-copy" className="hero__copy">
        <p className="hero__eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__name">{hero.name}</span>
          <span className="hero__statement">{hero.statement}</span>
        </h1>
        <p className="hero__desc">{hero.description}</p>
        <div className="hero__ctas">
          <button id="enter-cta" type="button" className="plate plate--primary" onClick={() => director.playEntry()}>
            ENTER THE NEXUS <Icon.chevron size={16} />
          </button>
          <a href="#missions" className="plate plate--outline" onClick={onNavClick}>
            VIEW MISSIONS
          </a>
        </div>
      </div>

      <div id="hero-hud" className="hero-hud">
        <svg className="hero-hud__rails" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path className="hero-hud__rail" d="M 0 2 H 700 L 712 12 H 1000" />
          <path className="hero-hud__rail" d="M 0 38 H 640 L 652 30 H 1000" />
        </svg>
        <p className="hero-hud__label" aria-hidden="true">
          <span className="hero-hud__code">01</span> / WORLD ENTRY
        </p>
        <span className="hero-hud__line" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <a href="#missions" className="hero-hud__scroll" onClick={onNavClick}>
          SCROLL TO EXPLORE <Chevrons />
        </a>
      </div>
    </section>
  );
}
