import { useTheme } from '@mui/material/styles';
import { Toaster } from 'sonner';
import { useThemeMode } from '../../theme/useThemeMode';

export default function ThemedToaster() {
  const { mode } = useThemeMode();
  const theme = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={mode}
      toastOptions={{
        duration: 4000,
        style: {
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px',
          fontSize: '14px',
        },
      }}
    />
  );
}
