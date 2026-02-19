import type { CanvasNode } from '../store/types';

// ============================================================
// Tree Utilities — immutable operations on the CanvasNode tree
// ============================================================

/** Deep-clone a node array (structuredClone fallback-safe) */
export const cloneTree = (nodes: CanvasNode[]): CanvasNode[] =>
  JSON.parse(JSON.stringify(nodes));

/** Find a node by id anywhere in the tree */
export const findNode = (
  nodes: CanvasNode[],
  nodeId: string,
): CanvasNode | null => {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    const found = findNode(node.children, nodeId);
    if (found) return found;
  }
  return null;
};

/** Find the parent of a given node */
export const findParent = (
  nodes: CanvasNode[],
  nodeId: string,
): CanvasNode | null => {
  for (const node of nodes) {
    if (node.children.some((c) => c.id === nodeId)) return node;
    const found = findParent(node.children, nodeId);
    if (found) return found;
  }
  return null;
};

/**
 * Remove a node from the tree by id.
 * Returns a new tree array with the node removed.
 */
export const removeNodeFromTree = (
  nodes: CanvasNode[],
  nodeId: string,
): CanvasNode[] =>
  nodes
    .filter((n) => n.id !== nodeId)
    .map((n) => ({
      ...n,
      children: removeNodeFromTree(n.children, nodeId),
    }));

/**
 * Update a node in the tree immutably.
 * The `updater` receives the matched node and returns a new node.
 */
export const updateNodeInTree = (
  nodes: CanvasNode[],
  nodeId: string,
  updater: (node: CanvasNode) => CanvasNode,
): CanvasNode[] =>
  nodes.map((n) => {
    if (n.id === nodeId) return updater(n);
    return {
      ...n,
      children: updateNodeInTree(n.children, nodeId, updater),
    };
  });

/**
 * Add a node as a child of a parent (or at root level if parentId is null).
 */
export const addNodeToTree = (
  nodes: CanvasNode[],
  newNode: CanvasNode,
  parentId: string | null,
  index?: number,
): CanvasNode[] => {
  if (parentId === null) {
    const i = index ?? nodes.length;
    const copy = [...nodes];
    copy.splice(i, 0, newNode);
    return copy;
  }

  return nodes.map((n) => {
    if (n.id === parentId) {
      const i = index ?? n.children.length;
      const children = [...n.children];
      children.splice(i, 0, { ...newNode, parentId });
      return { ...n, children };
    }
    return {
      ...n,
      children: addNodeToTree(n.children, newNode, parentId, index),
    };
  });
};

/**
 * Move an existing node to a new parent (or root).
 */
export const moveNode = (
  nodes: CanvasNode[],
  nodeId: string,
  newParentId: string | null,
  index?: number,
): CanvasNode[] => {
  const node = findNode(nodes, nodeId);
  if (!node) return nodes;
  const withoutNode = removeNodeFromTree(nodes, nodeId);
  return addNodeToTree(withoutNode, { ...node, parentId: newParentId }, newParentId, index);
};

/** Flatten the tree to a flat array */
export const flattenTree = (nodes: CanvasNode[]): CanvasNode[] =>
  nodes.reduce<CanvasNode[]>(
    (acc, n) => [...acc, n, ...flattenTree(n.children)],
    [],
  );
