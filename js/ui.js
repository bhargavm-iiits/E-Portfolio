import {
  profile,
  education,
  experience,
  achievement,
  extras,
  projects,
  skills,
} from "./data.js";

const iconMap = {
  vr: "fa-solid fa-vr-cardboard",
  brain: "fa-solid fa-brain",
  code: "fa-solid fa-code",
  rocket: "fa-solid fa-rocket",
  language: "fa-solid fa-language",
  wave: "fa-solid fa-wave-square",
};

const categoryLabel = { "ar-vr": "AR / VR", "ai-ml": "AI / ML", web: "WEB" };

// ---------- Hero ----------
export function renderHero() {
  const el = document.getElementById("scene-intro");
  el.innerHTML = `
    <div class="sticky-wrapper">
      <div class="hero-grid">
        <div class="hero-copy fade-block">
          <h2 class="hero-name">${profile.displayName}</h2>
          <span class="mono-tag eyebrow"><i class="fa-solid fa-vr-cardboard orange-text"></i> ${profile.eyebrow}</span>
          <h1 class="hero-title">
            <span class="line-white">${profile.headlineTop}</span>
            <span class="line-gradient">${profile.headlineGradient}</span>
            <span class="line-white">${profile.headlineWhite}</span>
          </h1>
          <p class="mono-tag tagline">${profile.tagline}</p>
          <p class="bio">${profile.bio}</p>
          <div class="capability-row">
            ${profile.capabilities
              .map(
                (c) => `
              <div class="capability">
                <i class="${iconMap[c.icon]}"></i>
                <span class="mono-tag">${c.label}</span>
              </div>`
              )
              .join("")}
          </div>
          <div class="contact-array">
            <a href="tel:${profile.phone.replace(/\s/g, "")}" class="mono-tag hover-orange magnetic"><i class="fa-solid fa-phone"></i> ${profile.phone}</a>
            <a href="mailto:${profile.email}" class="mono-tag hover-orange magnetic"><i class="fa-solid fa-envelope"></i> ${profile.email}</a>
          </div>
        </div>
      </div>
      <div class="scroll-prompt">
        <span class="mono-tag"><i class="fa-solid fa-computer-mouse"></i> SCROLL TO EXPLORE</span>
        <div class="scroll-line"></div>
      </div>
    </div>
  `;
}

// ---------- Education ----------
export function renderEducation() {
  const el = document.getElementById("edu-rows");
  el.innerHTML = education
    .map(
      (e, i) => `
    <div class="data-row ${i < education.length - 1 ? "separator" : ""}">
      <div class="data-col">
        <span class="mono-tag"><i class="fa-solid fa-building-columns orange-text"></i> ${e.school}</span>
        <span class="mono-tag sub">${e.period}</span>
      </div>
      <div class="data-col right">
        <span class="orange-text">${e.degree}</span>
        <span class="mono-tag">${e.score}</span>
      </div>
    </div>`
    )
    .join("");
}

// ---------- Experience ----------
export function renderExperience() {
  const el = document.getElementById("experience-block");
  el.innerHTML = `
    <div class="exp-header">
      <h3>${experience.company}</h3>
      <span class="mono-tag orange-text d-block"><i class="fa-solid fa-user-gear"></i> ${experience.role}</span>
      <span class="mono-tag sub d-block"><i class="fa-solid fa-map-pin"></i> ${experience.location}</span>
    </div>
    <div class="terminal-bullets">
      ${experience.bullets
        .map((b) => `<p class="mono-tag"><span class="orange-text">></span> ${b}</p>`)
        .join("")}
    </div>
  `;
}

// ---------- Featured project cinematic scenes ----------
export function renderFeaturedScenes() {
  const container = document.getElementById("featured-projects");
  const featured = projects.filter((p) => p.featured);
  container.innerHTML = featured
    .map(
      (p, i) => `
    <section class="scene sequence-scene" id="scene-proj-${p.id}">
      <div class="sticky-wrapper">
        <div class="title-layer center-content">
          <span class="mono-tag orange-tag">${p.tag}</span>
          <h1 class="hero-title" style="font-size: clamp(2.5rem, 6vw, 6rem);">${p.title}</h1>
        </div>
        <div class="detail-layer ${i % 2 === 0 ? "align-right" : "align-left"}">
          <div class="blueprint-box rich-box alt-style" style="border-color:${p.color}66;">
            <p class="abstract" style="border-color:${p.color};">${p.abstract}</p>
            <div class="tech-stack-row">
              ${p.tech.map((t) => `<span class="glow-edge" style="border-color:${p.color};color:${p.color};">${t}</span>`).join("")}
            </div>
            <div class="terminal-bullets">
              ${p.bullets.map((b) => `<p class="mono-tag"><span class="orange-text">></span> ${b}</p>`).join("")}
            </div>
            <div class="project-links">
              <a href="${p.github}" target="_blank" rel="noopener" class="hover-orange magnetic"><i class="fa-brands fa-github"></i> SOURCE</a>
              ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener" class="hover-orange magnetic"><i class="fa-solid fa-up-right-from-square"></i> LIVE</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    </section>`
    )
    .join("");
}

