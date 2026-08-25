"use client";
import { useState, type FormEvent } from "react";
import { profile, extras } from "@/data/portfolio";
import { submitContactMessage, isFirebaseConfigured } from "@/lib/firebase";
import { showToast } from "@/lib/toast";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await submitContactMessage({ name, email, message });
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => showToast(`Copied "${text}"`));
  }

  return (
    <section id="section-contact" className="static-section">
      <div className="section-heading" data-reveal>
        <h2>CONTACT.</h2>
      </div>

      <div className="contact-columns" data-reveal>
        <div className="blueprint-box half-box align-left">
          <span className="mono-tag orange-tag">
            <i className="fa-solid fa-camera" /> EXTRA METRICS
          </span>
          {extras.map((x, i) => (
            <div className={`data-row${i < extras.length - 1 ? " separator" : ""}`} key={x.title}>
              <div className="data-col">
                <span className="orange-text">{x.title}</span>
                <span className="mono-tag sub">{x.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="blueprint-box half-box align-right">
          <span className="mono-tag orange-tag">
            <i className="fa-solid fa-link" /> ESTABLISH LINK
          </span>
          <div className="terminal-bullets">
            <p className="mono-tag" style={{ marginBottom: 10 }}>
              <span className="orange-text">
                <i className="fa-solid fa-phone" />
              </span>{" "}
              <button className="link-btn hover-orange magnetic" onClick={() => copy(profile.phone)}>
                {profile.phone}
              </button>
            </p>
            <p className="mono-tag" style={{ marginBottom: 10 }}>
              <span className="orange-text">
                <i className="fa-solid fa-envelope" />
              </span>{" "}
              <button className="link-btn hover-orange magnetic" onClick={() => copy(profile.email)}>
                {profile.email}
              </button>
            </p>
            <p className="mono-tag" style={{ marginBottom: 10 }}>
              <span className="orange-text">
                <i className="fa-brands fa-linkedin" />
              </span>{" "}
              <a href={profile.linkedin} target="_blank" rel="noopener" className="hover-orange magnetic">
                {profile.linkedinLabel}
              </a>
            </p>
            <p className="mono-tag">
              <span className="orange-text">
                <i className="fa-brands fa-github" />
              </span>{" "}
              <a href={profile.github} target="_blank" rel="noopener" className="hover-orange magnetic">
                {profile.githubLabel}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="blueprint-box center-box" style={{ marginTop: "2.5rem", maxWidth: 600 }} data-reveal>
        <span className="mono-tag orange-tag">
          <i className="fa-solid fa-paper-plane" /> SEND A MESSAGE
        </span>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            placeholder="Message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn-glow magnetic" disabled={status === "sending"}>
            {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
          </button>
          {status === "sent" && <p className="form-status success">Message sent — thank you!</p>}
          {status === "error" && <p className="form-status error">{error}</p>}
          {!isFirebaseConfigured && status === "idle" && (
            <p className="mono-tag sub">
              (Contact form backend not yet configured — use email/phone above for now.)
            </p>
          )}
        </form>
      </div>

      <footer className="site-footer">
        <span className="mono-tag">© 2026 BHARGAV M — BUILT WITH NEXT.JS, REACT THREE FIBER &amp; GSAP</span>
      </footer>
    </section>
  );
}
