if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

import "./scene.js";
import "./portal.js";
import "./cubes.js";
import {
  renderHero,
  renderEducation,
  renderExperience,
  renderFeaturedScenes,
  renderAchievement,
  renderGrid,
  renderSkills,
  renderContact,
  initCursor,
  initHeroTilt,
  initNavRail,
  playLoader,
} from "./ui.js";
import { startRenderLoop } from "./scene.js";
import { initScroll } from "./scroll.js";

renderHero();
renderEducation();
renderExperience();
renderFeaturedScenes();
renderAchievement();
renderGrid();
renderSkills();
renderContact();

initCursor();
initHeroTilt();
initNavRail();
initScroll();
startRenderLoop();
playLoader();
