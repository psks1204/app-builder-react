import React, { useCallback, useState } from 'react';
import {
  Box, Typography, TextField, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Tooltip, Slider, Switch, MenuItem, Divider, Button, Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  FlipToFront as FrontIcon,
  FlipToBack as BackIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
} from '@mui/icons-material';
import type { CanvasNode, ComponentMeta, PropField } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

/* ─── Reusable List Editor ──────────────────────────────── */

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
}

const ListEditor: React.FC<ListEditorProps> = ({ items, onChange }) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    const label = newItem.trim() || `Item ${items.length + 1}`;
    onChange([...items, label]);
    setNewItem('');
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleRename = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <Box>
      {items.map((item, i) => (
        <Paper
          key={i}
          variant="outlined"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5, py: 0.25, mb: 0.5 }}
        >
          <DragIcon fontSize="small" sx={{ color: 'text.disabled', fontSize: 16 }} />
          <TextField
            size="small"
            value={item}
            onChange={(e) => handleRename(i, e.target.value)}
            variant="standard"
            sx={{ flex: 1, '& input': { fontSize: 12, py: 0.25 } }}
            InputProps={{ disableUnderline: true }}
          />
          <IconButton size="small" onClick={() => handleMoveUp(i)} disabled={i === 0} sx={{ p: 0.25 }}>
            <UpIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" onClick={() => handleMoveDown(i)} disabled={i >= items.length - 1} sx={{ p: 0.25 }}>
            <DownIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" onClick={() => handleRemove(i)} sx={{ p: 0.25 }} color="error">
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Paper>
      ))}
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
        <TextField
          size="small"
          placeholder="New item…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          sx={{ flex: 1, '& input': { fontSize: 12 } }}
        />
        <Button size="small" variant="outlined" onClick={handleAdd} startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ minWidth: 'auto', px: 1, fontSize: 11 }}>
          Add
        </Button>
      </Box>
    </Box>
  );
};

