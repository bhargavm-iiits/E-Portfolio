"use client";
/**
 * 03 ABILITY TREE (screenshot §6): a Unity-centred cross, not a carousel or
 * percentage bars. Unity is the largest layered hexagon; C# above, AR
 * Foundation left, PyTorch (AI, violet) right, RAG below — joined by stepped
 * connectors with junction dots over faint oversized hexagons. Selecting a
 * node lights its route and explains its role with the evidence that uses it.
 * The rest of the kit is listed below; narrow screens get a linear list.
 */
import type { CSSProperties } from "react";
import { abilities, abilityById, abilityCross, abilityKit, type Ability, type Evidence } from "@/data/nexus";
import { BRAND_PATHS } from "@/data/brandIcons";
import { store, useNexus } from "@/lib/store";
import { director } from "@/lib/director";
import { openBriefing, openQuest } from "@/lib/nav";
import HudFrame from "@/components/hud/HudFrame";

type Slot = keyof typeof abilityCross;
const POS: Record<Slot, [number, number]> = {
  core: [50, 53],
  top: [50, 9],
  left: [21, 44],
  right: [79, 44],
  bottom: [50, 87],
};
/**
 * Stepped routes into the core (viewBox 0–100), drawn centre to centre behind
 * the opaque hexagons, so only the run between them shows. The top node's
 * label fills the gap above the core (as in the reference), so it has no line.
 */
const ROUTES: Partial<Record<Exclude<Slot, "core">, string>> = {
  bottom: "M 50 53 V 87",
  left: "M 21 44 H 33 L 37.5 53 H 50",
  right: "M 79 44 H 67 L 62.5 53 H 50",
};
const JOINTS: Partial<Record<Exclude<Slot, "core">, [number, number][]>> = {
  bottom: [[50, 73.5]],
  left: [[33, 44], [37.5, 53]],
  right: [[67, 44], [62.5, 53]],
};

/** Official marks where they exist; labelled glyphs where they don't (C#, AR Foundation, RAG, LoRA). */
export function AbilityMark({ ability, size = 30 }: { ability: Ability; size?: number }) {
  const brand = ability.mark in BRAND_PATHS ? BRAND_PATHS[ability.mark as keyof typeof BRAND_PATHS] : null;
  if (brand) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="ability-mark">
        <path d={brand} fill="currentColor" />
      </svg>
    );
  }
  switch (ability.mark) {
    case "csharp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="ability-mark">
          <path d="M12 1.8 21 7v10l-9 5.2L3 17V7z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <text x="12" y="15.6" textAnchor="middle" fontSize="8.6" fontWeight="700" fill="currentColor" fontFamily="var(--font-h)">
            C#
          </text>
        </svg>
      );
    case "arf":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="ability-mark" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z" />
          <path d="M4 7.5 12 12l8-4.5M12 12v9" />
          <path d="M8.5 5.6v3.9l3.5 2M15.5 5.6v3.9" opacity="0.6" />
        </svg>
      );
    case "rag":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="ability-mark" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M6 2.8h8.5L19 7.3V21H6z" />
          <path d="M14.5 2.8v4.5H19M9 11h7M9 14h7M9 17h4.5" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="ability-mark">
          <text x="12" y="15" textAnchor="middle" fontSize="7.4" fontWeight="700" fill="currentColor" fontFamily="var(--font-h)">
            {ability.label.slice(0, 4)}
          </text>
        </svg>
      );
  }
}

function go(ev: Evidence) {
  if (ev.kind === "mission") openBriefing(ev.slug);
  else if (ev.kind === "quest") {
    director.navigate("#missions");
    window.setTimeout(() => openQuest(ev.id), 500);
  } else director.navigate("#log", { focus: true });
}

