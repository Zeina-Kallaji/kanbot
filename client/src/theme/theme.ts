import { createTheme } from "@mui/material/styles";

const colors = {
  primary: {
    main: "#2d4e94",
    dark: "#21386f",
    light: "#5578C7",
    soft: "#EAF0FF",
    hover: "#294A91",
  },
  secondary: {
    main: "#6686C9",
    light: "#DCE7FA",
    soft: "#F1F5FC",
  },
  green: {
    main: "#BDCF",
    dark: "#197B5C",
    light: "#DDF4EA",
    soft: "#EFF9F4",
  },
  neutral: {
    mainBg: "#ecf1fa",
    surface: "#FFFFFF",
    surfaceSecondary: "#F9FAFD",
    todoCard: "#ECF1FA",
    todoCardBorder: "#D3DEF0",
    border: "#E5EAF2",
    borderStrong: "#D5DCE8",
    textMain: "#202B3C",
    textSecondary: "#667085",
    textMuted: "#98A2B3",
  },
  semantic: {
    success: "#b7c7a5",
    warning: "#f6b178",
    error: "#ff6b5e",
    info: "#ffe99a",
    successBg: "#afb1b0",
    warningBg: "#FFF8E6",
    errorBg: "#FFEBEE",
    infoBg: "#EAF3FF",
  },
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary.main,
      dark: colors.primary.dark,
      light: colors.primary.light,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      contrastText: "#FFFFFF",
    },
    error: {
      main: colors.semantic.error,
      light: colors.semantic.errorBg,
    },
    warning: {
      main: colors.semantic.warning,
      light: colors.semantic.warningBg,
    },
    info: {
      main: colors.semantic.info,
      light: colors.semantic.infoBg,
    },
    success: {
      main: colors.semantic.success,
      light: colors.semantic.successBg,
    },
    background: {
      default: colors.neutral.mainBg,
      paper: colors.neutral.surface,
    },
    text: {
      primary: colors.neutral.textMain,
      secondary: colors.neutral.textSecondary,
      disabled: colors.neutral.textMuted,
    },
    divider: colors.neutral.border,
  },

  typography: {
    fontFamily:
      '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: "1.625rem",
      fontWeight: 600,
      lineHeight: 1.3,
      color: colors.neutral.textMain,
    },
    h2: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.neutral.textMain,
    },
    h3: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
      color: colors.neutral.textMain,
    },
  // h4: {
  //     fontSize: "0.875rem",
  //     fontWeight: 600,
  //     lineHeight: 1.4,
  //     color: colors.neutral.textMain,
  //   },
  //   h5: {
  //     fontSize: "0.825rem",
  //     fontWeight: 600,
  //     lineHeight: 1.3,
  //     color: colors.neutral.textMain,
  //   },
    body1: {
      fontSize: "0.8rem",
      fontWeight: 400,
      lineHeight: 1.6,
      color: colors.neutral.textMain,
    },
    body2: {
      fontSize: "0.8125rem",
      fontWeight: 400,
      lineHeight: 1.5,
      color: colors.neutral.textSecondary,
    },
    button: {
      fontSize: "0.855rem",
      fontWeight: 500,
      textTransform: "none" as const,
    },
  },

  spacing: 6,

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 13,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 5,
         
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.neutral.border}`,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(32, 43, 60, 0.06)",
          backgroundColor: colors.neutral.surface,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(32, 43, 60, 0.15)",
          // Phones: keep a small even gutter instead of MUI's 32px margin.
          [theme.breakpoints.down("sm")]: {
            margin: 12,
            width: "calc(100% - 24px)",
            maxWidth: "calc(100% - 24px)",
            maxHeight: "calc(100% - 24px)",
          },
          // Full-screen dialogs must ignore the gutter above.
          "&.MuiDialog-paperFullScreen": {
            margin: 0,
            width: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: 0,
          },
        }),
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: { flexWrap: "wrap", gap: 6 },
      },
    },

    // 16px inputs on phones stop iOS Safari from zooming in on focus.
    MuiInputBase: {
      styleOverrides: {
        input: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: { fontSize: "1rem" },
        }),
      },
    },

    // Bigger tap targets on touch screens (WCAG 2.5.8), no change for mouse.
    MuiIconButton: {
      styleOverrides: {
        root: {
          "@media (pointer: coarse)": { minWidth: 40, minHeight: 40 },
        },
      },
    },
  },
});

export { colors };
export default theme;
