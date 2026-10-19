import { createTheme } from "@mui/material/styles";
import { defaultThemeTokens } from "../strore/themeStore";

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
        contrastText: "#FFFFFF",
      },

      secondary: {
        main: tokens.indigo,
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
        fontSize: 28,
        lineHeight: "36px",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: tokens.text,
      },

      h2: {
        fontSize: 22,
        lineHeight: "30px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: tokens.text,
      },

      h3: {
        fontSize: 18,
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
        fontSize: 13,
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
      MuiCssBaseline: {
        styleOverrides: {
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
            borderRadius: tokens.radius,
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
            borderRadius: tokens.radius,
            backgroundColor: tokens.surface,

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.primary,
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
            borderRadius: tokens.cardRadius,
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadowSm,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.surface,
            borderRadius: tokens.cardRadius,
          },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: tokens.cardRadius,
            border: `1px solid ${tokens.border}`,
            overflow: "hidden",
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: "#F1F5F9",
            color: tokens.textSecondary,
          },

          head: {
            backgroundColor: tokens.tableHeader,
            color: tokens.text,
            fontWeight: 600,
          },
        },
      },

      MuiDataGrid: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            border: `1px solid ${tokens.border}`,
            backgroundColor: tokens.surface,
          },

          columnHeaders: {
            backgroundColor: tokens.tableHeader,
            color: tokens.text,
            borderBottom: `1px solid ${tokens.border}`,
          },

          columnHeader: {
            backgroundColor: "#F5F7FA",

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
            borderColor: "#EEF2F6",

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
            borderRadius: 4,
            boxShadow: tokens.shadowXl,
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${tokens.border}`,
            borderRadius: 4,
            boxShadow: tokens.shadowLg,
          },
        },
      },

      MuiPopover: {
        styleOverrides: {
          paper: {
            border: `1px solid ${tokens.border}`,
            borderRadius: 4,
            boxShadow: tokens.shadowLg,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: tokens.text,
            fontSize: 12,
            borderRadius: 4,
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
