"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Loader() {
  const [percent, setPercent] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = { val: 0 };
    const tl = gsap.timeline();
    tl.to(progress, {
      val: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => setPercent(Math.round(progress.val)),
    }).to(loaderRef.current, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" })
      .fromTo(
        ".hero-reveal",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.12 },
        "-=0.5"
      );
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={loaderRef} id="loader">
      <div className="cad-loader">
        <div className="loader-circle" />
        <div className="loader-circle inner" />
        <div className="loader-dot" />
      </div>
      <div className="loader-text">
        <span>INITIALIZING IMMERSIVE ENGINE</span>
        <span className="loader-percentage">{percent}%</span>
      </div>
    </div>
  );
}
