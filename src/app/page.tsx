import NexusSite from "@/nexus/NexusSite";
import { SITE_URL, links } from "@/config/site";

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Bhargav M",
  url: SITE_URL,
  email: `mailto:${links.email}`,
  sameAs: [links.linkedin, links.github],
  alumniOf: { "@type": "CollegeOrUniversity", name: "IIIT Sri City" },
  knowsAbout: ["Unity", "AR Foundation", "ARCore", "XR", "Game development", "React Three Fiber", "Python"],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <NexusSite />
    </>
  );
}
