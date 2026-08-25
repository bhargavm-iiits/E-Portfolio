"use client";
import { useEffect, useRef, useState } from "react";

export default function Toast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      setVisible(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisible(false), 2200);
    };
    window.addEventListener("toast:show", handler);
    return () => window.removeEventListener("toast:show", handler);
  }, []);

  return (
    <div id="toast" role="status" className={visible ? "visible" : ""}>
      {message}
    </div>
  );
}
