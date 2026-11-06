import { createTheme } from '@mui/material/styles';

const colors = {
  primary: {
    main: '#3156A3',
    dark: '#243F7C',
    light: '#5578C7',
    soft: '#EAF0FF',
    hover: '#294A91',
  },
  secondary: {
    main: '#6686C9',
    light: '#DCE7FA',
    soft: '#F1F5FC',
  },
  green: {
    main: '#269B75',
    dark: '#197B5C',
    light: '#DDF4EA',
    soft: '#EFF9F4',
  },
  neutral: {
    mainBg: '#F6F8FC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F9FAFD',
    border: '#E5EAF2',
    borderStrong: '#D5DCE8',
    textMain: '#202B3C',
    textSecondary: '#667085',
    textMuted: '#98A2B3',
  },
  semantic: {
    success: '#447f6c',
    warning: '#f6c678',
    error: '#f87064',
    info: '#a2bad9',
    successBg: '#afb1b0',
    warningBg: '#FFF8E6',
    errorBg: '#FFEBEE',
    infoBg: '#EAF3FF',
  },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      dark: colors.primary.dark,
      light: colors.primary.light,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      contrastText: '#FFFFFF',
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
    fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '1.625rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: colors.neutral.textMain,
    },
    h2: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.neutral.textMain,
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: colors.neutral.textMain,
    },
    body1: {
      fontSize: '0.8rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: colors.neutral.textMain,
    },
    body2: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: colors.neutral.textSecondary,
    },
    button: {
      fontSize: '0.855rem',
      fontWeight: 500,
      textTransform: 'none' as const,
    },
  },
  
  spacing: 6,
  
  shape: {
    borderRadius: 17,
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
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
          backgroundImage: 'none',
          borderRadius: 14,
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
          borderRadius: 14,
          boxShadow: '0 1px 3px rgba(32, 43, 60, 0.06)',
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(32, 43, 60, 0.15)',
        },
      },
    },
  },
});

export { colors };
export default theme;