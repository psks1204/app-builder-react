// ============================================================
// Commands — Reversible actions for undo/redo
// ============================================================
import type { LayoutNode, Command, ContentType } from './types';
import {
  insertNode,
  removeNode,
  moveNode,
  reorderChild,
  updateNodeProps,
  updateNodeClasses,
} from '../engine/treeOperations';
import { createLayoutNode, createComponentNode, createContentNode } from '../engine/nodeFactory';
import type { LayoutNodeType } from './types';

/** Add a new layout node (container, row, column, flex-container). */
export const createAddLayoutCommand = (
  nodeType: LayoutNodeType,
  parentId: string | null,
  index?: number,
): Command => {
  const node = createLayoutNode(nodeType, parentId);
  return {
    type: 'ADD_NODE',
    description: `Add ${nodeType}`,
    timestamp: Date.now(),
    execute: (tree) => insertNode(tree, node, parentId, index),
    undo: (tree) => removeNode(tree, node.id)[0],
  };
};

/** Add a new component node. */
export const createAddComponentCommand = (
  componentType: string,
  parentId: string,
  index?: number,
): Command => {
  const node = createComponentNode(componentType, parentId);
  return {
    type: 'ADD_NODE',
    description: `Add ${componentType}`,
    timestamp: Date.now(),
    execute: (tree) => insertNode(tree, node, parentId, index),
    undo: (tree) => removeNode(tree, node.id)[0],
  };
};

/** Add a new content node (heading, paragraph, etc.). */
export const createAddContentCommand = (
  contentType: ContentType,
  parentId: string,
  index?: number,
): Command => {
  const node = createContentNode(contentType, parentId);
  return {
    type: 'ADD_NODE',
    description: `Add ${contentType}`,
    timestamp: Date.now(),
    execute: (tree) => insertNode(tree, node, parentId, index),
    undo: (tree) => removeNode(tree, node.id)[0],
  };
};

/** Remove an existing node (stores snapshot for undo). */
export const createRemoveCommand = (
  nodeId: string,
  parentId: string | null,
  index: number,
  snapshot: LayoutNode,
): Command => ({
  type: 'REMOVE_NODE',
  description: `Remove node`,
  timestamp: Date.now(),
  execute: (tree) => removeNode(tree, nodeId)[0],
  undo: (tree) => insertNode(tree, snapshot, parentId, index),
});

/** Move a node to a different parent. */
export const createMoveCommand = (
  nodeId: string,
  oldParentId: string | null,
  oldIndex: number,
  newParentId: string | null,
  newIndex?: number,
): Command => ({
  type: 'MOVE_NODE',
  description: `Move node`,
  timestamp: Date.now(),
  execute: (tree) => moveNode(tree, nodeId, newParentId, newIndex),
  undo: (tree) => moveNode(tree, nodeId, oldParentId, oldIndex),
});

/** Reorder a child within its parent. */
export const createReorderCommand = (
  parentId: string | null,
  oldIndex: number,
  newIndex: number,
): Command => ({
  type: 'REORDER',
  description: `Reorder`,
  timestamp: Date.now(),
  execute: (tree) => reorderChild(tree, parentId, oldIndex, newIndex),
  undo: (tree) => reorderChild(tree, parentId, newIndex, oldIndex),
});

/** Update component/content props. */
export const createUpdatePropsCommand = (
  nodeId: string,
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>,
): Command => ({
  type: 'UPDATE_PROPS',
  description: `Update props`,
  timestamp: Date.now(),
  execute: (tree) => updateNodeProps(tree, nodeId, newProps),
  undo: (tree) => updateNodeProps(tree, nodeId, oldProps),
});

/** Update ICG classes on a node. */
export const createUpdateClassesCommand = (
  nodeId: string,
  oldClasses: string[],
  newClasses: string[],
): Command => ({
  type: 'UPDATE_CLASSES',
  description: `Update classes`,
  timestamp: Date.now(),
  execute: (tree) => updateNodeClasses(tree, nodeId, newClasses),
  undo: (tree) => updateNodeClasses(tree, nodeId, oldClasses),
});

/** Batch multiple commands into one undoable action. */
export const createBatchCommand = (
  commands: Command[],
  description: string,
): Command => ({
  type: 'BATCH',
  description,
  timestamp: Date.now(),
  execute: (tree) => commands.reduce((t, cmd) => cmd.execute(t), tree),
  undo: (tree) => [...commands].reverse().reduce((t, cmd) => cmd.undo(t), tree),
});
