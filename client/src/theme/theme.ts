import { createTheme, type PaletteMode } from '@mui/material/styles';
import type {} from './theme-augmentation';

const palettes = {
  light: {
    primary: {
      main: '#2d4e94',
      dark: '#21386f',
      light: '#5578C7',
      contrastText: '#FFFFFF',
    },
    secondary: { main: '#6686C9', light: '#DCE7FA', contrastText: '#FFFFFF' },
    success: { main: '#b7c7a5', light: '#afb1b0' },
    warning: { main: '#f6b178', light: '#FFF8E6' },
    error: { main: '#ff6b5e', light: '#FFEBEE' },
    info: { main: '#ffe99a', light: '#EAF3FF' },
    background: { default: '#ecf1fa', paper: '#FFFFFF' },
    text: {
      primary: '#202B3C',
      secondary: '#667085',
      disabled: '#98A2B3',
    },
    divider: '#E5EAF2',
    action: { hover: 'rgba(0,0,0,.04)' },
    custom: {
      primarySoft: '#EAF0FF',
      primarySoftHover: '#E0E7FF',
      surfaceSecondary: '#F9FAFD',
      todoCard: '#ECF1FA',
      todoCardBorder: '#D3DEF0',
      borderStrong: '#D5DCE8',
      textMuted: '#98A2B3',
      pageHeader: '#4b66a0',
      pageHeaderBorder: 'rgba(255,255,255,.2)',
      pageHeaderButtonBorder: 'rgba(255,255,255,.35)',
      pageHeaderHover: 'rgba(255,255,255,.12)',
      sectionHeader: '#b9c9ee',
      sprintSelected: '#607cbd',
      sprintMuted: '#c6d8fa',
      focus: '#3156A3',
      typeTaskBg: '#cbdfd0',
      typeTaskBorder: '#bdbdbd',
      typeTaskText: '#202B3C',
      typeBugBg: '#fac7e0',
      typeBugBorder: '#bdbdbd',
      typeBugText: '#202B3C',
      typeStoryBg: '#d6caf6',
      typeStoryBorder: '#bdbdbd',
      typeStoryText: '#202B3C',
      typeTaskIcon: '#3D674B',
      typeBugIcon: '#A13F39',
      typeStoryIcon: '#5D4C7B',
      priorityUrgentBg: '#fdb8b4',
      priorityUrgentBorder: 'transparent',
      priorityUrgent: '#A64F49',
      priorityUrgentText: '#202B3C',
      priorityHighBg: '#f6b178',
      priorityHighBorder: 'transparent',
      priorityHighText: 'rgba(0,0,0,0.87)',
      priorityHigh: '#a44b12',
      priorityMediumBg: '#ffe99a',
      priorityMediumBorder: 'transparent',
      priorityMediumText: 'rgba(0,0,0,0.87)',
      priorityMedium: '#98600d',
      priorityLowBg: 'rgba(0,0,0,0.08)',
      priorityLowBorder: 'transparent',
      priorityLowText: '#202B3C',
      priorityLow: '#555555',
    },
  },
  dark: {
    primary: {
      main: '#6F93E6',
      dark: '#4F73C9',
      light: '#A9BFF2',
      contrastText: '#0B1220',
    },
    secondary: { main: '#8FA8DC', light: '#2A3A6B', contrastText: '#0B1220' },
    success: { main: '#7FD1A0', light: '#16322A', contrastText: '#0B1220' },
    warning: { main: '#F6B178', light: '#3A2D17', contrastText: '#0B1220' },
    error: { main: '#FF8A8A', light: '#3B1F25', contrastText: '#0B1220' },
    info: { main: '#9DB8F5', light: '#1E2C46', contrastText: '#0B1220' },
    background: { default: '#0F1623', paper: '#172033' },
    text: {
      primary: '#E6EAF2',
      secondary: '#A3AEC2',
      disabled: '#7C889E',
    },
    divider: '#26324A',
    action: {
      hover: 'rgba(255,255,255,.06)',
      selected: 'rgba(255,255,255,.10)',
    },
    custom: {
      primarySoft: '#22305A',
      primarySoftHover: '#2A3A6B',
      surfaceSecondary: '#1B263B',
      todoCard: '#1E2A42',
      todoCardBorder: '#2E3D5C',
      borderStrong: '#34435F',
      textMuted: '#7C889E',
      pageHeader: '#1E2B4A',
      pageHeaderBorder: 'rgba(255,255,255,.08)',
      pageHeaderButtonBorder: 'rgba(255,255,255,.35)',
      pageHeaderHover: 'rgba(255,255,255,.12)',
      sectionHeader: '#26365C',
      sprintSelected: '#4F73C9',
      sprintMuted: '#2A3A6B',
      focus: '#8FB0FF',
      typeTaskBg: '#2F5A41',
      typeTaskBorder: '#4C8062',
      typeTaskText: '#E6EAF2',
      typeBugBg: '#6B2F4B',
      typeBugBorder: '#98506F',
      typeBugText: '#E6EAF2',
      typeStoryBg: '#4A3C78',
      typeStoryBorder: '#7161A4',
      typeStoryText: '#E6EAF2',
      typeTaskIcon: '#9BE0B5',
      typeBugIcon: '#F5A3C4',
      typeStoryIcon: '#CDBBFF',
      priorityUrgentBg: '#3B1F25',
      priorityUrgentBorder: '#78444A',
      priorityUrgent: '#E28B83',
      priorityUrgentText: '#F3CAC6',
      priorityHighBg: '#3A2D17',
      priorityHighBorder: '#67502D',
      priorityHighText: '#F6D6B2',
      priorityHigh: '#FFA66B',
      priorityMediumBg: '#3A321C',
      priorityMediumBorder: '#64592F',
      priorityMediumText: '#F2DFAD',
      priorityMedium: '#F0C25E',
      priorityLowBg: '#2A3446',
      priorityLowBorder: '#45536B',
      priorityLowText: '#C2CBD9',
      priorityLow: '#A3AEC2',
    },
  },
} as const;

