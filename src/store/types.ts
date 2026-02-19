// ============================================================
// App Builder — Core Type Definitions (MUI-only architecture)
// ============================================================

/* ─── Canvas / Node ──────────────────────────────────────── */

export interface Position { x: number; y: number }
export interface ComponentSize { width: number; height: number }

export interface CanvasNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  sx: Record<string, unknown>;
  position: Position;
  size: ComponentSize;
  children: CanvasNode[];
  parentId: string | null;
  isContainer: boolean;
  zIndex: number;
  locked: boolean;
}

/* ─── Component registry ─────────────────────────────────── */

export type ComponentCategory =
  | 'Inputs'
  | 'Data Display'
  | 'Surfaces'
  | 'Navigation'
  | 'Feedback'
  | 'Layout';

export type PropFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'color'
  | 'slider'
  | 'list';

export interface PropField {
  name: string;
  label: string;
  type: PropFieldType;
  options?: string[];
  defaultValue: unknown;
  min?: number;
  max?: number;
  step?: number;
}

export interface ComponentMeta {
  type: string;
  displayName: string;
  category: ComponentCategory;
  icon: string;
  defaultProps: Record<string, unknown>;
  defaultSx: Record<string, unknown>;
  defaultSize: ComponentSize;
  isContainer: boolean;
  propSchema: PropField[];
}

/* ─── Device Frame ───────────────────────────────────────── */

export interface DeviceFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
}

/* ─── Viewport ───────────────────────────────────────────── */

export type ThemeMode = 'light' | 'dark';

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

/* ─── History ────────────────────────────────────────────── */

export interface HistoryEntry {
  nodes: CanvasNode[];
  timestamp: number;
}

/* ─── Store ──────────────────────────────────────────────── */

export interface BuilderState {
  /* data */
  canvasNodes: CanvasNode[];
  selectedNodeIds: Set<string>;
  viewport: ViewportState;
  themeMode: ThemeMode;
  history: HistoryEntry[];
  historyIndex: number;
  nextZIndex: number;
  deviceFrame: DeviceFrame;
  currentDesignId: string | null;
  currentDesignName: string | null;

  /* node CRUD */
  addNode: (node: CanvasNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, patch: Partial<CanvasNode>) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  updateNodeSx: (nodeId: string, sx: Record<string, unknown>) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  updateNodeSize: (nodeId: string, size: ComponentSize) => void;
  duplicateNode: (nodeId: string) => void;
  bringToFront: (nodeId: string) => void;
  sendToBack: (nodeId: string) => void;
  clearCanvas: () => void;
  setCanvasNodes: (nodes: CanvasNode[]) => void;

  /* selection */
  selectNode: (nodeId: string | null) => void;
  toggleNodeSelection: (nodeId: string) => void;
  selectAll: () => void;

  /* viewport */
  setViewport: (v: Partial<ViewportState>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  /* device frame */
  updateDeviceFrame: (patch: Partial<DeviceFrame>) => void;
  getNodesInFrame: () => CanvasNode[];

  /* theme */
  toggleTheme: () => void;

  /* history */
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  /* persistence */
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;

  /* server persistence */
  setCurrentDesign: (id: string | null, name: string | null) => void;
  getStateSnapshot: () => { canvasNodes: CanvasNode[]; deviceFrame: DeviceFrame; themeMode: ThemeMode };
  loadDesignState: (state: { canvasNodes: unknown[]; deviceFrame: unknown; themeMode: string }) => void;
}
