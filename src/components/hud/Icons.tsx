/** Tree-shaken inline line icons (no icon CDN). 1.5px strokes, currentColor. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  cube: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 2.8 20 7.2v9.6L12 21.2 4 16.8V7.2z" />
      <path d="M4 7.2 12 11.6l8-4.4M12 11.6v9.6" />
    </Svg>
  ),
  ar: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M12 7.5 16 9.8v4.4L12 16.5 8 14.2V9.8z" />
    </Svg>
  ),
  headset: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3.5 9.5A2.5 2.5 0 0 1 6 7h12a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 18 17h-2.6a2 2 0 0 1-1.7-1l-.6-1a1.3 1.3 0 0 0-2.2 0l-.6 1a2 2 0 0 1-1.7 1H6a2.5 2.5 0 0 1-2.5-2.5z" />
      <path d="M1.5 11v2M22.5 11v2" />
    </Svg>
  ),
  orbit: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-25 12 12)" />
    </Svg>
  ),
  arrowRight: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  chevron: (p: IconProps) => (
    <Svg {...p} strokeWidth={2}>
      <path d="M9 5l7 7-7 7" />
    </Svg>
  ),
  cap: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2.5 9 12 4.5 21.5 9 12 13.5z" />
      <path d="M6.5 11v4.2c0 1.3 2.5 2.8 5.5 2.8s5.5-1.5 5.5-2.8V11M21.5 9v5" />
    </Svg>
  ),
  briefcase: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="7" width="18" height="12.5" rx="1.5" />
      <path d="M9 7V5.2C9 4.5 9.5 4 10.2 4h3.6c.7 0 1.2.5 1.2 1.2V7M3 12.5h18M10.5 12.5v1.6h3v-1.6" />
    </Svg>
  ),
  trophy: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5z" />
    </Svg>
  ),
  arrowLeft: (p: IconProps) => (
    <Svg {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  ),
  external: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 17 17 7M9 7h8v8" />
    </Svg>
  ),
  mouse: (p: IconProps) => (
    <Svg {...p}>
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <path d="M12 7v3" />
    </Svg>
  ),
  mail: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </Svg>
  ),
  github: (p: IconProps) => (
    <Svg {...p}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </Svg>
  ),
  linkedin: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M7.5 10v6.5M7.5 7.3v.2M11.5 16.5V10M11.5 12.8c0-1.6 1.2-2.8 2.7-2.8s2.3 1.1 2.3 2.8v3.7" />
    </Svg>
  ),
  globe: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Svg>
  ),
  sound: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </Svg>
  ),
  mute: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </Svg>
  ),
  motion: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 12h4M5 8h6M5 16h6" />
      <circle cx="16.5" cy="12" r="4.5" />
    </Svg>
  ),
  close: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  ),
  replay: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.7" />
      <path d="M4 4v4.7h4.7" />
    </Svg>
  ),
  lock: (p: IconProps) => (
    <Svg {...p}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Svg>
  ),
  target: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </Svg>
  ),
  copy: (p: IconProps) => (
    <Svg {...p}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Svg>
  ),
  menu: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </Svg>
  ),
};

/** Hex emblem with the BM monogram. */
export function HexEmblem({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hexg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#54A8E6" />
          <stop offset="1" stopColor="#845EF5" />
        </linearGradient>
      </defs>
      <path d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5z" fill="rgba(12,20,40,.6)" stroke="url(#hexg)" strokeWidth="1.6" />
      <text x="20" y="24.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#F5F8FF" fontFamily="var(--font-hud), sans-serif" letterSpacing=".5">
        BM
      </text>
    </svg>
  );
}