function Node({ slot, ability, selected }: { slot: Slot; ability: Ability; selected: boolean }) {
  const [x, y] = POS[slot];
  const core = slot === "core";
  return (
    <button
      type="button"
      className={`xnode${core ? " xnode--core" : ""}`}
      data-tone={ability.tone}
      data-selected={selected}
      aria-pressed={selected}
      style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
      onClick={() => store.set({ ability: ability.id })}
      onFocus={() => store.set({ ability: ability.id })}
    >
      <span className="xnode__hex" aria-hidden="true">
        <svg viewBox="0 0 100 115" className="xnode__frame">
          <path className="xnode__outer" d="M50 2 98 29.5v56L50 113 2 85.5v-56z" />
          {core && <path className="xnode__inner" d="M50 12 89 34.5v46L50 103 11 80.5v-46z" />}
        </svg>
        <AbilityMark ability={ability} size={core ? 40 : 30} />
        {core && <span className="xnode__core-label">{ability.label}</span>}
      </span>
      {!core && (
        <span className="xnode__text">
          <span className="xnode__label">{ability.label}</span>
          <span className="xnode__role">{ability.role}</span>
        </span>
      )}
      {core && <span className="sr-only">: {ability.role}</span>}
    </button>
  );
}

export default function AbilityTree() {
  const selectedId = useNexus((s) => s.ability);
  const selected = abilityById(selectedId) ?? abilities[0];
  const slotOf = (id: string) => (Object.keys(abilityCross) as Slot[]).find((k) => abilityCross[k] === id);
  const selSlot = slotOf(selected.id);

  return (
    <section id="abilities" className="lower__cell" data-section="abilities" aria-labelledby="abilities-title">
      <HudFrame className="panel panel--abilities" cut={[0, 22, 0, 22]} inset={6} accents={["tl", "br", "bottom"]} dots>
        <header className="panel__head">
          <h2 id="abilities-title" className="t-heading" tabIndex={-1} data-reveal="type">
            ABILITY TREE
          </h2>
          <p className="t-meta">TOOLS. TECHNOLOGIES. SUPERPOWERS.</p>
        </header>

        <div className="cross" role="group" aria-label="Core capabilities">
          <svg className="cross__field" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M50 18 72 31v26L50 70 28 57V31z" />
            <path d="M22 30 40 40.5v21L22 72 4 61.5v-21z" />
            <path d="M78 30 96 40.5v21L78 72 60 61.5v-21z" />
            <path d="M50 64 66 73.5v19L50 102 34 92.5v-19z" />
          </svg>
          <svg className="cross__routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {(Object.keys(ROUTES) as (keyof typeof ROUTES)[]).map((k) => (
              <path key={k} className="cross__route" data-on={selSlot === k || selSlot === "core"} d={ROUTES[k]} />
            ))}
          </svg>
          {(Object.keys(JOINTS) as (keyof typeof JOINTS)[]).flatMap((k) =>
            (JOINTS[k] ?? []).map(([x, y], i) => (
              <span
                key={`${k}-${i}`}
                className="cross__joint"
                data-on={selSlot === k || selSlot === "core"}
                style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
                aria-hidden="true"
              />
            ))
          )}
          {(Object.keys(abilityCross) as Slot[]).map((slot) => {
            const a = abilityById(abilityCross[slot]);
            return a ? <Node key={slot} slot={slot} ability={a} selected={a.id === selected.id} /> : null;
          })}
        </div>

        <div className="ability-info" aria-live="polite">
          <p className="ability-info__head">
            <span className="t-meta">SELECTED //</span> <strong>{selected.label}</strong> <span className="t-meta">{selected.role}</span>
          </p>
          <p className="ability-info__blurb">{selected.blurb}</p>
          {selected.usedIn.length > 0 && (
            <div className="ability-info__used">
              <span className="t-meta">USED IN →</span>
              <ul>
                {selected.usedIn.map((ev) => (
                  <li key={`${ev.kind}-${ev.label}`}>
                    <button type="button" className="tag ability-info__ev" onClick={() => go(ev)}>
                      {ev.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="kit">
          <p className="t-meta kit__title">ALSO IN THE KIT</p>
          <ul className="kit__list">
            {abilityKit.map((a) => (
              <li key={a.id}>
                <button type="button" className="kit__chip" data-tone={a.tone} aria-pressed={a.id === selected.id} onClick={() => store.set({ ability: a.id })}>
                  <AbilityMark ability={a} size={16} />
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </HudFrame>
    </section>
  );
}