export function createAppTheme(mode: PaletteMode) {
  const palette = palettes[mode];

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily:
        '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontSize: '1.625rem',
        fontWeight: 600,
        lineHeight: 1.3,
        color: palette.text.primary,
      },
      h2: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: palette.text.primary,
      },
      h3: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
        color: palette.text.primary,
      },
      body1: {
        fontSize: '0.8rem',
        fontWeight: 400,
        lineHeight: 1.6,
        color: palette.text.primary,
      },
      body2: {
        fontSize: '0.8125rem',
        fontWeight: 400,
        lineHeight: 1.5,
        color: palette.text.secondary,
      },
      button: {
        fontSize: '0.855rem',
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    spacing: 6,
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          ':root': {
            colorScheme: mode,
          },
          body: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
          '::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.background.default,
          },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.custom.borderStrong,
          },
          '::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.custom.textMuted,
          },
          '::selection': {
            backgroundColor: theme.palette.custom.primarySoft,
            color: theme.palette.text.primary,
          },
          'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus':
            mode === 'dark'
              ? {
                  WebkitTextFillColor: theme.palette.text.primary,
                  WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                  caretColor: theme.palette.text.primary,
                }
              : {},
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 13,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none', borderRadius: 5 },
        },
        defaultProps: { elevation: 0 },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 12,
            boxShadow:
              mode === 'dark'
                ? 'none'
                : '0 1px 3px rgba(32, 43, 60, 0.06)',
            backgroundColor: theme.palette.background.paper,
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: 10,
            boxShadow:
              mode === 'dark'
                ? '0 8px 24px rgba(0, 0, 0, 0.35)'
                : '0 8px 24px rgba(32, 43, 60, 0.15)',
            [theme.breakpoints.down('sm')]: {
              margin: 12,
              width: 'calc(100% - 24px)',
              maxWidth: 'calc(100% - 24px)',
              maxHeight: 'calc(100% - 24px)',
            },
            '&.MuiDialog-paperFullScreen': {
              margin: 0,
              width: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: 0,
            },
          }),
        },
      },
      MuiDialogActions: {
        styleOverrides: { root: { flexWrap: 'wrap', gap: 6 } },
      },
      MuiInputBase: {
        styleOverrides: {
          input: ({ theme }) => ({
            [theme.breakpoints.down('sm')]: { fontSize: '1rem' },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '@media (pointer: coarse)': { minWidth: 40, minHeight: 40 },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: ({ theme }) =>
            mode === 'dark'
              ? {
                  borderColor: theme.palette.divider,
                }
              : {},
          root: ({ theme }) =>
            mode === 'dark'
              ? {
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.text.secondary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                }
              : {},
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: ({ theme }) =>
            mode === 'dark'
              ? {
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }
              : {},
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: ({ theme }) =>
            mode === 'dark'
              ? {
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }
              : {},
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) =>
            mode === 'dark'
              ? {
                  backgroundColor: theme.palette.custom.borderStrong,
                  color: theme.palette.text.primary,
                }
              : {},
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) =>
            mode === 'dark' ? { borderColor: theme.palette.divider } : {},
        },
      },
      MuiAlert: {
        styleOverrides: {
            root: ({ theme, ownerState }) => {
              if (mode !== 'dark' || ownerState.variant !== 'standard') {
                return {};
              }

              const severity = ownerState.severity ?? 'info';
              return {
                backgroundColor: theme.palette[severity].light,
                color: theme.palette.text.primary,
                '& .MuiAlert-icon': {
                  color: theme.palette[severity].main,
                },
              };
            },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) =>
            mode === 'dark'
              ? {
                  '&.MuiChip-colorDefault': {
                    backgroundColor: theme.palette.custom.surfaceSecondary,
                    color: theme.palette.text.primary,
                  },
                }
              : {},
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) =>
            mode === 'dark' ? { borderColor: theme.palette.divider } : {},
        },
      },
    },
  });
}
