import originalArtwork from "../assets/aw-logo.svg?raw";
import { paletteTokens } from "../theme/designTokens";

// Original project artwork, recovered unchanged from its existing Logo component.
const artwork = originalArtwork.replaceAll("__AW_PRIMARY__", paletteTokens.brandPrimary).replaceAll("__AW_DARK__", paletteTokens.brandDark).replaceAll("__AW_STROKE__", paletteTokens.cardBg);
export const branding = {
  appName: "AW HRMS",
  logoUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(artwork),
  // footer: "AW HRMS",
};

export function applyBranding(document) {
  document.title = branding.appName;
  let icon = document.querySelector('link[rel="icon"]');
  if (!icon) { icon = document.createElement("link"); icon.rel = "icon"; document.head.appendChild(icon); }
  icon.href = branding.logoUrl;
}
