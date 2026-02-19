import React, { useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './theme/theme';
import MainLayout from './components/layout/MainLayout';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoSave } from './hooks/useAutoSave';
import { useBuilderStore } from './store/useBuilderStore';

const App: React.FC = () => {
  const themeMode = useBuilderStore((s) => s.themeMode);
  const loadFromLocalStorage = useBuilderStore((s) => s.loadFromLocalStorage);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  useKeyboardShortcuts();
  useAutoSave();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout />
    </ThemeProvider>
  );
};

export default App;
