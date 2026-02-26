// ============================================================
// Persistence — Serializer, Deserializer, Storage Adapter
// ============================================================
import type { LayoutNode, SaveFile } from '../store/types';
import { validateTree } from '../engine/layoutValidator';

const SCHEMA_VERSION = 1;
const LOCALSTORAGE_KEY = 'icg-builder-autosave';

/* ─── Serialize ───────────────────────────────────────── */
export const serializeDesign = (
  layoutTree: LayoutNode[],
  designName: string,
  themeMode: 'light' | 'dark',
): SaveFile => ({
  version: '1.0.0',
  schemaVersion: SCHEMA_VERSION,
  designName,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  themeMode,
  layoutTree,
});

/* ─── Deserialize & Validate ──────────────────────────── */
export const deserializeDesign = (json: string): SaveFile => {
  const data = JSON.parse(json) as SaveFile;

  if (!data.schemaVersion || data.schemaVersion > SCHEMA_VERSION) {
    throw new Error(`Unsupported schema version: ${data.schemaVersion}`);
  }

  if (!Array.isArray(data.layoutTree)) {
    throw new Error('Invalid layout tree in save file');
  }

  const violations = validateTree(data.layoutTree);
  if (violations.length > 0) {
    console.warn('Layout tree violations found:', violations);
    // Don't throw — load anyway but warn
  }

  return data;
};

/* ─── Auto-save to localStorage ───────────────────────── */
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const autoSave = (
  layoutTree: LayoutNode[],
  designName: string,
  themeMode: 'light' | 'dark',
): void => {
  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    try {
      const data = serializeDesign(layoutTree, designName, themeMode);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    } catch {
      // Silently fail on localStorage issues
    }
  }, 1000);
};

/** Load auto-saved design from localStorage. */
export const loadAutoSave = (): SaveFile | null => {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return null;
    return deserializeDesign(raw);
  } catch {
    return null;
  }
};

/** Clear auto-save. */
export const clearAutoSave = (): void => {
  localStorage.removeItem(LOCALSTORAGE_KEY);
};

/* ─── File Download ───────────────────────────────────── */
export const saveDesignToFile = (
  layoutTree: LayoutNode[],
  designName: string,
  themeMode: 'light' | 'dark',
): void => {
  const data = serializeDesign(layoutTree, designName, themeMode);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${designName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'design'}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ─── File Upload ─────────────────────────────────────── */
export const loadDesignFromFile = (file: File): Promise<SaveFile> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = deserializeDesign(reader.result as string);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
