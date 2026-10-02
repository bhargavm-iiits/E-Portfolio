import type { Metadata } from "next";
import Archive from "@/nexus/Archive";
import "@/nexus/archive.css";

export const metadata: Metadata = {
  title: "Archive — Bhargav M // NEXUS",
  description: "The daylight archive of Bhargav M's missions, side quests and tech stack.",
  alternates: { canonical: "/archive" },
};

export default function ArchivePage() {
  return <Archive />;
}