// ---------- Achievement ----------
export function renderAchievement() {
  const el = document.getElementById("achievement-box");
  el.innerHTML = `
    <span class="orange-text subtitle-highlight"><i class="fa-solid fa-trophy"></i> ${achievement.highlight}</span>
    <div class="terminal-bullets padding-top">
      ${achievement.bullets.map((b) => `<p class="mono-tag"><span class="orange-text">></span> ${b}</p>`).join("")}
    </div>
  `;
}

// ---------- Project grid with filters ----------
let activeFilter = "all";

export function renderGrid() {
  const gridWrap = document.getElementById("project-grid-wrap");
  gridWrap.innerHTML = `
    <div class="filter-tabs" role="tablist" aria-label="Filter projects">
      <button class="filter-tab active" data-filter="all" role="tab" aria-selected="true">ALL WORK</button>
      <button class="filter-tab" data-filter="ar-vr" role="tab" aria-selected="false">AR / VR</button>
      <button class="filter-tab" data-filter="ai-ml" role="tab" aria-selected="false">AI / ML</button>
      <button class="filter-tab" data-filter="web" role="tab" aria-selected="false">WEB</button>
    </div>
    <div class="project-grid" id="project-grid"></div>
  `;

  gridWrap.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      gridWrap.querySelectorAll(".filter-tab").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      paintGrid();
    });
  });

  paintGrid();
}

function paintGrid() {
  const grid = document.getElementById("project-grid");
  const list =
    activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter);

  grid.innerHTML = list
    .map(
      (p) => `
    <article class="project-card magnetic" data-id="${p.id}" tabindex="0" role="button"
      aria-label="View ${p.title} details" style="--card-color:${p.color};">
      <span class="card-cat mono-tag">${categoryLabel[p.category]}</span>
      <h3>${p.title}</h3>
      <p class="card-abstract">${p.abstract}</p>
      <div class="tech-stack-row mini">
        ${p.tech.slice(0, 3).map((t) => `<span>${t}</span>`).join("")}
      </div>
      <div class="card-footer">
        <i class="fa-brands fa-github"></i>
        ${p.live ? '<i class="fa-solid fa-up-right-from-square"></i>' : ""}
      </div>
    </article>`
    )
    .join("");

  grid.querySelectorAll(".project-card").forEach((card) => {
    const project = list.find((p) => p.id === card.dataset.id);
    attachTilt(card);
    card.addEventListener("click", () => openModal(project));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(project);
      }
    });
  });

  gsap.fromTo(
    grid.children,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
  );
}

function attachTilt(card) {
  const maxTilt = 8;
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${-py * maxTilt}deg) rotateY(${px * maxTilt}deg) translateY(-6px)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
}

// ---------- Skills ----------
export function renderSkills() {
  const el = document.getElementById("skills-grid");
  el.innerHTML = skills
    .map(
      (s) => `
    <div class="skill-row">
      <span class="orange-text mono-tag"><i class="${iconMap[s.icon]}"></i> ${s.label}</span>
      <p class="mono-tag sub">${s.detail}</p>
      <div class="skill-bar-track"><div class="skill-bar-fill" data-value="${s.value}"></div></div>
    </div>`
    )
    .join("");
}

// ---------- Contact ----------
export function renderContact() {
  const extrasEl = document.getElementById("contact-extras");
  extrasEl.innerHTML = extras
    .map(
      (x, i) => `
    <div class="data-row ${i < extras.length - 1 ? "separator" : ""}">
      <div class="data-col">
        <span class="orange-text">${x.title}</span>
        <span class="mono-tag sub">${x.sub}</span>
      </div>
    </div>`
    )
    .join("");

  const linksEl = document.getElementById("contact-links");
  linksEl.innerHTML = `
    <p class="mono-tag"><span class="orange-text"><i class="fa-solid fa-phone"></i></span>
      <button class="link-btn hover-orange magnetic" data-copy="${profile.phone}">${profile.phone}</button></p>
    <p class="mono-tag"><span class="orange-text"><i class="fa-solid fa-envelope"></i></span>
      <button class="link-btn hover-orange magnetic" data-copy="${profile.email}">${profile.email}</button></p>
    <p class="mono-tag"><span class="orange-text"><i class="fa-brands fa-linkedin"></i></span>
      <a href="${profile.linkedin}" target="_blank" rel="noopener" class="hover-orange magnetic">${profile.linkedinLabel}</a></p>
    <p class="mono-tag"><span class="orange-text"><i class="fa-brands fa-github"></i></span>
      <a href="${profile.github}" target="_blank" rel="noopener" class="hover-orange magnetic">${profile.githubLabel}</a></p>
  `;

  linksEl.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copyToClipboard(btn.dataset.copy));
  });
}

