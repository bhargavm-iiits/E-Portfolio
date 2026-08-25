"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useIsFinePointer } from "@/lib/useMediaQuery";

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useIsFinePointer();

  useEffect(() => {
    if (!hasFinePointer) return;
    document.body.classList.add("has-custom-cursor");
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMove = (e: PointerEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12 });
    };
    const handleOver = (e: Event) => {
      if ((e.target as HTMLElement).closest(".magnetic, .project-card, .filter-tab")) {
        cursor.classList.add("cursor-hover");
      }
    };
    const handleOut = (e: Event) => {
      if ((e.target as HTMLElement).closest(".magnetic, .project-card, .filter-tab")) {
        cursor.classList.remove("cursor-hover");
      }
    };

    window.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerover", handleOver);
    document.addEventListener("pointerout", handleOut);
    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
    };
  }, [hasFinePointer]);

  return <div ref={cursorRef} className="cursor" aria-hidden="true" />;
}
