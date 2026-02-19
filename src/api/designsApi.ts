// ============================================================
// API client for the App Builder backend
// ============================================================

const API_BASE = '/api';

export interface DesignSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  frameWidth: number | null;
  frameHeight: number | null;
}

export interface DesignPayload {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  state: {
    canvasNodes: unknown[];
    deviceFrame: unknown;
    themeMode: string;
  };
}

/** List all saved designs (lightweight, no full state) */
export async function listDesigns(): Promise<DesignSummary[]> {
  const res = await fetch(`${API_BASE}/designs`);
  if (!res.ok) throw new Error('Failed to list designs');
  return res.json();
}

/** Load a specific design with full state */
export async function loadDesign(id: string): Promise<DesignPayload> {
  const res = await fetch(`${API_BASE}/designs/${id}`);
  if (!res.ok) throw new Error('Failed to load design');
  return res.json();
}

/** Create a new design */
export async function createDesign(
  name: string,
  state: { canvasNodes: unknown[]; deviceFrame: unknown; themeMode: string },
): Promise<{ id: string; name: string }> {
  const res = await fetch(`${API_BASE}/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, state }),
  });
  if (!res.ok) throw new Error('Failed to create design');
  return res.json();
}

/** Update an existing design */
export async function updateDesign(
  id: string,
  payload: { name?: string; state?: { canvasNodes: unknown[]; deviceFrame: unknown; themeMode: string } },
): Promise<{ id: string; name: string; updatedAt: string }> {
  const res = await fetch(`${API_BASE}/designs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update design');
  return res.json();
}

/** Delete a saved design */
export async function deleteDesign(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/designs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete design');
}
