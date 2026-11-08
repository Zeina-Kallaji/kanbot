import { createContext } from 'react';
import type { PaletteMode } from '@mui/material/styles';

export interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(
  null,
);
