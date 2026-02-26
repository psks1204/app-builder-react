// ============================================================
// Layout Tree — Data structure & traversal helpers
// ============================================================
import type { LayoutNode } from '../store/types';

/**
 * Deep-clone a tree or subtree (immutable operations).
 */
export const cloneTree = (nodes: LayoutNode[]): LayoutNode[] =>
  JSON.parse(JSON.stringify(nodes)) as LayoutNode[];

/**
 * Find a node by ID in the tree. Returns null if not found.
 */
export const findNode = (tree: LayoutNode[], nodeId: string): LayoutNode | null => {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    const found = findNode(node.children, nodeId);
    if (found) return found;
  }
  return null;
};

/**
 * Find the parent of a given node ID. Returns null for root-level nodes.
 */
export const findParent = (tree: LayoutNode[], nodeId: string): LayoutNode | null => {
  for (const node of tree) {
    for (const child of node.children) {
      if (child.id === nodeId) return node;
    }
    const found = findParent(node.children, nodeId);
    if (found) return found;
  }
  return null;
};

/**
 * Flatten the tree into an array of all nodes (depth-first).
 */
export const flattenTree = (nodes: LayoutNode[]): LayoutNode[] => {
  const result: LayoutNode[] = [];
  const walk = (items: LayoutNode[]) => {
    for (const n of items) {
      result.push(n);
      walk(n.children);
    }
  };
  walk(nodes);
  return result;
};

/**
 * Get the depth of a node in the tree (root = 0).
 */
export const getNodeDepth = (tree: LayoutNode[], nodeId: string): number => {
  const walk = (nodes: LayoutNode[], depth: number): number => {
    for (const n of nodes) {
      if (n.id === nodeId) return depth;
      const found = walk(n.children, depth + 1);
      if (found >= 0) return found;
    }
    return -1;
  };
  return walk(tree, 0);
};

/**
 * Get the path from root to a node (array of ancestor IDs including the node).
 */
export const getNodePath = (tree: LayoutNode[], nodeId: string): string[] => {
  const walk = (nodes: LayoutNode[], path: string[]): string[] | null => {
    for (const n of nodes) {
      const currentPath = [...path, n.id];
      if (n.id === nodeId) return currentPath;
      const found = walk(n.children, currentPath);
      if (found) return found;
    }
    return null;
  };
  return walk(tree, []) ?? [];
};
