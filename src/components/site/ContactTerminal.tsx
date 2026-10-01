"use client";
/**
 * The transmission terminal (revealed by ESTABLISH CONTACT): channels plus a
 * labelled form in a focus-trapped dialog. Status lines map to real states:
 * validating → uplink (request pending) → received / signal lost. Without
 * Firebase config the form hands off to the visitor's mail client with the
 * message prefilled — never a fake success.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { CONTACT_LIMITS as LIMITS, links } from "@/config/site";
import { store, useNexus } from "@/lib/store";
import { director } from "@/lib/director";
import { setInert, trapFocus } from "@/lib/focusTrap";
import { Icon } from "@/components/hud/Icons";
import HudFrame from "@/components/hud/HudFrame";

type Status = "idle" | "validating" | "uplink" | "received" | "lost" | "handoff";

const STATUS_TEXT: Record<Status, string> = {
  idle: "CHANNEL OPEN // AWAITING TRANSMISSION",
  validating: "CHECKING…",
  uplink: "UPLINK…",
  received: "TRANSMISSION RECEIVED",
  lost: "SIGNAL LOST — PLEASE RETRY",
  handoff: "HANDING OFF TO YOUR MAIL CLIENT — MESSAGE PREFILLED",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BACKGROUND = ["#main", "#site-header", ".skip-link"];

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

function Channels() {
  const [copied, setCopied] = useState(false);
  const items = [
    { icon: Icon.mail, label: "EMAIL", value: links.email, href: `mailto:${links.email}` },
    { icon: Icon.linkedin, label: "LINKEDIN", value: links.linkedinLabel, href: links.linkedin },
    { icon: Icon.github, label: "GITHUB", value: links.githubLabel, href: links.github },
  ];
  return (
    <div className="channels">
      <p className="t-meta">CHANNELS</p>
      <ul>
        {items.map(({ icon: I, label, value, href }) => {
          const external = !href.startsWith("mailto:");
          return (
            <li key={label}>
              <a className="channel" href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <I size={18} />
                <span className="channel__label">{label}</span>
                <span className="channel__value">{value}</span>
                {external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="plate plate--outline plate--sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(links.email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
          } catch {
            setCopied(false);
          }
        }}
      >
        <Icon.copy size={14} /> COPY EMAIL
      </button>
      <p className="channels__copied" role="status" aria-live="polite">
        {copied ? "Email copied to the clipboard." : ""}
      </p>
    </div>
  );
}

function TerminalForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const form = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("callsign") ?? "").trim();
    const email = String(fd.get("frequency") ?? "").trim();
    const message = String(fd.get("transmission") ?? "").trim();
    const honeypot = String(fd.get("website") ?? "");

    setStatus("validating");
    const next: Errors = {};
    if (!name) next.name = "Enter your name.";
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (message.length < 10) next.message = "The message needs at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus("idle");
      const first = next.name ? "callsign" : next.email ? "frequency" : "transmission";
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // Bots fill the hidden field; quietly drop the transmission.
    if (honeypot) {
      setStatus("received");
      form.current?.reset();
      return;
    }
    const { isFirebaseConfigured, submitContactMessage } = await import("@/lib/firebase");
    if (!isFirebaseConfigured) {
      setStatus("handoff");
      const subject = encodeURIComponent(`NEXUS transmission from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
      window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`;
      return;
    }
    setStatus("uplink");
    try {
      await submitContactMessage({ name, email, message });
      setStatus("received");
      form.current?.reset();
    } catch {
      setStatus("lost");
    }
  }

  const busy = status === "validating" || status === "uplink";
  const field = (id: string, label: string, err: string | undefined, input: React.ReactNode) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {input}
      {err && (
        <p id={`${id}-err`} className="field__err">
          {err}
        </p>
      )}
    </div>
  );

  return (
    <form ref={form} className="terminal-form" noValidate onSubmit={onSubmit} aria-labelledby="terminal-title">
      {field(
        "callsign",
        "CALLSIGN · YOUR NAME",
        errors.name,
        <input id="callsign" name="callsign" autoComplete="name" maxLength={LIMITS.name} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "callsign-err" : undefined} />
      )}
      {field(
        "frequency",
        "RETURN FREQUENCY · EMAIL",
        errors.email,
        <input id="frequency" name="frequency" type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "frequency-err" : undefined} />
      )}
      {field(
        "transmission",
        "TRANSMISSION · MESSAGE",
        errors.message,
        <textarea id="transmission" name="transmission" rows={5} maxLength={LIMITS.message} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "transmission-err" : undefined} />
      )}
      {/* honeypot: hidden from people and assistive tech */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="terminal-form__foot">
        <p className="terminal-form__status" data-status={status} role="status" aria-live="polite">
          <span className="terminal-form__led" aria-hidden="true" />
          {STATUS_TEXT[status]}
        </p>
        <button type="submit" className="plate plate--primary plate--sm" disabled={busy}>
          TRANSMIT <Icon.arrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

export default function ContactTerminal() {
  const open = useNexus((s) => s.terminalOpen);
  const reduced = useNexus((s) => s.reduced);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !root.current) return;
    // Safari does not focus buttons on click: fall back to the opener.
    const active = document.activeElement as HTMLElement | null;
    const returnTo = active && active !== document.body ? active : document.getElementById("contact-cta");
    setInert(BACKGROUND, true);
    director.lock(true);
    const release = trapFocus(root.current);
    const close = () => store.set({ terminalOpen: false });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    root.current.querySelector<HTMLElement>("#terminal-title")?.focus({ preventScroll: true });
    if (!reduced && panel.current) gsap.fromTo(panel.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power3.out" });
    return () => {
      release();
      document.removeEventListener("keydown", onKey);
      setInert(BACKGROUND, false);
      director.lock(false);
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [open, reduced]);

  if (!open) return null;
  return (
    <div ref={root} id="terminal" className="terminal" role="dialog" aria-modal="true" aria-labelledby="terminal-title">
      <div className="terminal__backdrop" onClick={() => store.set({ terminalOpen: false })} aria-hidden="true" />
      <div ref={panel} className="terminal__panel">
        <HudFrame className="terminal__frame" cut={[0, 20, 0, 20]} inset={6} accents={["tl", "br"]} dots>
          <header className="terminal__head">
            <div>
              <p className="t-meta">05 // COMMS</p>
              <h2 id="terminal-title" className="t-heading" tabIndex={-1}>
                TRANSMISSION TERMINAL
              </h2>
            </div>
            <button type="button" className="icon-btn" aria-label="Close the terminal" onClick={() => store.set({ terminalOpen: false })}>
              <Icon.close size={18} />
            </button>
          </header>
          <div className="terminal__grid">
            <Channels />
            <TerminalForm />
          </div>
        </HudFrame>
      </div>
    </div>
  );
}
