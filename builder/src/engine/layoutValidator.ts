// ============================================================
// Layout Validator — Structural constraint enforcement
// ============================================================
import type { LayoutNode, LayoutNodeType } from '../store/types';
import { ALLOWED_CHILDREN } from '../registry/layoutConstraints';

export interface ValidationViolation {
  nodeId: string;
  message: string;
}

/**
 * Can a child of `childType` be inserted under `parentType`?
 * Uses the constraint table as single source of truth.
 */
export const canInsert = (
  parentType: LayoutNodeType | 'root',
  childType: LayoutNodeType,
): boolean => {
  const allowed = ALLOWED_CHILDREN[parentType];
  return allowed ? allowed.includes(childType) : false;
};

/**
 * Deep-validate the entire tree. Returns violations found.
 * Called on load/deserialize to catch corrupt or hand-edited JSON.
 */
export const validateTree = (rootNodes: LayoutNode[]): ValidationViolation[] => {
  const violations: ValidationViolation[] = [];

  const walk = (nodes: LayoutNode[], expectedParentType: LayoutNodeType | 'root') => {
    for (const node of nodes) {
      // Check this node is allowed under its parent
      if (!canInsert(expectedParentType, node.type)) {
        violations.push({
          nodeId: node.id,
          message: `Node "${node.type}" is not allowed inside "${expectedParentType}"`,
        });
      }

      // Component and content nodes must be leaves
      if ((node.type === 'component' || node.type === 'content') && node.children.length > 0) {
        violations.push({
          nodeId: node.id,
          message: `Leaf node "${node.type}" cannot have children`,
        });
      }

      // Recurse into children
      if (node.children.length > 0) {
        walk(node.children, node.type);
      }
    }
  };

  walk(rootNodes, 'root');
  return violations;
};

/**
 * Check whether `nodeId` is an ancestor of `potentialDescendantId`.
 * Used to prevent dropping a node into its own descendants.
 */
export const isAncestor = (
  tree: LayoutNode[],
  nodeId: string,
  potentialDescendantId: string,
): boolean => {
  const hasDescendant = (node: LayoutNode, descendantId: string): boolean => {
    for (const child of node.children) {
      if (child.id === descendantId) return true;
      if (hasDescendant(child, descendantId)) return true;
    }
    return false;
  };

  const checkAncestry = (nodes: LayoutNode[], childId: string): boolean => {
    for (const n of nodes) {
      if (n.id === nodeId && hasDescendant(n, childId)) return true;
      if (checkAncestry(n.children, childId)) return true;
    }
    return false;
  };

  return checkAncestry(tree, potentialDescendantId);
};
