"use client";
/**
 * 05 COMMS (screenshot §8): a panoramic world band — the night city across
 * the water, a moon, mist and a small explorer — rendered through this band as
 * a 3D window. LET’S BUILD / THE NEXT WORLD. on the left; ESTABLISH CONTACT on
 * the right reveals the transmission terminal (a dialog). The angular footer
 * closes the page.
 */
import { comms, hero } from "@/data/nexus";
import { links } from "@/config/site";
import { store } from "@/lib/store";
import { useWindow } from "@/lib/windows";
import { Icon } from "@/components/hud/Icons";

export default function Comms() {
  const win = useWindow("comms");
  return (
    <section id="comms" className="comms" data-section="comms" aria-labelledby="comms-title">
      <div ref={win} className="comms__band">
        <div className="comms__poster" aria-hidden="true" />
        <div className="comms__scrim" aria-hidden="true" />
        <svg className="comms__rails" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 0 1 H 1000" />
          <path d="M 0 262 H 160 L 182 299 H 1000" />
          <path className="comms__rail-accent" d="M 0 60 L 34 26" />
        </svg>
        <div className="wrap comms__inner">
          <div className="comms__copy">
            <h2 id="comms-title" className="comms__headline" tabIndex={-1}>
              <span>{comms.headline[0]}</span>
              <span>{comms.headline[1]}</span>
            </h2>
            <p className="comms__path">
              {comms.path.map((p, i) => (
                <span key={p}>
                  {i > 0 && <Icon.arrowRight size={14} />}
                  {p}
                </span>
              ))}
            </p>
          </div>
          <button
            id="contact-cta"
            type="button"
            className="plate plate--primary comms__cta"
            aria-haspopup="dialog"
            aria-controls="terminal"
            onClick={() => store.set({ terminalOpen: true })}
          >
            ESTABLISH CONTACT <Icon.arrowRight size={18} />
          </button>
        </div>
      </div>

      <footer className="site-footer">
        <p className="site-footer__left t-meta">{comms.footerLeft}</p>
        <p className="site-footer__mid">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <span aria-hidden="true">·</span>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <span aria-hidden="true">·</span>
          <a href={links.github} target="_blank" rel="noopener noreferrer">
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        <p className="site-footer__right t-meta">{comms.footerRight}</p>
        <p className="sr-only">© {new Date().getFullYear()} {hero.name}</p>
      </footer>
    </section>
  );
}
