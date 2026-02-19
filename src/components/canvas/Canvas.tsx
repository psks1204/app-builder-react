import React, { useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { useBuilderStore } from '../../store/useBuilderStore';
import CanvasItem from './CanvasItem';
import GridOverlay from './GridOverlay';
import DeviceFrame from './DeviceFrame';

const Canvas: React.FC = () => {
  const { canvasNodes, viewport, setViewport, selectNode } = useBuilderStore();
  const { setNodeRef } = useDroppable({ id: 'canvas-drop-zone' });

  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  /* ── Wheel → zoom ─────────────────────────────────────── */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newZoom = Math.min(3, Math.max(0.2, viewport.zoom + delta));
        setViewport({ zoom: newZoom });
      } else {
        // Pan via scroll
        setViewport({
          panX: viewport.panX - e.deltaX,
          panY: viewport.panY - e.deltaY,
        });
      }
    },
    [viewport, setViewport],
  );

  /* ── Middle-click pan ──────────────────────────────────── */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        // Middle click
        e.preventDefault();
        isPanning.current = true;
        lastPan.current = { x: e.clientX, y: e.clientY };
      }
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastPan.current.x;
      const dy = e.clientY - lastPan.current.y;
      lastPan.current = { x: e.clientX, y: e.clientY };
      setViewport({ panX: viewport.panX + dx, panY: viewport.panY + dy });
    },
    [viewport, setViewport],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  /* ── Click canvas bg → deselect ────────────────────────── */
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).id === 'builder-canvas-inner' || (e.target as HTMLElement).id === 'builder-canvas') {
        selectNode(null);
      }
    },
    [selectNode],
  );

  return (
    <Box
      id="builder-canvas"
      ref={setNodeRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      sx={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: (t) => t.palette.mode === 'dark' ? '#0d0d0d' : '#e8e8e8',
        cursor: isPanning.current ? 'grabbing' : 'default',
      }}
    >
      {/* Zoom/pan layer */}
      <Box
        id="builder-canvas-inner"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 5000,
          height: 5000,
          transformOrigin: '0 0',
          transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
        }}
      >
        <GridOverlay />

        {/* Desktop device frame */}
        <DeviceFrame />

        {canvasNodes.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.disabled', mb: 1 }}>
              Drag components here
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Use scroll to pan &bull; Ctrl+scroll to zoom
            </Typography>
          </Box>
        )}

        {canvasNodes.map((node) => (
          <CanvasItem key={node.id} node={node} />
        ))}
      </Box>
    </Box>
  );
};

export default Canvas;
