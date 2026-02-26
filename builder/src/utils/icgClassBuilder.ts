/**
 * Build an ICG class string from an array of class names.
 * Filters out falsy values and deduplicates.
 */
export const buildClassString = (...classes: (string | false | null | undefined)[]): string =>
  [...new Set(classes.filter(Boolean) as string[])].join(' ');

/**
 * Merge additional ICG classes onto an existing class array,
 * returning a new deduplicated array.
 */
export const mergeIcgClasses = (existing: string[], additions: string[]): string[] =>
  [...new Set([...existing, ...additions])];

/**
 * Remove specific ICG classes from an array.
 */
export const removeIcgClasses = (existing: string[], removals: string[]): string[] =>
  existing.filter((c) => !removals.includes(c));
