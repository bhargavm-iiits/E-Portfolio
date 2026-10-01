"use client";
/**
 * MISSION BRIEFING (Docs/Game §7): video 4's two-column composition in the
 * screenshot / video 5 dark material. A notched main window shows the
 * mission's live 3D diorama (a window onto the shared canvas) with real
 * controls where the project has them, or the fact-derived system diagrams;
 * a dimmer contextual panel holds the objective, tools, mechanic, challenge,
 * result and links. Dialog semantics, focus trap, inert background, Esc,
 * focus restore and deep-linkable `#mission-<slug>` hashes.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { missions, missionBySlug, type Mission } from "@/data/nexus";
import { diagrams } from "@/data/diagrams";
import { LEVEL_VELOCITY } from "@/config/world";
import { lab } from "@/lib/rig";
import { store, useNexus } from "@/lib/store";
import { director } from "@/lib/director";
import { setInert, trapFocus } from "@/lib/focusTrap";
import { useMirror, useWindow } from "@/lib/windows";
import { Icon } from "@/components/hud/Icons";
import HudFrame from "@/components/hud/HudFrame";
import Diagram from "./Diagram";

const BACKGROUND = ["#main", "#site-header", ".skip-link"];
const HASH = /^#mission-(.+)$/;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="brief-field">
      <dt className="t-meta">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function LinkList({ items }: { items: { label: string; href: string; note?: string }[] }) {
  return (
    <ul className="brief-links">
      {items.map((r) => (
        <li key={r.href}>
          <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-action">
            {r.label} <Icon.external size={13} />
            <span className="sr-only"> (GitHub, opens in a new tab)</span>
          </a>
          {r.note && <span className="brief-links__note"> — {r.note}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Live v / s / t from the 3D lab (written by PhysicsLab each frame). */
function LabReadout() {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (ref.current) ref.current.textContent = `v ${lab.v.toFixed(1)} m/s · s ${lab.s.toFixed(2)} m · t ${lab.t.toFixed(2)} s`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <p ref={ref} className="view-readout" aria-hidden="true" />;
}

