// Single source of truth for application colors and dimensions.
export const paletteTokens = {
  primary: "#F26522", primaryHover: "#D95618", brandPrimary: "#4F46E5", brandDark: "#312E81", primarySoft: "#FFF1EA", secondaryDark: "#0C4A5E", navyDark: "#111827",
  success: "#03C95A", successSoft: "#E6F9EE", warning: "#FFC107", warningSoft: "#FFF8E1",
  danger: "#E70D0D", dangerSoft: "#FDE8E8", info: "#1B84FF", infoSoft: "#E8F1FF",
  pink: "#FD3995", purple: "#AB47BC", textPrimary: "#1F2937", textMuted: "#6B7280",
  textLight: "#9CA3AF", border: "#E5E7EB", pageBg: "#F7F7F9", cardBg: "#FFFFFF",
  overlay1: "rgba(15,23,42,.06)",
  overlay2: "rgba(15,23,42,.05)",
  overlay3: "rgba(15,23,42,.07)",
  overlay4: "rgba(242,101,34,.35)",
  overlay5: "rgba(15,23,42,.10)",
  overlay6: "rgba(15,23,42,.22)",
  overlay7: "rgba(15,23,42,.08)",
  overlay8: "rgba(241, 245, 249, 0.6)",
  overlay9: "rgba(242,101,34,.07)",
  overlay10: "rgba(27, 132, 255, 0.08)",
  overlay11: "rgba(255,255,255,0.05)",
  overlay12: "rgba(0,0,0,.08)",
  overlay13: "rgba(255,255,255,.6)",
  overlay14: "rgba(255,255,255,.65)",
  overlay15: "rgba(255,255,255,.75)",
  overlay16: "rgba(3,201,90,.12)",
  overlay17: "rgba(239,68,68,.12)",
  overlay18: "rgba(245,158,11,.12)",
  overlay19: "rgba(139,92,246,.12)",
  overlay20: "rgba(27,132,255,.125)",
  overlay21: "rgba(242,101,34,.08)",
  overlay22: "rgba(242,101,34,.05)",
  overlay23: "rgba(242,101,34,.12)",
  overlay24: "rgba(27,132,255,.10)",
  overlay25: "rgba(255,255,255,.25)",
  overlay26: "rgba(255,255,255,.15)",
  overlay27: "rgba(255,255,255,.7)",
  overlay28: "rgba(15,23,42,.58)",
  overlay29: "rgba(0, 0, 0, 0.04)",
  overlay30: "rgba(0, 0, 0, 0.02)",
  overlay31: "rgba(139, 92, 246, 0.15)",
  overlay32: "rgba(14, 165, 233, 0.15)",
  overlay33: "rgba(14, 165, 233, 0.1)",
  overlay34: "rgba(100,116,139,.12)",
  tableHeader: "#F3F4F6", titleBg: "#EDEBFA", hover: "#FAFAFB",
};
export const dimensions = { radius: 4, sidebar: 260, collapsedSidebar: 72, gap: 20 };
export const shadows = { card: "0 1px 2px rgba(16,24,40,0.04)", popup: "0 8px 24px rgba(16,24,40,0.12)" };
const baseThemeTokens = {
  ...paletteTokens, primaryDark: paletteTokens.primaryHover, primaryLight: paletteTokens.primarySoft,
  primary100: paletteTokens.primarySoft, primary200: paletteTokens.primarySoft, primary400: paletteTokens.primary, primary600: paletteTokens.primary,
  accent: paletteTokens.primary, indigo: paletteTokens.info, indigoLight: paletteTokens.infoSoft, indigo500: paletteTokens.info, violet: paletteTokens.purple,
  error: paletteTokens.danger, background: paletteTokens.pageBg, surface: paletteTokens.cardBg, text: paletteTokens.textPrimary, heading: paletteTokens.textPrimary,
  mutedText: paletteTokens.textLight, textSecondary: paletteTokens.textMuted, slate500: paletteTokens.textMuted, slate700: paletteTokens.textPrimary,
  active: paletteTokens.primarySoft, input: paletteTokens.cardBg, gradTealCard: paletteTokens.cardBg, gradIndigoCard: paletteTokens.cardBg,
  gradGreenCard: paletteTokens.cardBg, gradAmberCard: paletteTokens.cardBg, gradHero: paletteTokens.cardBg, gradButton: paletteTokens.primary,
  radius: 4, cardRadius: 4, employeeRadius: 4, pagePad: 20, spacing: 8,
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  fontSize: { body: 14, sidebar: 14, heading: 24, section: 16 },
  fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  shadowSm: shadows.card, shadowMd: shadows.popup, shadowLg: shadows.popup, shadowXl: shadows.popup, shadowHover: shadows.card,
  chartPrimary: paletteTokens.primary, chartSecondary: paletteTokens.secondaryDark, chartTertiary: paletteTokens.success, chartGrid: paletteTokens.border,
};

export const colors = Object.fromEntries(Object.keys(paletteTokens).map(key => [key, "var(--" + key.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase()) + ")"]));
const mix = (hex, weight, white = false) => "#" + [1, 3, 5].map(index => Math.round(parseInt(hex.slice(index, index + 2), 16) * weight + (white ? 255 * (1 - weight) : 0)).toString(16).padStart(2, "0")).join("");
export function createThemeTokens(overrides = {}) {
  const p = { ...paletteTokens, ...overrides };
  if (overrides.primary && overrides.primary !== paletteTokens.primary) {
    const rgb = [1, 3, 5].map(index => parseInt(p.primary.slice(index, index + 2), 16)).join(",");
    for (const [key, value] of Object.entries(paletteTokens)) { const match = typeof value === "string" && value.match(/^rgba\(242,\s*101,\s*34,\s*([.\d]+)\)$/); if (match && !Object.hasOwn(overrides, key)) p[key] = "rgba(" + rgb + "," + match[1] + ")"; }
    if (!Object.hasOwn(overrides, "primaryHover")) p.primaryHover = mix(p.primary, 0.86);
    if (!Object.hasOwn(overrides, "primarySoft")) p.primarySoft = mix(p.primary, 0.08, true);
  }
  return { ...baseThemeTokens, ...p, primaryDark: p.primaryHover, primaryLight: p.primarySoft, primary100: p.primarySoft, primary200: p.primarySoft, primary400: p.primary, primary600: p.primary, accent: p.primary, active: p.primarySoft, gradButton: p.primary, chartPrimary: p.primary, secondary: p.secondaryDark };
}
export const defaultThemeTokens = createThemeTokens();
export function createCssVariables(tokens = defaultThemeTokens) {
  const values = Object.fromEntries(Object.keys(paletteTokens).map(key => [key, tokens[key] ?? paletteTokens[key]]));
  const vars = {};
  Object.entries(values).forEach(([key, value]) => {
    const name = "--" + key.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase()); vars[name] = value;
    if (/^#[\da-f]{6}$/i.test(value)) vars[name + "-rgb"] = [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16)).join(" ");
  });
  return { ...vars, "--shadow-card": shadows.card, "--font-family": tokens.fontFamily, "--font-size": tokens.fontSize.body + "px", "--radius": dimensions.radius + "px" };
}
export const cssVariables = createCssVariables();
