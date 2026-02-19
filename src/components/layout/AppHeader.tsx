import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Tooltip, Divider, Box, Chip,
  Menu, MenuItem, TextField,
} from '@mui/material';
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
  DeleteSweep as ClearIcon,
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  Visibility as PreviewIcon,
  Code as ExportIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CropFree as ResetZoomIcon,
  DesktopWindows as DesktopIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';
import ExportModal from '../preview/ExportModal';
import PreviewModal from '../preview/PreviewModal';
import SaveDesignDialog from '../dialogs/SaveDesignDialog';
import OpenDesignDialog from '../dialogs/OpenDesignDialog';

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: '1024 × 768', w: 1024, h: 768 },
  { label: '1280 × 800', w: 1280, h: 800 },
  { label: '1366 × 768', w: 1366, h: 768 },
  { label: '1440 × 900', w: 1440, h: 900 },
  { label: '1536 × 864', w: 1536, h: 864 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
];

const AppHeader: React.FC = () => {
  const {
    themeMode, toggleTheme, viewport, deviceFrame, updateDeviceFrame,
    undo, redo, clearCanvas, saveToLocalStorage,
    zoomIn, zoomOut, resetZoom,
    currentDesignName,
  } = useBuilderStore();

  const [showExport, setShowExport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [sizeAnchor, setSizeAnchor] = useState<null | HTMLElement>(null);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', zIndex: 1201 }}
      >
        <Toolbar variant="dense" sx={{ gap: 0.5, minHeight: 44 }}>
          {/* Brand */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 2, color: 'primary.main' }}>
            ⚡ App Builder
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Undo / Redo */}
          <Tooltip title="Undo (Ctrl+Z)">
            <IconButton onClick={undo}><UndoIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Shift+Z)">
            <IconButton onClick={redo}><RedoIcon fontSize="small" /></IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Zoom */}
          <Tooltip title="Zoom Out (Ctrl+-)">
            <IconButton onClick={zoomOut}><ZoomOutIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Chip
            label={`${Math.round(viewport.zoom * 100)}%`}
            size="small"
            onClick={resetZoom}
            sx={{ minWidth: 52, cursor: 'pointer' }}
          />
          <Tooltip title="Zoom In (Ctrl+=)">
            <IconButton onClick={zoomIn}><ZoomInIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom (Ctrl+0)">
            <IconButton onClick={resetZoom}><ResetZoomIcon fontSize="small" /></IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Device size */}
          <Tooltip title="Desktop size">
            <IconButton onClick={(e) => setSizeAnchor(e.currentTarget)}>
              <DesktopIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Chip
            label={`${deviceFrame.width}×${deviceFrame.height}`}
            size="small"
            onClick={(e) => setSizeAnchor(e.currentTarget as HTMLElement)}
            sx={{ minWidth: 80, cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}
          />
          <Menu
            anchorEl={sizeAnchor}
            open={Boolean(sizeAnchor)}
            onClose={() => setSizeAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            {PRESETS.map((p) => (
              <MenuItem
                key={p.label}
                selected={deviceFrame.width === p.w && deviceFrame.height === p.h}
                onClick={() => { updateDeviceFrame({ width: p.w, height: p.h }); setSizeAnchor(null); }}
                sx={{ fontSize: 13 }}
              >
                {p.label}
              </MenuItem>
            ))}
            <Divider />
            <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small" type="number" label="W"
                value={deviceFrame.width}
                onChange={(e) => updateDeviceFrame({ width: Math.max(320, Number(e.target.value) || 1280) })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 80, '& input': { fontSize: 12, py: 0.75 } }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>×</Typography>
              <TextField
                size="small" type="number" label="H"
                value={deviceFrame.height}
                onChange={(e) => updateDeviceFrame({ height: Math.max(200, Number(e.target.value) || 800) })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 80, '& input': { fontSize: 12, py: 0.75 } }}
              />
            </Box>
            <Divider />
            <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>BG</Typography>
              <input
                type="color"
                value={deviceFrame.bgColor || '#ffffff'}
                onChange={(e) => updateDeviceFrame({ bgColor: e.target.value })}
                style={{ width: 28, height: 28, border: '1px solid #ccc', borderRadius: 4, padding: 0, cursor: 'pointer', background: 'none' }}
              />
              <TextField
                size="small"
                value={deviceFrame.bgColor || '#ffffff'}
                onChange={(e) => updateDeviceFrame({ bgColor: e.target.value })}
                sx={{ width: 90, '& input': { fontSize: 12, py: 0.75 } }}
              />
            </Box>
          </Menu>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Current design name */}
          {currentDesignName && (
            <Chip
              label={currentDesignName}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mr: 1, maxWidth: 180, fontWeight: 500 }}
            />
          )}

          {/* Actions */}
          <Tooltip title="Open Design">
            <IconButton onClick={() => setShowOpen(true)}><OpenIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Save Design (Ctrl+S)">
            <IconButton onClick={() => setShowSave(true)}><SaveIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Preview">
            <IconButton onClick={() => setShowPreview(true)}><PreviewIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Export Code">
            <IconButton onClick={() => setShowExport(true)}><ExportIcon fontSize="small" /></IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Clear Canvas">
            <IconButton color="error" onClick={clearCanvas}><ClearIcon fontSize="small" /></IconButton>
          </Tooltip>

          <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme}>
              {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <ExportModal open={showExport} onClose={() => setShowExport(false)} />
      <PreviewModal open={showPreview} onClose={() => setShowPreview(false)} />
      <SaveDesignDialog open={showSave} onClose={() => setShowSave(false)} />
      <OpenDesignDialog open={showOpen} onClose={() => setShowOpen(false)} />
    </>
  );
};

export default AppHeader;
