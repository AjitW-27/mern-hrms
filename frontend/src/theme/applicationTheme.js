import { createTheme } from "@mui/material/styles";
import { defaultThemeTokens } from "../strore/themeStore";

export const createApplicationTheme = (tokens = defaultThemeTokens) => createTheme({
  palette: {
    mode: "light",
    primary: { main: tokens.primary, dark: tokens.primaryDark, light: tokens.primaryLight, contrastText: "#fff" },
    secondary: { main: tokens.accent }, success: { main: tokens.success }, warning: { main: tokens.warning }, error: { main: tokens.error },
    background: { default: tokens.background, paper: tokens.surface },
    text: { primary: tokens.text, secondary: tokens.mutedText }, divider: tokens.border,
    action: { hover: tokens.hover, selected: tokens.active },
  },
  hrms: tokens,
  shape: { borderRadius: tokens.radius },
  spacing: tokens.spacing,
  typography: {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.body,
    h4: { fontSize: tokens.fontSize.heading, fontWeight: tokens.fontWeight.semibold, lineHeight: 1.4 },
    h5: { fontSize: tokens.fontSize.section, fontWeight: tokens.fontWeight.semibold },
    h6: { fontSize: tokens.fontSize.section, fontWeight: tokens.fontWeight.semibold },
    subtitle1: { fontSize: tokens.fontSize.sidebar, fontWeight: tokens.fontWeight.semibold },
    button: { fontSize: tokens.fontSize.body, fontWeight: tokens.fontWeight.semibold, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: tokens.background, color: tokens.text } },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: tokens.radius, boxShadow: "none" }, contained: { "&:hover": { boxShadow: "none" } } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: tokens.radius, backgroundColor: tokens.input, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: tokens.primary, borderWidth: 1 } } } },
    MuiCard: { styleOverrides: { root: { backgroundColor: tokens.surface, borderRadius: tokens.radius, border: `1px solid ${tokens.border}`, boxShadow: "0 1px 2px rgba(16,24,40,.04)" } } },
    MuiTableContainer: { styleOverrides: { root: { backgroundColor: tokens.surface, borderRadius: tokens.radius } } },
    MuiTableHead: { styleOverrides: { root: { "& .MuiTableCell-root": { backgroundColor: tokens.tableHeader, color: tokens.heading, fontWeight: tokens.fontWeight.semibold, fontSize: tokens.fontSize.body, textTransform: "none", borderBottom: `1px solid ${tokens.border}` } } } },
    MuiTableCell: { styleOverrides: { root: { color: tokens.text, borderColor: tokens.border, fontSize: tokens.fontSize.body, paddingTop: 12, paddingBottom: 12 } } },
    MuiTableRow: { styleOverrides: { root: { "&.MuiTableRow-hover:hover": { backgroundColor: tokens.hover } } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: tokens.radius } } },
    MuiChip: { styleOverrides: { root: { borderRadius: tokens.radius, fontWeight: tokens.fontWeight.semibold } } },
  },
});

export default createApplicationTheme();
