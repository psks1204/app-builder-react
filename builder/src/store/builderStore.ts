// ============================================================
// Zustand Store — Builder state management
// ============================================================
import { create } from 'zustand';
import type { BuilderState, Command, LayoutNode } from './types';
import { findNode } from '../engine/layoutTree';

export const useBuilderStore = create<BuilderState>((set, get) => ({
  /* ─── Data ──────────────────────────────────────────── */
  layoutTree: [],
  selectedNodeId: null,
  themeMode: 'light',

  /* ─── History ───────────────────────────────────────── */
  commandHistory: [],
  historyIndex: -1,

  /* ─── Persistence ───────────────────────────────────── */
  designId: null,
  designName: null,
  lastSaved: null,
  isDirty: false,

  /* ─── Execute a command (apply + push to history) ──── */
  executeCommand: (cmd: Command) => {
    const state = get();
    const newTree = cmd.execute(state.layoutTree);

    // Discard any redo history beyond current index
    const newHistory = state.commandHistory.slice(0, state.historyIndex + 1);
    newHistory.push(cmd);

    set({
      layoutTree: newTree,
      commandHistory: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  /* ─── Undo ──────────────────────────────────────────── */
  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;

    const cmd = state.commandHistory[state.historyIndex];
    const newTree = cmd.undo(state.layoutTree);

    set({
      layoutTree: newTree,
      historyIndex: state.historyIndex - 1,
      isDirty: true,
    });
  },

  /* ─── Redo ──────────────────────────────────────────── */
  redo: () => {
    const state = get();
    if (state.historyIndex >= state.commandHistory.length - 1) return;

    const nextCmd = state.commandHistory[state.historyIndex + 1];
    const newTree = nextCmd.execute(state.layoutTree);

    set({
      layoutTree: newTree,
      historyIndex: state.historyIndex + 1,
      isDirty: true,
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().commandHistory.length - 1,

  /* ─── Selection ─────────────────────────────────────── */
  selectNode: (nodeId: string | null) => set({ selectedNodeId: nodeId }),

  getSelectedNode: (): LayoutNode | null => {
    const state = get();
    if (!state.selectedNodeId) return null;
    return findNode(state.layoutTree, state.selectedNodeId);
  },

  /* ─── Theme ─────────────────────────────────────────── */
  toggleTheme: () =>
    set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),

  /* ─── Persistence helpers ───────────────────────────── */
  setDesignId: (id: string | null) => set({ designId: id }),
  setDesignName: (name: string) => set({ designName: name }),
  setLayoutTree: (tree: LayoutNode[]) =>
    set({ layoutTree: tree, commandHistory: [], historyIndex: -1, isDirty: false }),
  markSaved: () => set({ lastSaved: Date.now(), isDirty: false }),
}));
