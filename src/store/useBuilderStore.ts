import { create } from 'zustand';
import type { BuilderState, CanvasNode, DeviceFrame, Position, ComponentSize, HistoryEntry } from './types';
import { removeNodeFromTree, updateNodeInTree, cloneTree, flattenTree } from '../utils/treeUtils';
import { generateId } from '../utils/idGenerator';

const DEFAULT_FRAME: DeviceFrame = { x: 100, y: 80, width: 1280, height: 800, bgColor: '#ffffff' };

const STORAGE_KEY = 'app-builder-project';
const MAX_HISTORY = 50;
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;

export const useBuilderStore = create<BuilderState>((set, get) => ({
  canvasNodes: [],
  selectedNodeIds: new Set<string>(),
  viewport: { zoom: 1, panX: 0, panY: 0 },
  themeMode: 'dark',
  history: [],
  historyIndex: -1,
  nextZIndex: 1,
  deviceFrame: { ...DEFAULT_FRAME },
  currentDesignId: null,
  currentDesignName: null,

  /* ─── Node CRUD ──────────────────────────────────────── */

  addNode: (node: CanvasNode) => {
    const state = get();
    state.pushHistory();
    set({
      canvasNodes: [...state.canvasNodes, { ...node, zIndex: state.nextZIndex }],
      nextZIndex: state.nextZIndex + 1,
    });
  },

  removeNode: (nodeId: string) => {
    const state = get();
    state.pushHistory();
    const next = new Set(state.selectedNodeIds);
    next.delete(nodeId);
    set({
      canvasNodes: removeNodeFromTree(state.canvasNodes, nodeId),
      selectedNodeIds: next,
    });
  },

  updateNode: (nodeId: string, patch: Partial<CanvasNode>) => {
    set({
      canvasNodes: updateNodeInTree(get().canvasNodes, nodeId, (n) => ({ ...n, ...patch })),
    });
  },

  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => {
    set({
      canvasNodes: updateNodeInTree(get().canvasNodes, nodeId, (n) => ({
        ...n,
        props: { ...n.props, ...props },
      })),
    });
  },

  updateNodeSx: (nodeId: string, sx: Record<string, unknown>) => {
    set({
      canvasNodes: updateNodeInTree(get().canvasNodes, nodeId, (n) => ({
        ...n,
        sx: { ...n.sx, ...sx },
      })),
    });
  },

  updateNodePosition: (nodeId: string, position: Position) => {
    set({
      canvasNodes: updateNodeInTree(get().canvasNodes, nodeId, (n) => ({ ...n, position })),
    });
  },

  updateNodeSize: (nodeId: string, size: ComponentSize) => {
    set({
      canvasNodes: updateNodeInTree(get().canvasNodes, nodeId, (n) => ({ ...n, size })),
    });
  },

  duplicateNode: (nodeId: string) => {
    const state = get();
    const all = flattenTree(state.canvasNodes);
    const original = all.find((n) => n.id === nodeId);
    if (!original) return;
    state.pushHistory();

    const cloned: CanvasNode = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId(),
      position: { x: original.position.x + 20, y: original.position.y + 20 },
      zIndex: state.nextZIndex,
      parentId: null,
      children: [],
    };
    set({
      canvasNodes: [...state.canvasNodes, cloned],
      nextZIndex: state.nextZIndex + 1,
      selectedNodeIds: new Set([cloned.id]),
    });
  },

  bringToFront: (nodeId: string) => {
    const state = get();
    set({
      canvasNodes: updateNodeInTree(state.canvasNodes, nodeId, (n) => ({
        ...n,
        zIndex: state.nextZIndex,
      })),
      nextZIndex: state.nextZIndex + 1,
    });
  },

  sendToBack: (nodeId: string) => {
    set({
      canvasNodes: updateNodeInTree(get().canvasNodes, nodeId, (n) => ({
        ...n,
        zIndex: 0,
      })),
    });
  },

  clearCanvas: () => {
    const state = get();
    state.pushHistory();
    set({ canvasNodes: [], selectedNodeIds: new Set(), nextZIndex: 1 });
  },

  setCanvasNodes: (nodes: CanvasNode[]) => {
    set({ canvasNodes: nodes });
  },

  /* ─── Selection ──────────────────────────────────────── */

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeIds: nodeId ? new Set([nodeId]) : new Set() });
  },

  toggleNodeSelection: (nodeId: string) => {
    const next = new Set(get().selectedNodeIds);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    set({ selectedNodeIds: next });
  },

  selectAll: () => {
    const ids = get().canvasNodes.map((n) => n.id);
    set({ selectedNodeIds: new Set(ids) });
  },

  /* ─── Viewport ───────────────────────────────────────── */

  setViewport: (v) => {
    set({ viewport: { ...get().viewport, ...v } });
  },

  zoomIn: () => {
    const { zoom } = get().viewport;
    set({ viewport: { ...get().viewport, zoom: Math.min(zoom + ZOOM_STEP, MAX_ZOOM) } });
  },

  zoomOut: () => {
    const { zoom } = get().viewport;
    set({ viewport: { ...get().viewport, zoom: Math.max(zoom - ZOOM_STEP, MIN_ZOOM) } });
  },

  resetZoom: () => {
    set({ viewport: { zoom: 1, panX: 0, panY: 0 } });
  },

  /* ─── Device Frame ───────────────────────────────────── */

  updateDeviceFrame: (patch: Partial<DeviceFrame>) => {
    set({ deviceFrame: { ...get().deviceFrame, ...patch } });
  },

  getNodesInFrame: () => {
    const { canvasNodes, deviceFrame: f } = get();
    return canvasNodes.filter((n) => {
      const nx = n.position.x;
      const ny = n.position.y;
      const nRight = nx + n.size.width;
      const nBottom = ny + n.size.height;
      // Node overlaps the frame at all
      return nx < f.x + f.width && nRight > f.x && ny < f.y + f.height && nBottom > f.y;
    });
  },

  /* ─── Theme ──────────────────────────────────────────── */

  toggleTheme: () => {
    set({ themeMode: get().themeMode === 'dark' ? 'light' : 'dark' });
  },

  /* ─── History ────────────────────────────────────────── */

  pushHistory: () => {
    const { canvasNodes, history, historyIndex } = get();
    const entry: HistoryEntry = { nodes: cloneTree(canvasNodes), timestamp: Date.now() };
    const trimmed = history.slice(0, historyIndex + 1);
    const next = [...trimmed, entry].slice(-MAX_HISTORY);
    set({ history: next, historyIndex: next.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;
    set({
      canvasNodes: cloneTree(history[historyIndex].nodes),
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const ni = historyIndex + 1;
    if (ni + 1 < history.length) {
      set({ canvasNodes: cloneTree(history[ni + 1].nodes), historyIndex: ni + 1 });
    }
  },

  /* ─── Persistence ────────────────────────────────────── */

  saveToLocalStorage: () => {
    const { canvasNodes, themeMode } = get();
    const { deviceFrame } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ canvasNodes, themeMode, deviceFrame }));
  },

  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      // Sanitize nodes loaded from older schema versions
      const sanitized = (data.canvasNodes ?? []).map((n: Record<string, unknown>) => ({
        ...n,
        sx: (n.sx as Record<string, unknown>) ?? {},
        zIndex: (n.zIndex as number) ?? 0,
        locked: (n.locked as boolean) ?? false,
        children: (n.children as unknown[]) ?? [],
        parentId: n.parentId ?? null,
        isContainer: (n.isContainer as boolean) ?? false,
      }));
      set({
        canvasNodes: sanitized,
        themeMode: data.themeMode ?? 'dark',
        deviceFrame: data.deviceFrame ?? { ...DEFAULT_FRAME },
        selectedNodeIds: new Set(),
        history: [],
        historyIndex: -1,
      });
    } catch {
      console.warn('Failed to load from localStorage');
    }
  },

  /* ─── Server persistence ─────────────────────────────── */

  setCurrentDesign: (id, name) => {
    set({ currentDesignId: id, currentDesignName: name });
  },

  getStateSnapshot: () => {
    const { canvasNodes, deviceFrame, themeMode } = get();
    return { canvasNodes, deviceFrame, themeMode };
  },

  loadDesignState: (state) => {
    const sanitized = ((state.canvasNodes as Record<string, unknown>[]) ?? []).map((n) => ({
      ...n,
      sx: (n.sx as Record<string, unknown>) ?? {},
      zIndex: (n.zIndex as number) ?? 0,
      locked: (n.locked as boolean) ?? false,
      children: (n.children as unknown[]) ?? [],
      parentId: n.parentId ?? null,
      isContainer: (n.isContainer as boolean) ?? false,
    }));
    set({
      canvasNodes: sanitized as CanvasNode[],
      themeMode: (state.themeMode as 'light' | 'dark') ?? 'dark',
      deviceFrame: (state.deviceFrame as DeviceFrame) ?? { ...DEFAULT_FRAME },
      selectedNodeIds: new Set(),
      history: [],
      historyIndex: -1,
      nextZIndex: sanitized.reduce((m: number, n: Record<string, unknown>) => Math.max(m, (n.zIndex as number) ?? 0), 0) + 1,
    });
  },
}));
