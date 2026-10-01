/** Renders a fact-derived system diagram with HUD callouts pinned to it. */
import type { DiagramSlide } from "@/data/diagrams";

const H = 40;

export default function Diagram({ slide, idPrefix }: { slide: DiagramSlide; idPrefix: string }) {
  const byId = new Map(slide.nodes.map((n) => [n.id, n]));
  const markerCyan = `${idPrefix}-arrow-c`;
  const markerAmber = `${idPrefix}-arrow-a`;
  return (
    <figure className="diagram">
      <svg viewBox="0 0 640 360" role="img" aria-label={`${slide.title}: ${slide.caption}`}>
        <defs>
          <marker id={markerCyan} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="diagram__arrow" />
          </marker>
          <marker id={markerAmber} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="diagram__arrow diagram__arrow--amber" />
          </marker>
        </defs>
        <g className="diagram__grid">
          {Array.from({ length: 15 }, (_, i) => (
            <line key={`v${i}`} x1={i * 45 + 5} y1="0" x2={i * 45 + 5} y2="360" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 48 + 12} x2="640" y2={i * 48 + 12} />
          ))}
        </g>
        {slide.edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const aw = a.w ?? 150;
          const bw = b.w ?? 150;
          let d: string;
          if (b.x >= a.x + aw - 4) {
            const x1 = a.x + aw;
            const y1 = a.y + H / 2;
            const x2 = b.x - 2;
            const y2 = b.y + H / 2;
            const mx = (x1 + x2) / 2;
            d = `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
          } else if (a.x >= b.x + bw - 4) {
            const x1 = a.x;
            const y1 = a.y + H / 2;
            const x2 = b.x + bw + 2;
            const y2 = b.y + H / 2;
            const mx = (x1 + x2) / 2;
            d = `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
          } else {
            const down = b.y > a.y;
            const x1 = a.x + aw / 2;
            const y1 = down ? a.y + H : a.y;
            const x2 = b.x + bw / 2;
            const y2 = down ? b.y - 2 : b.y + H + 2;
            const my = (y1 + y2) / 2;
            d = `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
          }
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={d}
              className="diagram__edge"
              data-tone={e.tone ?? "cyan"}
              data-dashed={e.dashed ? "true" : "false"}
              markerEnd={`url(#${e.tone === "amber" ? markerAmber : markerCyan})`}
            />
          );
        })}
        {slide.nodes.map((n) => (
          <g key={n.id} className="diagram__node" data-tone={n.tone ?? "cyan"} transform={`translate(${n.x} ${n.y})`}>
            <path d={`M8 0 H${(n.w ?? 150)} V${H - 8} L${(n.w ?? 150) - 8} ${H} H0 V8 Z`} />
            <text x={(n.w ?? 150) / 2} y={H / 2 + 4.5} textAnchor="middle">
              {n.label}
            </text>
          </g>
        ))}
        {slide.callouts?.map((c) => (
          <g key={c.label} className="diagram__callout" transform={`translate(${c.x} ${c.y})`}>
            <circle r="3" />
            <path d="M0 0 L14 -14 H24" />
            <text x="28" y="-10">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>{slide.caption}</figcaption>
    </figure>
  );
}
