// ============================================================
// ICG Layout Builder — Core Type Definitions
// ============================================================

/* ─── Layout Node Types ──────────────────────────────── */

export type LayoutNodeType =
  | 'container'
  | 'row'
  | 'column'
  | 'flex-container'
  | 'component'
  | 'content';

export type ContentType = 'heading' | 'display-heading' | 'paragraph' | 'lead';

export interface LayoutNode {
  id: string;
  type: LayoutNodeType;
  /** ICG component type — only for type='component' */
  componentType?: string;
  /** Content subtype — only for type='content' */
  contentType?: ContentType;
  /** ICG-allowed props */
  props: Record<string, unknown>;
  /** ICG CSS classes applied to this node */
  icgClasses: string[];
  /** Ordered child nodes */
  children: LayoutNode[];
  /** Parent node ID (null for root-level nodes) */
  parentId: string | null;
}

/* ─── Component Registry Types ───────────────────────── */

export type ComponentCategory =
  | 'Inputs'
  | 'Data Display'
  | 'Surfaces'
  | 'Navigation'
  | 'Feedback';

export type PropFieldType = 'text' | 'number' | 'select' | 'boolean' | 'color' | 'list';

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

export interface ComponentDefinition {
  type: string;
  displayName: string;
  category: ComponentCategory;
  icon: string;
  defaultProps: Record<string, unknown>;
  propSchema: PropField[];
  defaultSize: { width: number; height: number };
  /** Whether this component can nest children (e.g. Card, Section) */
  hasChildren?: boolean;
  /** Maps to a codegen strategy key */
  codegenStrategy: string;
}

export interface ContentDefinition {
  contentType: ContentType;
  displayName: string;
  icon: string;
  defaultProps: Record<string, unknown>;
  propSchema: PropField[];
}

/* ─── Command / History Types ────────────────────────── */

export interface Command {
  type: string;
  description: string;
  timestamp: number;
  execute: (tree: LayoutNode[]) => LayoutNode[];
  undo: (tree: LayoutNode[]) => LayoutNode[];
}

/* ─── Store Types ────────────────────────────────────── */

export interface BuilderState {
  /* Layout data */
  layoutTree: LayoutNode[];
  selectedNodeId: string | null;
  themeMode: 'light' | 'dark';

  /* History */
  commandHistory: Command[];
  historyIndex: number;

  /* Persistence */
  designId: string | null;
  designName: string | null;
  lastSaved: number | null;
  isDirty: boolean;

  /* Actions */
  executeCommand: (cmd: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  selectNode: (nodeId: string | null) => void;
  toggleTheme: () => void;
  setDesignId: (id: string | null) => void;
  setDesignName: (name: string) => void;
  setLayoutTree: (tree: LayoutNode[]) => void;
  markSaved: () => void;
  getSelectedNode: () => LayoutNode | null;
}

/* ─── Drag & Drop Data ───────────────────────────────── */

export interface DragData {
  source: 'palette' | 'canvas';
  nodeType: LayoutNodeType;
  /** For component drags */
  componentType?: string;
  /** For content drags */
  contentType?: ContentType;
  /** For canvas drags — existing node ID */
  nodeId?: string;
}

/* ─── Persistence ────────────────────────────────────── */

export interface SaveFile {
  id?: string;
  version: string;
  schemaVersion: number;
  designName: string;
  createdAt: string;
  updatedAt: string;
  themeMode: 'light' | 'dark';
  layoutTree: LayoutNode[];
}
