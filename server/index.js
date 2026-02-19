import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;
const DESIGNS_DIR = path.join(__dirname, 'designs');

// Ensure designs directory exists
if (!fs.existsSync(DESIGNS_DIR)) {
  fs.mkdirSync(DESIGNS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── Helpers ────────────────────────────────────────────────

function getDesignPath(id) {
  return path.join(DESIGNS_DIR, `${id}.json`);
}

function readDesignFile(id) {
  const filePath = getDesignPath(id);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeDesignFile(id, data) {
  fs.writeFileSync(getDesignPath(id), JSON.stringify(data, null, 2), 'utf-8');
}

// ─── API Routes ─────────────────────────────────────────────

/**
 * GET /api/designs
 * List all saved designs (id, name, updatedAt) — lightweight, no full state.
 */
app.get('/api/designs', (_req, res) => {
  try {
    const files = fs.readdirSync(DESIGNS_DIR).filter(f => f.endsWith('.json'));
    const list = files.map(f => {
      try {
        const raw = fs.readFileSync(path.join(DESIGNS_DIR, f), 'utf-8');
        const data = JSON.parse(raw);
        return {
          id: data.id,
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          nodeCount: (data.state?.canvasNodes ?? []).length,
          frameWidth: data.state?.deviceFrame?.width ?? null,
          frameHeight: data.state?.deviceFrame?.height ?? null,
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Sort by updatedAt descending (most recent first)
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list designs' });
  }
});

/**
 * GET /api/designs/:id
 * Load a specific design with full state.
 */
app.get('/api/designs/:id', (req, res) => {
  try {
    const data = readDesignFile(req.params.id);
    if (!data) return res.status(404).json({ error: 'Design not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read design' });
  }
});

/**
 * POST /api/designs
 * Create a new design.
 * Body: { name: string, state: { canvasNodes, deviceFrame, themeMode } }
 */
app.post('/api/designs', (req, res) => {
  try {
    const { name, state } = req.body;
    if (!name || !state) {
      return res.status(400).json({ error: 'name and state are required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const design = {
      id,
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
      state,
    };

    writeDesignFile(id, design);
    res.status(201).json({ id, name: design.name, createdAt: now, updatedAt: now });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save design' });
  }
});

/**
 * PUT /api/designs/:id
 * Update an existing design (name and/or state).
 * Body: { name?: string, state?: { canvasNodes, deviceFrame, themeMode } }
 */
app.put('/api/designs/:id', (req, res) => {
  try {
    const existing = readDesignFile(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Design not found' });

    const { name, state } = req.body;
    if (name !== undefined) existing.name = name.trim();
    if (state !== undefined) existing.state = state;
    existing.updatedAt = new Date().toISOString();

    writeDesignFile(req.params.id, existing);
    res.json({ id: existing.id, name: existing.name, updatedAt: existing.updatedAt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update design' });
  }
});

/**
 * DELETE /api/designs/:id
 * Delete a saved design.
 */
app.delete('/api/designs/:id', (req, res) => {
  try {
    const filePath = getDesignPath(req.params.id);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Design not found' });
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

// ─── Start server ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ App Builder API running on http://localhost:${PORT}`);
});
