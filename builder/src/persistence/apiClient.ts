// ============================================================
// API Client — Frontend HTTP client for the ICG Builder API
// ============================================================
import type { SaveFile, LayoutNode } from '../store/types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  design?: T;
  designs?: T[];
  message?: string;
}

interface DesignMeta {
  id: string;
  designName: string;
  createdAt: string;
  updatedAt: string;
  themeMode: string;
}

/* ─── List all designs (metadata only) ────────────────── */
export const apiListDesigns = async (): Promise<DesignMeta[]> => {
  const res = await fetch(`${API_BASE}/designs`);
  const data = (await res.json()) as ApiResponse<DesignMeta>;
  if (!data.success) throw new Error(data.error ?? 'Failed to list designs');
  return (data.designs as DesignMeta[]) ?? [];
};

/* ─── Get a single design ─────────────────────────────── */
export const apiGetDesign = async (id: string): Promise<SaveFile> => {
  const res = await fetch(`${API_BASE}/designs/${id}`);
  const data = (await res.json()) as ApiResponse<SaveFile>;
  if (!data.success) throw new Error(data.error ?? 'Design not found');
  return data.design as SaveFile;
};

/* ─── Create a new design ─────────────────────────────── */
export const apiCreateDesign = async (
  layoutTree: LayoutNode[],
  designName: string,
  themeMode: 'light' | 'dark',
): Promise<SaveFile> => {
  const res = await fetch(`${API_BASE}/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layoutTree, designName, themeMode }),
  });
  const data = (await res.json()) as ApiResponse<SaveFile>;
  if (!data.success) throw new Error(data.error ?? 'Failed to create design');
  return data.design as SaveFile;
};

/* ─── Update an existing design ───────────────────────── */
export const apiUpdateDesign = async (
  id: string,
  layoutTree: LayoutNode[],
  designName: string,
  themeMode: 'light' | 'dark',
): Promise<SaveFile> => {
  const res = await fetch(`${API_BASE}/designs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layoutTree, designName, themeMode }),
  });
  const data = (await res.json()) as ApiResponse<SaveFile>;
  if (!data.success) throw new Error(data.error ?? 'Failed to update design');
  return data.design as SaveFile;
};

/* ─── Delete a design ─────────────────────────────────── */
export const apiDeleteDesign = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/designs/${id}`, { method: 'DELETE' });
  const data = (await res.json()) as ApiResponse<never>;
  if (!data.success) throw new Error(data.error ?? 'Failed to delete design');
};
