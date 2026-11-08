import { Box, IconButton, Tooltip } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from '../theme/useThemeMode';

interface ThemeToggleProps {
  variant?: 'onHeader' | 'default';
  sx?: object;
}

export default function ThemeToggle({
  variant = 'default',
  sx,
}: ThemeToggleProps) {
  const { mode, toggleMode } = useThemeMode();
  const isHeader = variant === 'onHeader';
  const title =
    mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <Tooltip title={title}>
      <IconButton
        aria-label="Toggle dark mode"
        aria-pressed={mode === 'dark'}
        onClick={toggleMode}
        sx={[
          {
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: '8px',
            color: isHeader ? 'common.white' : 'text.primary',
            border: '1px solid',
            borderColor: isHeader
              ? 'custom.pageHeaderButtonBorder'
              : 'divider',
            '&:hover': {
              bgcolor: isHeader ? 'custom.pageHeaderHover' : 'action.hover',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'custom.focus',
              outlineOffset: 2,
            },
            '@media (prefers-reduced-motion: no-preference)': {
              '& .ThemeToggle-icon': {
                transition: 'opacity 200ms ease, transform 200ms ease',
              },
            },
            '@media (prefers-reduced-motion: reduce)': {
              '& .ThemeToggle-icon': { transition: 'none' },
            },
          },
          sx ?? {},
        ]}
      >
        <Box sx={{ position: 'relative', width: 22, height: 22 }}>
          <DarkModeOutlined
            className="ThemeToggle-icon"
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              fontSize: 22,
              opacity: mode === 'light' ? 1 : 0,
              transform:
                mode === 'light' ? 'rotate(0deg)' : 'rotate(90deg)',
            }}
          />
          <LightModeOutlined
            className="ThemeToggle-icon"
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              fontSize: 22,
              opacity: mode === 'dark' ? 1 : 0,
              transform:
                mode === 'dark' ? 'rotate(0deg)' : 'rotate(-90deg)',
            }}
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
}

export function FloatingThemeToggle() {
  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        top: 1.5,
        right: 1.5,
        zIndex: theme.zIndex.appBar,
      })}
    >
      <ThemeToggle />
    </Box>
  );
}