interface PropertiesPanelProps {
  node: CanvasNode;
  meta: ComponentMeta;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, meta }) => {
  const {
    updateNodeProps, updateNodePosition, updateNodeSize,
    updateNodeSx, removeNode, duplicateNode,
    bringToFront, sendToBack, pushHistory,
  } = useBuilderStore();

  const handlePropChange = (field: PropField, value: unknown) => {
    pushHistory();
    updateNodeProps(node.id, { [field.name]: value });
  };

  const renderControl = (field: PropField) => {
    const val = node.props[field.name] ?? field.defaultValue;
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth size="small" value={val as string}
            onChange={(e) => handlePropChange(field, e.target.value)}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth size="small" type="number" value={val as number}
            onChange={(e) => handlePropChange(field, Number(e.target.value))}
          />
        );
      case 'select':
        return (
          <TextField
            fullWidth size="small" select value={val as string}
            onChange={(e) => handlePropChange(field, e.target.value)}
          >
            {field.options?.map((o) => (
              <MenuItem key={o} value={o}>{o || '(none)'}</MenuItem>
            ))}
          </TextField>
        );
      case 'boolean':
        return (
          <Switch
            size="small" checked={val as boolean}
            onChange={(e) => handlePropChange(field, e.target.checked)}
          />
        );
      case 'color':
        return (
          <TextField
            fullWidth size="small" type="color" value={val as string}
            onChange={(e) => handlePropChange(field, e.target.value)}
            sx={{ '& input': { height: 28, p: 0.5 } }}
          />
        );
      case 'slider':
        return (
          <Slider
            value={val as number}
            min={field.min ?? 0} max={field.max ?? 100} step={field.step ?? 1}
            onChange={(_, v) => handlePropChange(field, v)}
            valueLabelDisplay="auto" size="small"
          />
        );
      case 'list':
        return (
          <ListEditor
            items={Array.isArray(val) ? (val as string[]) : (field.defaultValue as string[]) ?? []}
            onChange={(items) => handlePropChange(field, items)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
          {meta.displayName}
        </Typography>
        <Tooltip title="Duplicate"><IconButton size="small" onClick={() => duplicateNode(node.id)}><DuplicateIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Bring to Front"><IconButton size="small" onClick={() => bringToFront(node.id)}><FrontIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Send to Back"><IconButton size="small" onClick={() => sendToBack(node.id)}><BackIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { pushHistory(); removeNode(node.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Position & Size */}
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />} sx={{ minHeight: 36, px: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>
              Position &amp; Size
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 1.5, pt: 0 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <TextField label="X" size="small" type="number" value={Math.round(node.position.x)}
                onChange={(e) => { pushHistory(); updateNodePosition(node.id, { ...node.position, x: Number(e.target.value) }); }}
              />
              <TextField label="Y" size="small" type="number" value={Math.round(node.position.y)}
                onChange={(e) => { pushHistory(); updateNodePosition(node.id, { ...node.position, y: Number(e.target.value) }); }}
              />
              <TextField label="W" size="small" type="number" value={Math.round(node.size.width)}
                onChange={(e) => { pushHistory(); updateNodeSize(node.id, { ...node.size, width: Number(e.target.value) }); }}
              />
              <TextField label="H" size="small" type="number" value={Math.round(node.size.height)}
                onChange={(e) => { pushHistory(); updateNodeSize(node.id, { ...node.size, height: Number(e.target.value) }); }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Component Props */}
        {meta.propSchema.length > 0 && (
          <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />} sx={{ minHeight: 36, px: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>
                Props
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 1.5, pt: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {meta.propSchema.map((field) => (
                  <Box key={field.name}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                      {field.label}
                    </Typography>
                    {renderControl(field)}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* SX Overrides */}
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />} sx={{ minHeight: 36, px: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>
              Style (sx)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
            <SxEditor nodeId={node.id} sx={node.sx} />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

/* ─── Rich SX / Style Editor ──────────────────────────── */

/* ── helpers ── */
const parseSxSpacing = (val: unknown): { t: number; r: number; b: number; l: number } => {
  if (val === undefined || val === null || val === '') return { t: 0, r: 0, b: 0, l: 0 };
  if (typeof val === 'number') return { t: val, r: val, b: val, l: val };
  const s = String(val).trim();
  const parts = s.split(/\s+/).map(Number).filter((n) => !isNaN(n));
  if (parts.length === 1) return { t: parts[0], r: parts[0], b: parts[0], l: parts[0] };
  if (parts.length === 2) return { t: parts[0], r: parts[1], b: parts[0], l: parts[1] };
  if (parts.length === 3) return { t: parts[0], r: parts[1], b: parts[2], l: parts[1] };
  if (parts.length >= 4) return { t: parts[0], r: parts[1], b: parts[2], l: parts[3] };
  return { t: 0, r: 0, b: 0, l: 0 };
};

const buildSxSpacing = (t: number, r: number, b: number, l: number): string | number | undefined => {
  if (t === 0 && r === 0 && b === 0 && l === 0) return undefined;
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  return `${t} ${r} ${b} ${l}`;
};

interface BoxShadowParts {
  x: number; y: number; blur: number; spread: number; color: string; inset: boolean;
}

const parseBoxShadow = (val: unknown): BoxShadowParts => {
  const def: BoxShadowParts = { x: 0, y: 2, blur: 8, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false };
  if (val === undefined || val === null || val === '' || val === 0) return { ...def, x: 0, y: 0, blur: 0, spread: 0 };
  if (typeof val === 'number') {
    // MUI shadow elevation number
    return { ...def, y: val, blur: val * 2, spread: 0 };
  }
  const s = String(val).trim();
  const inset = s.startsWith('inset');
  const clean = s.replace(/^inset\s*/, '');
  // Try to extract px values and color
  const numMatch = clean.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s*(\d+)?px?\s*(.*)?/);
  if (numMatch) {
    return {
      x: parseInt(numMatch[1]) || 0,
      y: parseInt(numMatch[2]) || 0,
      blur: parseInt(numMatch[3]) || 0,
      spread: parseInt(numMatch[4]) || 0,
      color: numMatch[5]?.trim() || def.color,
      inset,
    };
  }
  return def;
};

const buildBoxShadow = (p: BoxShadowParts): string | undefined => {
  if (p.x === 0 && p.y === 0 && p.blur === 0 && p.spread === 0) return undefined;
  const prefix = p.inset ? 'inset ' : '';
  return `${prefix}${p.x}px ${p.y}px ${p.blur}px ${p.spread}px ${p.color}`;
};

interface BorderParts { width: number; style: string; color: string; }

const parseBorder = (val: unknown): BorderParts => {
  const def: BorderParts = { width: 0, style: 'solid', color: '#000000' };
  if (!val || val === '') return def;
  const s = String(val).trim();
  const match = s.match(/(\d+)px\s+(solid|dashed|dotted|double|groove|ridge|inset|outset|none)\s+(.*)/);
  if (match) return { width: parseInt(match[1]), style: match[2], color: match[3].trim() };
  // fallback: try just number
  if (typeof val === 'number') return { width: val, style: 'solid', color: '#000000' };
  return def;
};

const buildBorder = (p: BorderParts): string | undefined => {
  if (p.width === 0) return undefined;
  return `${p.width}px ${p.style} ${p.color}`;
};

const parseBorderRadius = (val: unknown): { tl: number; tr: number; br: number; bl: number } => {
  if (!val || val === '' || val === 0) return { tl: 0, tr: 0, br: 0, bl: 0 };
  if (typeof val === 'number') return { tl: val, tr: val, br: val, bl: val };
  const s = String(val).replace(/px/g, '').trim();
  const parts = s.split(/\s+/).map(Number).filter((n) => !isNaN(n));
  if (parts.length === 1) return { tl: parts[0], tr: parts[0], br: parts[0], bl: parts[0] };
  if (parts.length === 2) return { tl: parts[0], tr: parts[1], br: parts[0], bl: parts[1] };
  if (parts.length === 3) return { tl: parts[0], tr: parts[1], br: parts[2], bl: parts[1] };
  if (parts.length >= 4) return { tl: parts[0], tr: parts[1], br: parts[2], bl: parts[3] };
  return { tl: 0, tr: 0, br: 0, bl: 0 };
};

const buildBorderRadius = (tl: number, tr: number, br: number, bl: number): string | undefined => {
  if (tl === 0 && tr === 0 && br === 0 && bl === 0) return undefined;
  if (tl === tr && tr === br && br === bl) return `${tl}px`;
  if (tl === br && tr === bl) return `${tl}px ${tr}px`;
  return `${tl}px ${tr}px ${br}px ${bl}px`;
};

/* ── Section label helper ── */
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', mb: 0.5, display: 'block', letterSpacing: 0.5, fontSize: 10 }}>
    {children}
  </Typography>
);

/* ── Small inline label ── */
const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, lineHeight: 1, mb: '2px', display: 'block' }}>
    {children}
  </Typography>
);

/* ── 4-side spacing widget ── */
const FourSideInput: React.FC<{
  label: string;
  values: { t: number; r: number; b: number; l: number };
  onChange: (side: 't' | 'r' | 'b' | 'l', val: number) => void;
}> = ({ label, values, onChange }) => (
  <Box>
    <SectionLabel>{label} (MUI spacing units)</SectionLabel>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
      {(['t', 'r', 'b', 'l'] as const).map((side) => (
        <Box key={side}>
          <FieldLabel>{side === 't' ? 'Top' : side === 'r' ? 'Right' : side === 'b' ? 'Bottom' : 'Left'}</FieldLabel>
          <TextField
            size="small" type="number" fullWidth
            value={values[side]}
            onChange={(e) => onChange(side, Number(e.target.value) || 0)}
            inputProps={{ step: 0.5 }}
            sx={{ '& input': { fontSize: 12, py: '6px', textAlign: 'center' } }}
          />
        </Box>
      ))}
    </Box>
  </Box>
);

/* ── Main SX Editor ── */
const SxEditor: React.FC<{ nodeId: string; sx?: Record<string, unknown> }> = ({ nodeId, sx = {} }) => {
  const { updateNodeSx, pushHistory } = useBuilderStore();

  const set = (key: string, val: unknown) => {
    pushHistory();
    updateNodeSx(nodeId, { [key]: val });
  };

  const setMulti = (patch: Record<string, unknown>) => {
    pushHistory();
    updateNodeSx(nodeId, patch);
  };

  /* parsed values */
  const margin = parseSxSpacing(sx.m ?? sx.margin);
  const padding = parseSxSpacing(sx.p ?? sx.padding);
  const border = parseBorder(sx.border);
  const radius = parseBorderRadius(sx.borderRadius);
  const shadow = parseBoxShadow(sx.boxShadow);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Background Color ── */}
      <Box>
        <SectionLabel>Background Color</SectionLabel>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <TextField
            size="small"
            type="color"
            value={(sx.bgcolor as string) || (sx.backgroundColor as string) || '#ffffff'}
            onChange={(e) => set('bgcolor', e.target.value)}
            sx={{ width: 48, '& input': { height: 28, p: 0.5, cursor: 'pointer' } }}
          />
          <TextField
            fullWidth size="small"
            placeholder="#ffffff or theme color"
            value={(sx.bgcolor as string) || (sx.backgroundColor as string) || ''}
            onChange={(e) => set('bgcolor', e.target.value || undefined)}
            sx={{ '& input': { fontSize: 12 } }}
          />
        </Box>
      </Box>

      {/* ── Text Color ── */}
      <Box>
        <SectionLabel>Text Color</SectionLabel>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <TextField
            size="small"
            type="color"
            value={(sx.color as string) || '#000000'}
            onChange={(e) => set('color', e.target.value)}
            sx={{ width: 48, '& input': { height: 28, p: 0.5, cursor: 'pointer' } }}
          />
          <TextField
            fullWidth size="small"
            placeholder="#000000"
            value={(sx.color as string) || ''}
            onChange={(e) => set('color', e.target.value || undefined)}
            sx={{ '& input': { fontSize: 12 } }}
          />
        </Box>
      </Box>

      <Divider />

      {/* ── Margin (4-side) ── */}
      <FourSideInput
        label="Margin"
        values={margin}
        onChange={(side, val) => {
          const m = { ...margin, [side]: val };
          setMulti({ m: buildSxSpacing(m.t, m.r, m.b, m.l), mt: undefined, mr: undefined, mb: undefined, ml: undefined, mx: undefined, my: undefined, margin: undefined });
        }}
      />

      {/* ── Padding (4-side) ── */}
      <FourSideInput
        label="Padding"
        values={padding}
        onChange={(side, val) => {
          const p = { ...padding, [side]: val };
          setMulti({ p: buildSxSpacing(p.t, p.r, p.b, p.l), pt: undefined, pr: undefined, pb: undefined, pl: undefined, px: undefined, py: undefined, padding: undefined });
        }}
      />

      <Divider />

      {/* ── Border ── */}
      <Box>
        <SectionLabel>Border</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
          <Box>
            <FieldLabel>Width (px)</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={border.width}
              inputProps={{ min: 0, step: 1 }}
              onChange={(e) => {
                const b = { ...border, width: Number(e.target.value) || 0 };
                set('border', buildBorder(b));
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
          <Box>
            <FieldLabel>Style</FieldLabel>
            <TextField
              size="small" select fullWidth
              value={border.style}
              onChange={(e) => {
                const b = { ...border, style: e.target.value };
                set('border', buildBorder(b));
              }}
              sx={{ '& .MuiSelect-select': { fontSize: 12, py: '6px' } }}
            >
              {['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'none'].map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
        <Box sx={{ mt: 0.5 }}>
          <FieldLabel>Color</FieldLabel>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <TextField
              size="small" type="color"
              value={border.color}
              onChange={(e) => {
                const b = { ...border, color: e.target.value };
                set('border', buildBorder(b));
              }}
              sx={{ width: 44, '& input': { height: 28, p: 0.5, cursor: 'pointer' } }}
            />
            <TextField
              size="small" fullWidth
              value={border.color}
              placeholder="#000000"
              onChange={(e) => {
                const b = { ...border, color: e.target.value };
                set('border', buildBorder(b));
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Border Radius (4-corner) ── */}
      <Box>
        <SectionLabel>Border Radius (px)</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
          {([['tl', 'Top-Left'], ['tr', 'Top-Right'], ['bl', 'Bot-Left'], ['br', 'Bot-Right']] as const).map(([key, lbl]) => (
            <Box key={key}>
              <FieldLabel>{lbl}</FieldLabel>
              <TextField
                size="small" type="number" fullWidth
                value={radius[key]}
                inputProps={{ min: 0, step: 1 }}
                onChange={(e) => {
                  const r = { ...radius, [key]: Number(e.target.value) || 0 };
                  set('borderRadius', buildBorderRadius(r.tl, r.tr, r.br, r.bl));
                }}
                sx={{ '& input': { fontSize: 12, py: '6px', textAlign: 'center' } }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Divider />

      {/* ── Typography ── */}
      <Box>
        <SectionLabel>Font</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
          <Box>
            <FieldLabel>Size (px)</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={sx.fontSize != null ? (typeof sx.fontSize === 'number' ? sx.fontSize : parseInt(String(sx.fontSize), 10)) || '' : ''}
              placeholder="14"
              inputProps={{ min: 1, step: 1 }}
              onChange={(e) => {
                const v = e.target.value;
                set('fontSize', v ? Number(v) : undefined);
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
          <Box>
            <FieldLabel>Weight</FieldLabel>
            <TextField
              size="small" select fullWidth
              value={String(sx.fontWeight ?? '')}
              onChange={(e) => {
                const v = e.target.value;
                set('fontWeight', v ? Number(v) : undefined);
              }}
              sx={{ '& .MuiSelect-select': { fontSize: 12, py: '6px' } }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}><em>Default</em></MenuItem>
              <MenuItem value="100" sx={{ fontSize: 12 }}>Thin (100)</MenuItem>
              <MenuItem value="200" sx={{ fontSize: 12 }}>Extra Light (200)</MenuItem>
              <MenuItem value="300" sx={{ fontSize: 12 }}>Light (300)</MenuItem>
              <MenuItem value="400" sx={{ fontSize: 12 }}>Normal (400)</MenuItem>
              <MenuItem value="500" sx={{ fontSize: 12 }}>Medium (500)</MenuItem>
              <MenuItem value="600" sx={{ fontSize: 12 }}>Semi-Bold (600)</MenuItem>
              <MenuItem value="700" sx={{ fontSize: 12 }}>Bold (700)</MenuItem>
              <MenuItem value="800" sx={{ fontSize: 12 }}>Extra Bold (800)</MenuItem>
              <MenuItem value="900" sx={{ fontSize: 12 }}>Black (900)</MenuItem>
            </TextField>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 0.5 }}>
          <Box>
            <FieldLabel>Align</FieldLabel>
            <TextField
              size="small" select fullWidth
              value={sx.textAlign ?? ''}
              onChange={(e) => set('textAlign', e.target.value || undefined)}
              sx={{ '& .MuiSelect-select': { fontSize: 12, py: '6px' } }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}><em>Default</em></MenuItem>
              <MenuItem value="left" sx={{ fontSize: 12 }}>Left</MenuItem>
              <MenuItem value="center" sx={{ fontSize: 12 }}>Center</MenuItem>
              <MenuItem value="right" sx={{ fontSize: 12 }}>Right</MenuItem>
              <MenuItem value="justify" sx={{ fontSize: 12 }}>Justify</MenuItem>
            </TextField>
          </Box>
          <Box>
            <FieldLabel>Line Height</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={sx.lineHeight ?? ''}
              inputProps={{ min: 0, step: 0.1 }}
              onChange={(e) => set('lineHeight', e.target.value ? Number(e.target.value) : undefined)}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 0.5 }}>
          <Box>
            <FieldLabel>Letter Spacing</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={sx.letterSpacing ?? ''}
              inputProps={{ step: 0.5 }}
              onChange={(e) => set('letterSpacing', e.target.value ? Number(e.target.value) : undefined)}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
          <Box>
            <FieldLabel>Transform</FieldLabel>
            <TextField
              size="small" select fullWidth
              value={sx.textTransform ?? ''}
              onChange={(e) => set('textTransform', e.target.value || undefined)}
              sx={{ '& .MuiSelect-select': { fontSize: 12, py: '6px' } }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}><em>Default</em></MenuItem>
              <MenuItem value="uppercase" sx={{ fontSize: 12 }}>UPPERCASE</MenuItem>
              <MenuItem value="lowercase" sx={{ fontSize: 12 }}>lowercase</MenuItem>
              <MenuItem value="capitalize" sx={{ fontSize: 12 }}>Capitalize</MenuItem>
              <MenuItem value="none" sx={{ fontSize: 12 }}>None</MenuItem>
            </TextField>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* ── Box Shadow ── */}
      <Box>
        <SectionLabel>Box Shadow</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
          <Box>
            <FieldLabel>Offset X</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={shadow.x}
              inputProps={{ step: 1 }}
              onChange={(e) => {
                const s = { ...shadow, x: Number(e.target.value) || 0 };
                set('boxShadow', buildBoxShadow(s));
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
          <Box>
            <FieldLabel>Offset Y</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={shadow.y}
              inputProps={{ step: 1 }}
              onChange={(e) => {
                const s = { ...shadow, y: Number(e.target.value) || 0 };
                set('boxShadow', buildBoxShadow(s));
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
          <Box>
            <FieldLabel>Blur</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={shadow.blur}
              inputProps={{ min: 0, step: 1 }}
              onChange={(e) => {
                const s = { ...shadow, blur: Number(e.target.value) || 0 };
                set('boxShadow', buildBoxShadow(s));
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
          <Box>
            <FieldLabel>Spread</FieldLabel>
            <TextField
              size="small" type="number" fullWidth
              value={shadow.spread}
              inputProps={{ step: 1 }}
              onChange={(e) => {
                const s = { ...shadow, spread: Number(e.target.value) || 0 };
                set('boxShadow', buildBoxShadow(s));
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
        </Box>
        <Box sx={{ mt: 0.5 }}>
          <FieldLabel>Shadow Color</FieldLabel>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <TextField
              size="small" type="color"
              value={shadow.color.startsWith('rgba') ? '#000000' : shadow.color}
              onChange={(e) => {
                const s = { ...shadow, color: e.target.value };
                set('boxShadow', buildBoxShadow(s));
              }}
              sx={{ width: 44, '& input': { height: 28, p: 0.5, cursor: 'pointer' } }}
            />
            <TextField
              fullWidth size="small"
              value={shadow.color}
              placeholder="rgba(0,0,0,0.15)"
              onChange={(e) => {
                const s = { ...shadow, color: e.target.value || 'rgba(0,0,0,0.15)' };
                set('boxShadow', buildBoxShadow(s));
              }}
              sx={{ '& input': { fontSize: 12, py: '6px' } }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Switch
            size="small"
            checked={shadow.inset}
            onChange={(e) => {
              const s = { ...shadow, inset: e.target.checked };
              set('boxShadow', buildBoxShadow(s));
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>Inset (inner shadow)</Typography>
        </Box>
      </Box>

      <Divider />

      {/* ── Opacity ── */}
      <Box>
        <SectionLabel>Opacity</SectionLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slider
            size="small"
            min={0} max={1} step={0.05}
            value={typeof sx.opacity === 'number' ? sx.opacity : 1}
            onChange={(_, v) => set('opacity', v === 1 ? undefined : v)}
            sx={{ flex: 1 }}
          />
          <Typography variant="caption" sx={{ minWidth: 32, textAlign: 'right', color: 'text.secondary' }}>
            {Math.round((typeof sx.opacity === 'number' ? sx.opacity : 1) * 100)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertiesPanel;
