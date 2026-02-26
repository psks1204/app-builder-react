// ============================================================
// ICG Builder — API Server
// Express REST API for saving / retrieving / listing designs
// ============================================================
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const PORT = 3200;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

/* ─── Types ───────────────────────────────────────────── */
interface DesignMeta {
  id: string;
  designName: string;
  createdAt: string;
  updatedAt: string;
  themeMode: string;
}

interface SavePayload {
  designName: string;
  themeMode: 'light' | 'dark';
  layoutTree: unknown[];
}

/* ─── Helpers ─────────────────────────────────────────── */
const getDesignPath = (id: string): string =>
  path.join(DATA_DIR, `${id}.json`);

const readDesign = (id: string): Record<string, unknown> | null => {
  const filePath = getDesignPath(id);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Record<string, unknown>;
};

const writeDesign = (id: string, data: Record<string, unknown>): void => {
  fs.writeFileSync(getDesignPath(id), JSON.stringify(data, null, 2), 'utf-8');
};

/* ═══════════════════════════════════════════════════════
   ROUTES
   ═══════════════════════════════════════════════════════ */

/**
 * GET /api/designs
 * List all saved designs (metadata only, no layoutTree).
 */
app.get('/api/designs', (_req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
    const designs: DesignMeta[] = files.map((f) => {
      const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
      const data = JSON.parse(raw) as Record<string, unknown>;
      return {
        id: data.id as string,
        designName: (data.designName as string) ?? 'Untitled',
        createdAt: (data.createdAt as string) ?? '',
        updatedAt: (data.updatedAt as string) ?? '',
        themeMode: (data.themeMode as string) ?? 'light',
      };
    });

    // Sort by updatedAt descending (newest first)
    designs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json({ success: true, designs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list designs' });
  }
});

/**
 * GET /api/designs/:id
 * Get a single design by ID (full data including layoutTree).
 */
app.get('/api/designs/:id', (req, res) => {
  try {
    const design = readDesign(req.params.id);
    if (!design) {
      res.status(404).json({ success: false, error: 'Design not found' });
      return;
    }
    res.json({ success: true, design });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to read design' });
  }
});

/**
 * POST /api/designs
 * Create a new design. Returns the created design with its generated ID.
 */
app.post('/api/designs', (req, res) => {
  try {
    const body = req.body as SavePayload;
    if (!body.layoutTree || !Array.isArray(body.layoutTree)) {
      res.status(400).json({ success: false, error: 'layoutTree is required and must be an array' });
      return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const design = {
      id,
      version: '1.0.0',
      schemaVersion: 1,
      designName: body.designName || 'Untitled',
      createdAt: now,
      updatedAt: now,
      themeMode: body.themeMode || 'light',
      layoutTree: body.layoutTree,
    };

    writeDesign(id, design);
    res.status(201).json({ success: true, design });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create design' });
  }
});

/**
 * PUT /api/designs/:id
 * Update an existing design. Merges new data, preserves createdAt.
 */
app.put('/api/designs/:id', (req, res) => {
  try {
    const existing = readDesign(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Design not found' });
      return;
    }

    const body = req.body as SavePayload;
    const updated = {
      ...existing,
      designName: body.designName ?? existing.designName,
      themeMode: body.themeMode ?? existing.themeMode,
      layoutTree: body.layoutTree ?? existing.layoutTree,
      updatedAt: new Date().toISOString(),
    };

    writeDesign(req.params.id, updated);
    res.json({ success: true, design: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update design' });
  }
});

/**
 * DELETE /api/designs/:id
 * Delete a design by ID.
 */
app.delete('/api/designs/:id', (req, res) => {
  try {
    const filePath = getDesignPath(req.params.id);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'Design not found' });
      return;
    }
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Design deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete design' });
  }
});

/* ─── Start ───────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`ICG Builder API server running on http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
