import { useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';

/**
 * Hook that auto-saves to localStorage every 30 seconds.
 */
export function useAutoSave(intervalMs = 30_000): void {
  const saveToLocalStorage = useBuilderStore((s) => s.saveToLocalStorage);

  useEffect(() => {
    const id = setInterval(() => {
      saveToLocalStorage();
    }, intervalMs);
    return () => clearInterval(id);
  }, [saveToLocalStorage, intervalMs]);
}