function ViewControls({ m }: { m: Mission }) {
  const level = useNexus((s) => s.labLevel);
  const mode = useNexus((s) => s.cinemaMode);
  if (m.world === "lab" && m.structure) {
    return (
      <div className="view-controls">
        <p className="t-meta">LEVEL PADS · ONE PER UNITY PROJECT</p>
        <ul className="view-controls__row">
          {m.structure.map((r, i) => (
            <li key={r.href}>
              <button type="button" className="tag view-controls__btn" aria-pressed={level === i} onClick={() => store.set({ labLevel: i })}>
                L{i + 1} · {LEVEL_VELOCITY[i].toFixed(1)} m/s
                <span className="sr-only"> demo for {r.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <LabReadout />
        <p className="view-note">Straight-line demo per level (s = vt); velocities are illustrative.</p>
      </div>
    );
  }
  if (m.world === "cinema") {
    return (
      <div className="view-controls">
        <p className="t-meta">PLAYBACK MODE</p>
        <div className="view-controls__row" role="group" aria-label="Playback mode">
          {(["mono", "sbs"] as const).map((v) => (
            <button key={v} type="button" className="tag view-controls__btn" aria-pressed={mode === v} onClick={() => store.set({ cinemaMode: v })}>
              {v === "mono" ? "360° MONO" : "SBS 3D"}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function Evidence({ m }: { m: Mission }) {
  const win = useWindow("brief");
  const mirror = useMirror("brief");
  const slides = diagrams[m.slug] ?? [];
  const [tab, setTab] = useState<"3d" | number>("3d");
  const webgl = useNexus((s) => s.webgl);
  const view = webgl === "off" && slides.length ? 0 : tab;

  return (
    <div className="evidence">
      <HudFrame className="evidence__frame" cut={[22, 0, 22, 0]} inset={6} accents={["tl", "br", "top"]} dots>
        <div className="evidence__notch t-meta" aria-hidden="true">
          {view === "3d" ? "LIVE 3D · ILLUSTRATIVE" : "SYSTEM DIAGRAM"}
        </div>
        {view === "3d" ? (
          <div ref={win} className="evidence__view" role="img" aria-label={m.image.alt}>
            {webgl === "ok" && <canvas ref={mirror} className="evidence__canvas" aria-hidden="true" />}
            {webgl !== "ok" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.image.src} alt="" className="evidence__still" />
            )}
          </div>
        ) : (
          <div className="evidence__diagram">
            <Diagram slide={slides[view]} idPrefix={`${m.slug}-${view}`} />
            <p className="evidence__caption">{slides[view].caption}</p>
          </div>
        )}
      </HudFrame>
      <div className="evidence__tabs" role="group" aria-label="Evidence views">
        {webgl !== "off" && (
          <button type="button" className="tag" aria-pressed={view === "3d"} onClick={() => setTab("3d")}>
            3D VIEW
          </button>
        )}
        {slides.map((s, i) => (
          <button key={s.title} type="button" className="tag" aria-pressed={view === i} onClick={() => setTab(i)}>
            {s.title}
          </button>
        ))}
      </div>
      {view === "3d" && <ViewControls m={m} />}
    </div>
  );
}

export default function MissionBriefing() {
  const slug = useNexus((s) => s.briefing);
  const reduced = useNexus((s) => s.reduced);
  const mission = slug ? missionBySlug(slug) : undefined;
  const open = Boolean(mission);
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const closing = useRef(false);

  const close = useCallback(() => {
    const s = sheet.current;
    if (!s || reduced || closing.current) {
      store.set({ briefing: null });
      return;
    }
    closing.current = true;
    gsap.to(s, {
      opacity: 0,
      y: 18,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        closing.current = false;
        store.set({ briefing: null });
      },
    });
  }, [reduced]);

  // Hash → store (deep links, back/forward, manual edits).
  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(HASH);
      if (m && missionBySlug(m[1])) store.set({ briefing: m[1] });
      else if (!m && store.get().briefing) store.set({ briefing: null });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Store → hash (without adding history entries).
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (slug && missionBySlug(slug)) {
      if (hash !== `#mission-${slug}`) history.replaceState(null, "", `#mission-${slug}`);
    } else if (HASH.test(hash)) {
      history.replaceState(null, "", pathname + search);
    }
  }, [slug]);

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [slug]);

  // Open lifecycle: inert background, scroll lock, focus trap, entrance, focus restore.
  useEffect(() => {
    if (!open || !root.current || !sheet.current) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setInert(BACKGROUND, true);
    director.lock(true);
    document.documentElement.setAttribute("data-briefing", "open");
    const release = trapFocus(root.current);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    root.current.querySelector<HTMLElement>("#briefing-title")?.focus({ preventScroll: true });
    gsap.fromTo(sheet.current, { opacity: 0, y: reduced ? 0 : 22 }, { opacity: 1, y: 0, duration: reduced ? 0.2 : 0.42, ease: "power3.out" });
    return () => {
      release();
      document.removeEventListener("keydown", onKey);
      setInert(BACKGROUND, false);
      director.lock(false);
      document.documentElement.removeAttribute("data-briefing");
      const target = returnFocus.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [open, close, reduced]);

  if (!mission) return null;
  const m = mission;
  const i = missions.findIndex((x) => x.slug === m.slug);
  const prev = missions[(i - 1 + missions.length) % missions.length];
  const next = missions[(i + 1) % missions.length];

  return (
    <div ref={root} className="briefing" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
      <div ref={sheet} className="briefing__sheet">
        <div ref={body} className="briefing__scroll" data-lenis-prevent>
          <header className="briefing__head">
            <div>
              <p className="t-meta">
                MISSION // {m.code} <span className="briefing__tag">{m.tag}</span>
              </p>
              <h2 id="briefing-title" tabIndex={-1} className="briefing__title">
                {m.title}
              </h2>
            </div>
            <button type="button" className="plate plate--outline plate--sm" onClick={close}>
              <Icon.close size={14} /> CLOSE
            </button>
          </header>

          <div className="briefing__grid">
            <Evidence key={m.slug} m={m} />
            <HudFrame as="aside" className="brief-context" cut={[0, 18, 0, 18]} inset={0} aria-label="Mission details">
              <dl className="brief-fields">
                {m.objective && <Field label="OBJECTIVE">{m.objective}</Field>}
                <Field label="TOOLS">
                  <ul className="brief-chips">
                    {m.system.map((s) => (
                      <li key={s} className="tag">
                        {s}
                      </li>
                    ))}
                  </ul>
                </Field>
                {m.coreMechanic && <Field label="CORE INTERACTION">{m.coreMechanic}</Field>}
                {m.challenge && <Field label="CHALLENGE">{m.challenge}</Field>}
                {m.result && <Field label="RESULT">{m.result}</Field>}
                {m.structure && (
                  <Field label="STRUCTURE">
                    <LinkList items={m.structure} />
                  </Field>
                )}
                {m.context && <Field label="CONTEXT">{m.context}</Field>}
                {m.related && (
                  <Field label="RELATED">
                    <LinkList items={m.related} />
                  </Field>
                )}
              </dl>
              <ul className="brief-hud" aria-label="System readout">
                {m.hud.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </HudFrame>
          </div>

          <footer className="briefing__foot">
            <div className="briefing__actions">
              {m.live && (
                <a href={m.live} target="_blank" rel="noopener noreferrer" className="plate plate--primary plate--sm">
                  LAUNCH DEMO <Icon.external size={14} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {m.source && (
                <a href={m.source} target="_blank" rel="noopener noreferrer" className="plate plate--outline plate--sm">
                  VIEW SOURCE <Icon.github size={14} />
                  <span className="sr-only"> (GitHub, opens in a new tab)</span>
                </a>
              )}
            </div>
            {missions.length > 1 && (
              <nav className="briefing__pager" aria-label="Other missions">
                <button type="button" className="text-action" onClick={() => store.set({ briefing: prev.slug })}>
                  <Icon.arrowLeft size={16} /> M{prev.code.slice(-2)} {prev.title}
                </button>
                <button type="button" className="text-action" onClick={() => store.set({ briefing: next.slug })}>
                  M{next.code.slice(-2)} {next.title} <Icon.arrowRight size={16} />
                </button>
              </nav>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
