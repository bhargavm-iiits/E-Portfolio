import { ImageResponse } from "next/og";

export const alt = "BHARGAV M // NEXUS — I build playable worlds. Unity · AR/VR · AI engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG card in the hero's language: copy left, a cyan / violet portal ring right, near-black navy. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 72px",
          background: "radial-gradient(circle at 74% 46%, #13233d 0%, #070d14 42%, #030910 100%)",
          color: "#eef6ff",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 95,
            width: 440,
            height: 440,
            borderRadius: 9999,
            border: "34px solid #121924",
            boxShadow: "-10px -10px 50px rgba(75,220,253,.55), 12px 14px 50px rgba(139,108,255,.55), inset 0 0 70px rgba(200,235,255,.75)",
            background: "radial-gradient(circle, #dcefff 0%, #9ccaf0 55%, #4f86c4 100%)",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 24, letterSpacing: 6, color: "#79d8f3", display: "flex" }}>UNITY • AR/VR • AI ENGINEERING</div>
        <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: 4, marginTop: 18, display: "flex" }}>BHARGAV M</div>
        <div style={{ fontSize: 30, letterSpacing: 12, marginTop: 16, display: "flex" }}>I BUILD PLAYABLE WORLDS.</div>
        <div style={{ width: 360, height: 2, background: "linear-gradient(90deg, #4bdcfd, transparent)", marginTop: 34, display: "flex" }} />
        <div style={{ fontSize: 22, letterSpacing: 8, color: "#a9b9cf", marginTop: 22, display: "flex" }}>NEXUS // BHARGAV</div>
      </div>
    ),
    size
  );
}
