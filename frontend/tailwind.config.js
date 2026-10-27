import { colors, dimensions, shadows, defaultThemeTokens } from "./src/theme/designTokens.js";
const radius = dimensions.radius + "px";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { borderRadius: { DEFAULT: radius, none: "0", sm: radius, md: radius, lg: radius, xl: radius, "2xl": radius, "3xl": radius, full: "50%" }, extend: {
    colors: { white: colors.cardBg, black: colors.navyDark, primary: { DEFAULT: colors.primary, hover: colors.primaryHover, light: colors.primarySoft, 50: colors.primarySoft, 100: colors.primarySoft, 500: colors.primary, 600: colors.primaryHover }, canvas: colors.pageBg, surface: colors.cardBg,
      slate: { 50: colors.pageBg, 100: colors.tableHeader, 200: colors.border, 300: colors.textLight, 400: colors.textLight, 500: colors.textMuted, 600: colors.textMuted, 700: colors.textPrimary, 800: colors.textPrimary, 900: colors.navyDark, header: colors.textPrimary, subtitle: colors.textMuted },
      status: { danger: colors.danger, dangerLight: colors.dangerSoft, medium: colors.pink, mediumLight: colors.primarySoft, success: colors.success, successLight: colors.successSoft, warning: colors.warning, warningLight: colors.warningSoft, info: colors.info, infoLight: colors.infoSoft, purple: colors.purple, purpleLight: colors.titleBg, secondary: colors.secondaryDark, secondaryLight: colors.infoSoft } },
    fontFamily: { sans: defaultThemeTokens.fontFamily }, boxShadow: { subtle: shadows.card, card: shadows.card, dropdown: shadows.popup }
  } }, plugins: [], corePlugins: { preflight: false }
};
