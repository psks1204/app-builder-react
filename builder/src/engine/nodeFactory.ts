// ============================================================
// Node Factory — Create LayoutNodes with proper ICG defaults
// ============================================================
import type { LayoutNode, LayoutNodeType, ContentType } from '../store/types';
import { generateId } from '../utils/idGenerator';
import { getComponentDefinition } from '../registry/componentRegistry';
import { getContentDefinition } from '../registry/contentRegistry';

/**
 * Create a new layout structural node (container, row, column, flex-container).
 */
export const createLayoutNode = (
  nodeType: LayoutNodeType,
  parentId: string | null = null,
): LayoutNode => {
  const base: LayoutNode = {
    id: generateId(),
    type: nodeType,
    props: {},
    icgClasses: [],
    children: [],
    parentId,
  };

  switch (nodeType) {
    case 'container':
      base.props = { fluid: false };
      base.icgClasses = ['lmn-container'];
      break;
    case 'row':
      base.props = { noGutters: false };
      base.icgClasses = ['lmn-row'];
      break;
    case 'column':
      base.props = { xs: 12, sm: undefined, md: undefined, lg: undefined, xl: undefined };
      base.icgClasses = [`lmn-col-${base.props.xs}`];
      break;
    case 'flex-container':
      base.props = {
        direction: 'row',
        justifyContent: 'start',
        alignItems: 'stretch',
        wrap: false,
      };
      base.icgClasses = ['lmn-d-flex', 'lmn-flex-row'];
      break;
    default:
      break;
  }

  return base;
};

/**
 * Create a new component node.
 */
export const createComponentNode = (
  componentType: string,
  parentId: string | null = null,
): LayoutNode => {
  const def = getComponentDefinition(componentType);
  return {
    id: generateId(),
    type: 'component',
    componentType,
    props: def ? { ...def.defaultProps } : {},
    icgClasses: [],
    children: [],
    parentId,
  };
};

/**
 * Create a new content node (heading, paragraph, etc.).
 */
export const createContentNode = (
  contentType: ContentType,
  parentId: string | null = null,
): LayoutNode => {
  const def = getContentDefinition(contentType);
  return {
    id: generateId(),
    type: 'content',
    contentType,
    props: def ? { ...def.defaultProps } : {},
    icgClasses: [],
    children: [],
    parentId,
  };
};
