import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Chakra_Petch, Inter, Michroma, Oxanium, Saira, Share_Tech_Mono, Sora } from "next/font/google";
import { SITE_URL } from "@/config/site";
import "./globals.css";
import "@/nexus/nexus.css";
import "@/nexus/chapters.css";

/**
 * Type roles (MASTER-PROMPT §3.6, matched against KF22 — Docs/plan/renders/font-match-KF22.jpg):
 * display IMMERSIVE = Saira Expanded, WORLDS = Michroma; identity = Oxanium 800;
 * HUD / labels = Chakra Petch; body = Inter; micro data = Share Tech Mono; card titles = Sora.
 */
const chakra = Chakra_Petch({ variable: "--f-chakra", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const inter = Inter({ variable: "--f-inter", subsets: ["latin"], weight: ["400", "500"], display: "swap" });
const michroma = Michroma({ variable: "--f-michroma", subsets: ["latin"], weight: "400", display: "swap" });
const oxanium = Oxanium({ variable: "--f-oxanium", subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });
const saira = Saira({ variable: "--f-saira", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const mono = Share_Tech_Mono({ variable: "--f-mono", subsets: ["latin"], weight: "400", display: "swap" });
const sora = Sora({ variable: "--f-sora", subsets: ["latin"], weight: ["500", "600"], display: "swap" });

const title = "Bhargav M // NEXUS — Unity · AR/VR · AI Engineering";
const description =
  "BHARGAV M builds playable worlds: Unity, AR/VR and AI engineering. Tirumala AR Navigation, game-based physics learning, a secure VR cinema platform and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "NEXUS",
  authors: [{ name: "Bhargav M", url: SITE_URL }],
  keywords: ["Bhargav M", "Unity developer", "AR/VR", "XR", "AR Foundation", "game development", "React Three Fiber", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "BHARGAV M // NEXUS", title, description },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#02030A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/** Before first paint: mark JS available and resolve the motion preference (Lite under reduced motion). */
const PREPAINT = `(function(){try{var d=document.documentElement;d.classList.add('js');var m=null;try{m=localStorage.getItem('nexus-motion')}catch(e){}var os=window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.setAttribute('data-os-reduced',os?'true':'false');d.setAttribute('data-motion',m==='reduced'?'reduced':'full');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  const fonts = [chakra, inter, michroma, oxanium, saira, mono, sora].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
        <link rel="preload" as="image" href="/nexus/plates/gate.jpg" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
