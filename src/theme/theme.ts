import { createTheme } from '@mui/material/styles';
import type { ThemeMode } from '../store/types';

export const buildTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            background: { default: '#0a0a0a', paper: '#141414' },
            divider: 'rgba(255,255,255,0.08)',
          }
        : {
            background: { default: '#f5f5f5', paper: '#ffffff' },
            divider: 'rgba(0,0,0,0.08)',
          }),
    },
    typography: { fontSize: 13 },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          'html, body, #root': { height: '100%', margin: 0 },
          '::-webkit-scrollbar': { width: 6, height: 6 },
          '::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            borderRadius: 3,
          },
        },
      },
      MuiButton: { defaultProps: { size: 'small', disableElevation: true } },
      MuiIconButton: { defaultProps: { size: 'small' } },
      MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
      MuiTooltip: { defaultProps: { arrow: true, enterDelay: 400 } },
    },
  });