// ---------- Modal ----------
const modalRoot = document.getElementById("project-modal");

export function openModal(project) {
  if (!project) return;
  modalRoot.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-panel" role="dialog" aria-modal="true" aria-label="${project.title} details" style="--card-color:${project.color};">
      <button class="modal-close magnetic" aria-label="Close">&times;</button>
      <span class="card-cat mono-tag">${categoryLabel[project.category]}</span>
      <h2>${project.title}</h2>
      <p class="card-abstract">${project.abstract}</p>
      <div class="tech-stack-row">
        ${project.tech.map((t) => `<span class="glow-edge" style="border-color:${project.color};color:${project.color};">${t}</span>`).join("")}
      </div>
      <div class="terminal-bullets">
        ${project.bullets.map((b) => `<p class="mono-tag"><span class="orange-text">></span> ${b}</p>`).join("")}
      </div>
      <div class="project-links">
        <a href="${project.github}" target="_blank" rel="noopener" class="hover-orange magnetic"><i class="fa-brands fa-github"></i> SOURCE</a>
        ${project.live ? `<a href="${project.live}" target="_blank" rel="noopener" class="hover-orange magnetic"><i class="fa-solid fa-up-right-from-square"></i> LIVE DEMO</a>` : ""}
      </div>
    </div>
  `;
  modalRoot.classList.add("open");
  document.body.classList.add("modal-open");
  modalRoot.querySelector(".modal-close").addEventListener("click", closeModal);
  modalRoot.querySelector(".modal-backdrop").addEventListener("click", closeModal);
}

export function closeModal() {
  modalRoot.classList.remove("open");
  document.body.classList.remove("modal-open");
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ---------- Cube hover HUD + click -> modal ----------
window.addEventListener("cube:hover", (e) => {
  const hud = document.getElementById("cube-hud");
  if (!e.detail) {
    hud.classList.remove("visible");
    return;
  }
  hud.textContent = e.detail.title;
  hud.classList.add("visible");
});
window.addEventListener("cube:click", (e) => openModal(e.detail));

// ---------- Custom cursor + magnetic hover ----------
export function initCursor() {
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (!hasFinePointer) return;
  document.body.classList.add("has-custom-cursor");
  const cursor = document.querySelector(".cursor");

  window.addEventListener("pointermove", (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12 });
  });

  document.addEventListener("pointerover", (e) => {
    if (e.target.closest(".magnetic, .project-card, .filter-tab")) {
      cursor.classList.add("cursor-hover");
    }
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest(".magnetic, .project-card, .filter-tab")) {
      cursor.classList.remove("cursor-hover");
    }
  });
}

// ---------- Nav rail ----------
export function initNavRail() {
  const rail = document.getElementById("nav-rail");
  const sections = [
    { id: "scene-intro", label: "INTRO" },
    { id: "scene-edu", label: "EDU" },
    { id: "scene-experience", label: "WORK" },
    { id: "featured-projects", label: "PROJECTS" },
    { id: "scene-achievements", label: "AWARDS" },
    { id: "section-grid", label: "ALL WORK" },
    { id: "section-skills", label: "SKILLS" },
    { id: "section-contact", label: "CONTACT" },
  ];

  rail.innerHTML = sections
    .map((s) => `<button class="nav-dot" data-target="${s.id}" aria-label="Go to ${s.label}"><span>${s.label}</span></button>`)
    .join("");

  rail.querySelectorAll(".nav-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      document.getElementById(dot.dataset.target)?.scrollIntoView({ behavior: "smooth" });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          rail.querySelectorAll(".nav-dot").forEach((d) => d.classList.remove("active"));
          rail.querySelector(`[data-target="${entry.target.id}"]`)?.classList.add("active");
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
}

// ---------- Toast ----------
function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => showToast(`Copied "${text}"`));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("visible"), 2200);
}

// ---------- Loader ----------
export function playLoader() {
  const tl = gsap.timeline();
  const progress = { val: 0 };
  tl.to(progress, {
    val: 100,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      document.querySelector(".loader-percentage").textContent = Math.round(progress.val) + "%";
    },
  })
    .to("#loader", { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" })
    .fromTo(".hero-copy", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, "-=0.6");
  return tl;
}
