// ============================================================
// Layout Constraints — Hierarchy rules for Grid + Flex modes
// ============================================================
import type { LayoutNodeType } from '../store/types';

/**
 * Defines which child node types are allowed under each parent type.
 * This is the single source of truth for layout hierarchy enforcement.
 */
export const ALLOWED_CHILDREN: Record<LayoutNodeType | 'root', LayoutNodeType[]> = {
  root:              ['container', 'flex-container'],
  'container':       ['row', 'flex-container'],
  'row':             ['column'],
  'column':          ['component', 'content', 'container', 'row', 'flex-container'],
  'flex-container':  ['component', 'content', 'container', 'row', 'flex-container'],
  'component':       [],   // leaf — no children
  'content':         [],   // leaf — no children
};

/**
 * Human-readable labels for layout nodes (used in UI).
 */
export const NODE_LABELS: Record<LayoutNodeType, string> = {
  'container':       'Container',
  'row':             'Row',
  'column':          'Column',
  'flex-container':  'Flex Container',
  'component':       'Component',
  'content':         'Content',
};

/**
 * Placeholder text shown inside empty layout nodes.
 */
export const PLACEHOLDER_TEXT: Partial<Record<LayoutNodeType, string>> = {
  'container':       'Drop a Row or Flex here',
  'row':             'Drop Columns here',
  'column':          'Drop elements here',
  'flex-container':  'Drop elements here',
};

/**
 * Layout items available in the palette "Layout" section.
 */
export const LAYOUT_PALETTE_ITEMS: { nodeType: LayoutNodeType; label: string; icon: string }[] = [
  { nodeType: 'container',      label: 'Container',      icon: 'layout' },
  { nodeType: 'row',            label: 'Row',             icon: 'menu' },
  { nodeType: 'column',         label: 'Column',          icon: 'column-width' },
  { nodeType: 'flex-container', label: 'Flex Container',  icon: 'appstore' },
];
