"use client";
/** CH15 Comms (normal flow after the story): links + the Firebase contact terminal (CONTACT_LIMITS). */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { comms } from "@/data/nexus";
import { links, CONTACT_LIMITS } from "@/config/site";
import { submitContactMessage, isFirebaseConfigured } from "@/lib/firebase";
import { director } from "../director";

type Status = "idle" | "sending" | "sent" | "error";

export function Comms() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 2) {
      setStatus("error");
      setErr("Add your name, a valid email and a message.");
      return;
    }
    setStatus("sending");
    try {
      await submitContactMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (x) {
      setStatus("error");
      setErr((x as Error).message === "NOT_CONFIGURED" ? "The terminal is offline — email works instead." : "Transmission failed. Try again or use email.");
    }
  };
  const toLite = () => {
    try { localStorage.setItem("nexus-motion", "reduced"); } catch { /* storage blocked */ }
    location.reload();
  };
  return (
    <section id="comms" className="nx-flow cm" aria-labelledby="comms-h">
      <div className="cm-grid">
        <div className="cm-left">
          <div className="hud-micro cm-k">05 · ESTABLISH CONTACT</div>
          <h2 id="comms-h" className="cm-h">{comms.headline[0]}<br /><span>{comms.headline[1]}</span></h2>
          <div className="cm-path">{comms.path.map((p, i) => <span key={p}>{i > 0 && <b>→</b>}{p}</span>)}</div>
          <ul className="cm-links">
            <li><a href={`mailto:${links.email}`}><span>EMAIL</span>{links.email}</a></li>
            <li><a href={links.linkedin} target="_blank" rel="noreferrer"><span>LINKEDIN</span>{links.linkedinLabel}</a></li>
            <li><a href={links.github} target="_blank" rel="noreferrer"><span>GITHUB</span>{links.githubLabel}</a></li>
          </ul>
        </div>
        <form className="cm-form glass" onSubmit={submit} noValidate aria-label="Contact terminal">
          <div className="cm-form-top"><span>COMMS TERMINAL</span><span><i />{isFirebaseConfigured ? "CHANNEL OPEN" : "EMAIL RELAY"}</span></div>
          <div className="cm-row">
            <label>CALLSIGN (NAME)<input name="name" autoComplete="name" maxLength={CONTACT_LIMITS.name} value={form.name} onChange={set("name")} placeholder="Your name" required /></label>
            <label>FREQUENCY (EMAIL)<input name="email" type="email" autoComplete="email" maxLength={CONTACT_LIMITS.email} value={form.email} onChange={set("email")} placeholder="you@domain.com" required /></label>
          </div>
          <label>TRANSMISSION (MESSAGE)<textarea name="message" rows={6} maxLength={CONTACT_LIMITS.message} value={form.message} onChange={set("message")} placeholder="Tell me about the world you want to build…" required /></label>
          <div className="cm-form-bottom">
            <span className="hud-micro" aria-live="polite">{status === "sent" ? "TRANSMISSION RECEIVED ✓" : status === "error" ? err : `${form.message.length} / ${CONTACT_LIMITS.message}`}</span>
            {isFirebaseConfigured
              ? <button type="submit" className="nx-pill cm-send" disabled={status === "sending"}>{status === "sending" ? "TRANSMITTING…" : "TRANSMIT →"}</button>
              : <a className="nx-pill cm-send" href={`mailto:${links.email}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(form.message)}`}>EMAIL →</a>}
          </div>
        </form>
      </div>
      <footer className="cm-foot">
        <span>{comms.footerLeft}</span>
        <span className="cm-foot-links">
          <button type="button" onClick={() => director.go("gate", true)}>REPLAY ENTRY</button>
          <button type="button" onClick={toLite}>LITE MODE</button>
          <Link href="/archive">ARCHIVE</Link>
        </span>
        <span>{comms.footerRight}</span>
      </footer>
    </section>
  );
}
