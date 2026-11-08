import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material/styles';
import { ThemeModeContext } from './ThemeModeContext';
import { createAppTheme } from './theme';

const THEME_MODE_KEY = 'kanbot_theme_mode';

function isPaletteMode(value: string | null): value is PaletteMode {
  return value === 'light' || value === 'dark';
}

function getStoredMode(): PaletteMode | null {
  try {
    const storedMode = window.localStorage.getItem(THEME_MODE_KEY);
    return isPaletteMode(storedMode) ? storedMode : null;
  } catch {
    return null;
  }
}

function getSystemMode(): PaletteMode {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
}

function getInitialMode(): PaletteMode {
  return getStoredMode() ?? getSystemMode();
}

function readStorageMode(value: string | null): PaletteMode | null {
  return isPaletteMode(value) ? value : null;
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PaletteMode>(getInitialMode);
  const [hasUserChoice, setHasUserChoice] = useState(
    () => getStoredMode() !== null,
  );
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const setMode = useCallback((nextMode: PaletteMode) => {
    setHasUserChoice(true);
    setModeState(nextMode);
    try {
      window.localStorage.setItem(THEME_MODE_KEY, nextMode);
    } catch {
      // The selected mode remains active for this tab if storage is unavailable.
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode;

    let themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.append(themeColor);
    }
    root.style.backgroundColor = theme.palette.background.default;
    themeColor.content = theme.palette.background.default;
  }, [mode, theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_MODE_KEY && event.key !== null) return;
      const storedMode = readStorageMode(event.newValue);
      setHasUserChoice(storedMode !== null);
      setModeState(storedMode ?? getSystemMode());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (hasUserChoice) return;

    if (typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (event: MediaQueryListEvent) => {
      setModeState(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [hasUserChoice]);

  const contextValue = useMemo(
    () => ({ mode, toggleMode, setMode }),
    [mode, setMode, toggleMode],
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
