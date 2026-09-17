import { create } from "zustand";

// The application's single source of truth for design values.
export const defaultThemeTokens = {
  primary: "#0891a1", primaryDark: "#067582", primaryLight: "#e5f8fa", accent: "#06b6c9",
  background: "#ffffff", surface: "#ffffff", text: "#1d2939", heading: "#000000", mutedText: "#667085",
  border: "#e4e7ec", hover: "#f0fbfc", active: "#dff6f8", sidebar: "#ffffff", appBar: "#ffffff",
  input: "#ffffff", tableHeader: "#f7fafb", success: "#067647", warning: "#b54708", error: "#b42318",
  chartPrimary: "#0891a1", chartSecondary: "#06b6c9", chartTertiary: "#067647", chartGrid: "#e4e7ec",
  radius: 4, spacing: 8, fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
  fontSize: { body: 14, sidebar: 14, heading: 16, section: 15 },
  fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
};

const useThemeStore = create((set) => ({
  tokens: defaultThemeTokens,
  updateTokens: (updates) => set((state) => ({ tokens: { ...state.tokens, ...updates } })),
  resetTheme: () => set({ tokens: defaultThemeTokens }),
}));

export default useThemeStore;
