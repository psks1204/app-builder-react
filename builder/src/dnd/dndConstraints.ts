// ============================================================
// DnD Constraints — Drop validation for layout hierarchy
// ============================================================
import type { DragData, LayoutNode, LayoutNodeType } from '../store/types';
import { canInsert } from '../engine/layoutValidator';
import { isAncestor } from '../engine/layoutValidator';

/**
 * Determine whether a drag payload can be dropped onto a target node.
 */
export const canDrop = (
  dragData: DragData,
  dropTargetType: LayoutNodeType | 'root',
  tree: LayoutNode[],
  dropTargetId: string | null,
): boolean => {
  // Determine what type of child is being dropped
  let childType: LayoutNodeType;

  if (dragData.nodeType === 'component' || dragData.nodeType === 'content') {
    childType = dragData.nodeType;
  } else {
    childType = dragData.nodeType;
  }

  // Basic hierarchy check
  if (!canInsert(dropTargetType, childType)) {
    return false;
  }

  // If moving an existing node, prevent dropping into its own descendants
  if (dragData.source === 'canvas' && dragData.nodeId && dropTargetId) {
    if (dragData.nodeId === dropTargetId) return false;
    if (isAncestor(tree, dragData.nodeId, dropTargetId)) return false;
  }

  return true;
};

/**
 * Get a human-readable message for why a drop is invalid.
 */
export const getDropFeedback = (
  dragData: DragData,
  dropTargetType: LayoutNodeType | 'root',
): string | null => {
  const childType = dragData.nodeType;
  if (canInsert(dropTargetType, childType)) return null;

  const labels: Record<string, string> = {
    root: 'canvas',
    container: 'Container',
    row: 'Row',
    column: 'Column',
    'flex-container': 'Flex Container',
    component: 'Component',
    content: 'Content',
  };

  return `${labels[childType] ?? childType} cannot be placed inside ${labels[dropTargetType] ?? dropTargetType}`;
};
