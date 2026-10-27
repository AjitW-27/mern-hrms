import { create } from "zustand";
import { defaultThemeTokens, createThemeTokens } from "../theme/designTokens";
export { defaultThemeTokens } from "../theme/designTokens";
const useThemeStore = create(set => ({ tokens: defaultThemeTokens, overrides: {}, updateTokens: updates => set(state => { const overrides = { ...state.overrides, ...updates }; return { overrides, tokens: createThemeTokens(overrides) }; }), resetTheme: () => set({ tokens: defaultThemeTokens, overrides: {} }) }));
export default useThemeStore;
