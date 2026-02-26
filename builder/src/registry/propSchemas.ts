// ============================================================
// Prop Schemas — Re-exports for convenience
// The actual schemas live inside componentRegistry and contentRegistry.
// This file provides consolidated helpers.
// ============================================================
import type { PropField } from '../store/types';
import { getComponentDefinition, componentRegistry } from './componentRegistry';
import { getContentDefinition, contentRegistry } from './contentRegistry';

/** Get prop schema for an ICG component by type name. */
export const getComponentPropSchema = (componentType: string): PropField[] => {
  const def = getComponentDefinition(componentType);
  return def?.propSchema ?? [];
};

/** Get prop schema for a content node by content type. */
export const getContentPropSchema = (contentType: string): PropField[] => {
  const def = getContentDefinition(contentType);
  return def?.propSchema ?? [];
};

/** Get all component types that are registered. */
export const getRegisteredComponentTypes = (): string[] =>
  componentRegistry.map((c) => c.type);

/** Get all content types that are registered. */
export const getRegisteredContentTypes = (): string[] =>
  contentRegistry.map((c) => c.contentType);
