// ============================================================
// Tree Operations — Immutable insert, remove, move, reorder
// ============================================================
import type { LayoutNode } from '../store/types';
import { cloneTree, findNode } from './layoutTree';

/**
 * Insert a node as a child of `parentId` at a given index.
 * If parentId is null, insert at root level.
 * Returns a new tree (immutable).
 */
export const insertNode = (
  tree: LayoutNode[],
  node: LayoutNode,
  parentId: string | null,
  index?: number,
): LayoutNode[] => {
  const newTree = cloneTree(tree);
  const newNode = JSON.parse(JSON.stringify(node)) as LayoutNode;
  newNode.parentId = parentId;

  if (parentId === null) {
    // Insert at root level
    const idx = index ?? newTree.length;
    newTree.splice(idx, 0, newNode);
    return newTree;
  }

  const parent = findNode(newTree, parentId);
  if (!parent) return newTree;

  const idx = index ?? parent.children.length;
  parent.children.splice(idx, 0, newNode);
  return newTree;
};

/**
 * Remove a node by ID. Returns [newTree, removedNode].
 */
export const removeNode = (
  tree: LayoutNode[],
  nodeId: string,
): [LayoutNode[], LayoutNode | null] => {
  const newTree = cloneTree(tree);

  // Check root level
  const rootIdx = newTree.findIndex((n) => n.id === nodeId);
  if (rootIdx >= 0) {
    const [removed] = newTree.splice(rootIdx, 1);
    return [newTree, removed];
  }

  // Search in children
  const removeFromChildren = (nodes: LayoutNode[]): LayoutNode | null => {
    for (const node of nodes) {
      const idx = node.children.findIndex((c) => c.id === nodeId);
      if (idx >= 0) {
        const [removed] = node.children.splice(idx, 1);
        return removed;
      }
      const found = removeFromChildren(node.children);
      if (found) return found;
    }
    return null;
  };

  const removed = removeFromChildren(newTree);
  return [newTree, removed];
};

/**
 * Move a node from its current position to a new parent at a given index.
 * Returns the new tree, or original if the move is invalid.
 */
export const moveNode = (
  tree: LayoutNode[],
  nodeId: string,
  newParentId: string | null,
  index?: number,
): LayoutNode[] => {
  const [treeWithout, removed] = removeNode(tree, nodeId);
  if (!removed) return tree;

  return insertNode(treeWithout, removed, newParentId, index);
};

/**
 * Reorder a child within its parent by moving it from `oldIndex` to `newIndex`.
 */
export const reorderChild = (
  tree: LayoutNode[],
  parentId: string | null,
  oldIndex: number,
  newIndex: number,
): LayoutNode[] => {
  const newTree = cloneTree(tree);

  if (parentId === null) {
    // Reorder at root level
    if (oldIndex < 0 || oldIndex >= newTree.length) return tree;
    const [item] = newTree.splice(oldIndex, 1);
    newTree.splice(newIndex, 0, item);
    return newTree;
  }

  const parent = findNode(newTree, parentId);
  if (!parent || oldIndex < 0 || oldIndex >= parent.children.length) return tree;

  const [item] = parent.children.splice(oldIndex, 1);
  parent.children.splice(newIndex, 0, item);
  return newTree;
};

/**
 * Update props of a specific node. Returns new tree.
 */
export const updateNodeProps = (
  tree: LayoutNode[],
  nodeId: string,
  props: Record<string, unknown>,
): LayoutNode[] => {
  const newTree = cloneTree(tree);
  const node = findNode(newTree, nodeId);
  if (!node) return tree;

  node.props = { ...node.props, ...props };
  return newTree;
};

/**
 * Update ICG classes of a specific node. Returns new tree.
 */
export const updateNodeClasses = (
  tree: LayoutNode[],
  nodeId: string,
  icgClasses: string[],
): LayoutNode[] => {
  const newTree = cloneTree(tree);
  const node = findNode(newTree, nodeId);
  if (!node) return tree;

  node.icgClasses = [...icgClasses];
  return newTree;
};
