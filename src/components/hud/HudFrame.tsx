"use client";
/**
 * The screenshot's frame grammar as one measured SVG layer: a thin outer
 * stroke with true 45° chamfers (fixed pixel sizes at any element size), an
 * inset stroke, short bright edge accents and small junction dots. The panel
 * fill is drawn by the same path, so the frame and the surface never drift.
 */
import { useLayoutEffect, useRef, useState, type ComponentType, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode, type Ref } from "react";

type Corner = "tl" | "tr" | "br" | "bl";
export type Accent = Corner | "top" | "bottom" | "left" | "right";

interface HudFrameProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** Chamfer per corner in px: [tl, tr, br, bl]. */
  cut?: [number, number, number, number];
  /** Inset stroke offset in px (0 = none). */
  inset?: number;
  /** Where the short bright accent segments sit. */
  accents?: Accent[];
  /** Junction dots at the chamfer vertices. */
  dots?: boolean;
  children?: ReactNode;
}

function outline(w: number, h: number, c: [number, number, number, number], o = 0) {
  const [tl, tr, br, bl] = c.map((v) => Math.max(0, v - o * 0.41));
  const x0 = o;
  const y0 = o;
  const x1 = w - o;
  const y1 = h - o;
  return [
    `M ${x0 + tl} ${y0}`,
    `L ${x1 - tr} ${y0}`,
    `L ${x1} ${y0 + tr}`,
    `L ${x1} ${y1 - br}`,
    `L ${x1 - br} ${y1}`,
    `L ${x0 + bl} ${y1}`,
    `L ${x0} ${y1 - bl}`,
    `L ${x0} ${y0 + tl}`,
    "Z",
  ].join(" ");
}

function accentPath(a: Accent, w: number, h: number, c: [number, number, number, number]) {
  const [tl, tr, br, bl] = c;
  const run = Math.min(64, w * 0.18);
  switch (a) {
    case "tl":
      return `M ${tl + run} 0 L ${tl} 0 L 0 ${tl} L 0 ${tl + run * 0.5}`;
    case "tr":
      return `M ${w - tr - run} 0 L ${w - tr} 0 L ${w} ${tr} L ${w} ${tr + run * 0.5}`;
    case "br":
      return `M ${w} ${h - br - run * 0.5} L ${w} ${h - br} L ${w - br} ${h} L ${w - br - run} ${h}`;
    case "bl":
      return `M 0 ${h - bl - run * 0.5} L 0 ${h - bl} L ${bl} ${h} L ${bl + run} ${h}`;
    case "top":
      return `M ${w * 0.5 - run} 0 L ${w * 0.5 + run} 0`;
    case "bottom":
      return `M ${w * 0.5 - run} ${h} L ${w * 0.5 + run} ${h}`;
    case "left":
      return `M 0 ${h * 0.5 - run * 0.6} L 0 ${h * 0.5 + run * 0.6}`;
    case "right":
      return `M ${w} ${h * 0.5 - run * 0.6} L ${w} ${h * 0.5 + run * 0.6}`;
  }
}

export default function HudFrame({
  as: Tag = "div",
  cut = [0, 14, 0, 14],
  inset = 0,
  accents = [],
  dots = false,
  className,
  children,
  ...rest
}: HudFrameProps) {
  const Comp = Tag as ComponentType<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState<[number, number] | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      setSize((s) => (s && s[0] === w && s[1] === h ? s : [w, h]));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [w, h] = size ?? [0, 0];
  const vertices: [number, number][] = [];
  if (size) {
    const [tl, tr, br, bl] = cut;
    if (tl) vertices.push([tl, 0], [0, tl]);
    if (tr) vertices.push([w - tr, 0], [w, tr]);
    if (br) vertices.push([w, h - br], [w - br, h]);
    if (bl) vertices.push([bl, h], [0, h - bl]);
  }

  return (
    <Comp ref={ref} className={`hud-frame${className ? ` ${className}` : ""}`} {...rest}>
      {size && w > 0 && (
        <svg className="hud-frame__svg" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
          <path className="hud-frame__fill" d={outline(w, h, cut, 0.5)} />
          <path className="hud-frame__outer" d={outline(w, h, cut, 0.5)} />
          {inset > 0 && <path className="hud-frame__inner" d={outline(w, h, cut, inset)} />}
          {accents.map((a) => (
            <path key={a} className="hud-frame__accent" d={accentPath(a, w, h, cut)} />
          ))}
          {dots && vertices.map(([x, y], i) => <circle key={i} className="hud-frame__dot" cx={x} cy={y} r={1.6} />)}
        </svg>
      )}
      {children}
    </Comp>
  );
}

/** Section heading row: tracked title, a fine divider with a diagonal jog, right-aligned subtitle. */
export function RailHead({
  id,
  title,
  sub,
  level = 2,
  style,
}: {
  id: string;
  title: string;
  sub: string;
  level?: 2 | 3;
  style?: CSSProperties;
}) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className="rail-head" style={style}>
      <H id={id} className="t-heading" tabIndex={-1} data-reveal="type">
        {title}
      </H>
      <svg className="rail-head__line" viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 0 4 H 150 L 162 14 H 400" />
      </svg>
      <p className="rail-head__sub t-meta">{sub}</p>
    </div>
  );
}

/** The BM monogram: angular B and M (vector, cyan). */
export function Monogram({ size = 34 }: { size?: number }) {
  return (
    <svg width={size * 1.25} height={size} viewBox="0 0 50 40" aria-hidden="true" className="monogram">
      <path
        d="M3 4 H17 L22 9 V15 L19 19 L23 23 V31 L17 36 H3 Z M9 10 V16 H15 L16 15 V11 L15 10 Z M9 22 V30 H16 L17 29 V23 L16 22 Z"
        fillRule="evenodd"
      />
      <path d="M26 36 V4 H31 L37 14 L43 4 H48 V36 H42 V16 L37 24 L32 16 V36 Z" />
    </svg>
  );
}
