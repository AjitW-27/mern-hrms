import { colors as themeColors } from "./designTokens";
import { createTheme } from "@mui/material/styles";
import { defaultThemeTokens, createCssVariables } from "./designTokens";

export const createApplicationTheme = (
  tokens = defaultThemeTokens
) =>
  createTheme({
    palette: {
      mode: "light",

      primary: {
        main: tokens.primary,
        dark: tokens.primaryDark,
        light: tokens.primaryLight,
        contrastText: tokens.cardBg,
      },

      secondary: {
        main: tokens.secondaryDark,
        light: tokens.indigoLight,
      },

      success: {
        main: tokens.success,
      },

      warning: {
        main: tokens.warning,
      },

      error: {
        main: tokens.error,
      },

      info: {
        main: tokens.info,
      },

      background: {
        default: tokens.background,
        paper: tokens.surface,
      },

      text: {
        primary: tokens.text,
        secondary: tokens.textSecondary,
        disabled: tokens.mutedText,
      },

      divider: tokens.border,

      action: {
        hover: tokens.hover,
        selected: tokens.active,
        focus: tokens.primaryLight,
      },
    },

    hrms: tokens,

    shape: {
      borderRadius: tokens.radius,
    },

    spacing: tokens.spacing,

    typography: {
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize.body,

      h1: {
        fontSize: 24,
        lineHeight: "36px",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: tokens.text,
      },

      h2: {
        fontSize: 16,
        lineHeight: "24px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: tokens.text,
      },

      h3: {
        fontSize: 16,
        lineHeight: "26px",
        fontWeight: 600,
        color: tokens.slate700,
      },

      h4: {
        fontSize: 16,
        lineHeight: "24px",
        fontWeight: 600,
        color: tokens.slate700,
      },

      body1: {
        fontSize: 14,
        lineHeight: "22px",
        color: tokens.textSecondary,
      },

      body2: {
        fontSize: 14,
        lineHeight: "20px",
        color: tokens.textSecondary,
      },

      caption: {
        fontSize: 12,
        lineHeight: "16px",
        color: tokens.mutedText,
      },

      button: {
        fontSize: 14,
        fontWeight: 600,
        textTransform: "none",
      },
    },

    components: {
      MuiIconButton: { styleOverrides: { root: { borderRadius: "4px" } } },
      MuiFab: { styleOverrides: { root: { borderRadius: "4px" } } },
      MuiBadge: { styleOverrides: { badge: { borderRadius: "4px" } } },
      MuiPaginationItem: { styleOverrides: { root: { borderRadius: "4px" } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: "4px" }, bar: { borderRadius: "4px" } } },
      MuiCssBaseline: {
        styleOverrides: {
          ":root": createCssVariables(tokens),
          body: {
            backgroundColor: tokens.background,
            color: tokens.text,
          },

          "*": {
            boxSizing: "border-box",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: "4px",
            boxShadow: "none",
            fontWeight: 600,

            "&:focus-visible": {
              outline: `3px solid ${tokens.primaryLight}`,
              outlineOffset: 2,
            },
          },

          containedPrimary: {
            background: tokens.gradButton,

            "&:hover": {
              background: tokens.primaryDark,
              boxShadow: tokens.shadowMd,
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: "4px",
            backgroundColor: tokens.surface,

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.border,
              borderWidth: "1px",
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.border,
              borderWidth: "1px",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.border,
              borderWidth: "1px",
              boxShadow: `0 0 0 3px ${tokens.primaryLight}`,
            },

            "&.Mui-focused": {
              boxShadow: "none",
              backgroundColor: tokens.surface,
            },

            "&:hover": {
              backgroundColor: tokens.surface,
            },
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: tokens.surface,
            },

            "&.Mui-focused": {
              boxShadow: "none",
            },
          },

          input: {
            "&:focus": {
              outline: "none",
            },
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.surface,
            borderRadius: "4px",
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadowSm,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.surface,
            borderRadius: "4px",
          },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: "4px",
            border: `1px solid ${tokens.border}`,
            overflowX: "auto",
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: tokens.border,
            color: tokens.textSecondary,
            padding: "12px 16px",
          },

          head: {
            backgroundColor: tokens.tableHeader,
            color: tokens.text,
            fontWeight: 600,
            fontSize: 13,
          },
        },
      },

      MuiTableRow: { styleOverrides: { root: { height: 64, "&.MuiTableRow-hover:hover": { backgroundColor: tokens.hover } }, head: { height: "auto" } } },

      MuiDataGrid: {
        styleOverrides: {
          root: {
            borderRadius: "4px",
            border: `1px solid ${tokens.border}`,
            backgroundColor: tokens.surface,
          },

          columnHeaders: {
            backgroundColor: tokens.tableHeader,
            color: tokens.text,
            borderBottom: `1px solid ${tokens.border}`,
          },

          columnHeader: {
            backgroundColor: themeColors.pageBg,

            "&:focus": {
              outline: "none",
            },

            "&:focus-within": {
              outline: "none",
            },
          },

          columnHeaderTitle: {
            fontWeight: 600,
          },

          cell: {
            borderColor: themeColors.tableHeader,

            "&:focus": {
              outline: "none",
            },

            "&:focus-within": {
              outline: "none",
            },
          },

          footerContainer: {
            borderTop: `1px solid ${tokens.border}`,
          },

          toolbarContainer: {
            backgroundColor: tokens.surface,
            borderBottom: `1px solid ${tokens.border}`,
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "4px",
            boxShadow: tokens.shadowXl,
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${tokens.border}`,
            borderRadius: "4px",
            boxShadow: tokens.shadowLg,
          },
        },
      },

      MuiPopover: {
        styleOverrides: {
          paper: {
            border: `1px solid ${tokens.border}`,
            borderRadius: "4px",
            boxShadow: tokens.shadowLg,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "4px",
            fontWeight: 600,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: tokens.text,
            fontSize: 12,
            borderRadius: "4px",
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            "&.Mui-focused": {
              color: tokens.textSecondary,
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          select: {
            "&:focus": {
              backgroundColor: "transparent",
            },
          },
        },
      },
    },
  });

export default createApplicationTheme();
