import { useEffect, useCallback } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { updateDesign } from '../api/designsApi';

export function useKeyboardShortcuts(): void {
  const store = useBuilderStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;

      // Undo
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') { e.preventDefault(); store.undo(); return; }
      // Redo
      if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) { e.preventDefault(); store.redo(); return; }
      // Save — quick save to localStorage + auto-update server if design is open
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        store.saveToLocalStorage();
        const { currentDesignId } = useBuilderStore.getState();
        if (currentDesignId) {
          const state = store.getStateSnapshot();
          updateDesign(currentDesignId, { state }).catch(() => {});
        }
        return;
      }
      // Select all
      if (e.ctrlKey && e.key === 'a') { e.preventDefault(); store.selectAll(); return; }
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedNodeIds.size > 0) {
        e.preventDefault();
        store.selectedNodeIds.forEach((id) => store.removeNode(id));
        return;
      }
      // Duplicate
      if (e.ctrlKey && e.key === 'd' && store.selectedNodeIds.size > 0) {
        e.preventDefault();
        store.selectedNodeIds.forEach((id) => store.duplicateNode(id));
        return;
      }
      // Escape
      if (e.key === 'Escape') { store.selectNode(null); return; }
      // Zoom
      if (e.ctrlKey && e.key === '=') { e.preventDefault(); store.zoomIn(); return; }
      if (e.ctrlKey && e.key === '-') { e.preventDefault(); store.zoomOut(); return; }
      if (e.ctrlKey && e.key === '0') { e.preventDefault(); store.resetZoom(); return; }
    },
    [store],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
