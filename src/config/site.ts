/**
 * Site-wide configuration: URL, links, the section map that drives every
 * piece of navigation chrome, and the [VERIFY] switches from the NEXUS brief.
 */

export const SITE_URL = "https://e-portfolio-xi-bay.vercel.app";

/** Contact form field limits (mirrored in Firestore rules). */
export const CONTACT_LIMITS = { name: 80, email: 120, message: 2000 } as const;

export const links = {
  email: "bhargav.m23@iiits.in",
  linkedin: "https://www.linkedin.com/in/bhargav-ai",
  linkedinLabel: "linkedin.com/in/bhargav-ai",
  github: "https://github.com/bhargavm-iiits",
  githubLabel: "github.com/bhargavm-iiits",
  portfolio: SITE_URL,
  portfolioLabel: "e-portfolio-xi-bay.vercel.app",
  source: "https://github.com/bhargavm-iiits/E-Portfolio",
} as const;

/**
 * Claims the brief marks [VERIFY]. Anything set to false stays off the site.
 * Flip a switch only once the claim is confirmed against the resume.
 */
export const verified = {
  /** "ISRO Launch Pad Simulation" as its own mission (scope, role, visuals). Shows only SYSTEM + CONTEXT. */
  isroMission: true,
  /** "VR" in Game-Based Physics Learning (headset support). */
  physicsVR: false,
  /** XR Interaction Toolkit node in the Ability Tree. */
  xrInteractionToolkit: false,
  /** Expected graduation year 2027. */
  graduation2027: false,
} as const;

/** World → Missions → Abilities + Player Log → Comms (Docs/Game master prompt §2). */
export type SectionId = "world" | "missions" | "abilities" | "log" | "comms";

export interface SectionDef {
  id: SectionId;
  code: string;
  /** Short HUD label used in the header and the mobile menu. */
  label: string;
  title: string;
}

export const SECTIONS: SectionDef[] = [
  { id: "world", code: "01", label: "WORLD", title: "WORLD ENTRY" },
  { id: "missions", code: "02", label: "MISSIONS", title: "SELECT YOUR NEXT MISSION" },
  { id: "abilities", code: "03", label: "ABILITIES", title: "ABILITY TREE" },
  { id: "log", code: "04", label: "PLAYER LOG", title: "PLAYER LOG" },
  { id: "comms", code: "05", label: "COMMS", title: "ESTABLISH CONTACT" },
];
