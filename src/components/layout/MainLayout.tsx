import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import AppHeader from './AppHeader';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Canvas from '../canvas/Canvas';
import { useBuilderStore } from '../../store/useBuilderStore';
import { getComponentMeta } from '../palette/componentRegistry';
import { generateId } from '../../utils/idGenerator';
import type { CanvasNode, ComponentMeta } from '../../store/types';

const MainLayout: React.FC = () => {
  const { addNode, viewport } = useBuilderStore();
  const [dragMeta, setDragMeta] = React.useState<ComponentMeta | null>(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  /* Track native pointer position for accurate drop placement */
  useEffect(() => {
    const track = (e: PointerEvent) => {
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', track, { passive: true });
    return () => window.removeEventListener('pointermove', track);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const meta = event.active.data.current?.meta as ComponentMeta | undefined;
    if (meta) setDragMeta(meta);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragMeta(null);
    const meta = event.active.data.current?.meta as ComponentMeta | undefined;
    if (!meta) return;

    const canvasEl = document.getElementById('builder-canvas');
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();

    // Use native pointer position — always accurate
    const screenX = lastMouse.current.x;
    const screenY = lastMouse.current.y;

    // Only create node if pointer is over the canvas area
    if (screenX < rect.left || screenX > rect.right || screenY < rect.top || screenY > rect.bottom) return;

    // Convert screen position to canvas-inner coordinates
    const x = (screenX - rect.left - viewport.panX) / viewport.zoom;
    const y = (screenY - rect.top - viewport.panY) / viewport.zoom;

    const node: CanvasNode = {
      id: generateId(),
      type: meta.type,
      props: { ...meta.defaultProps },
      sx: { ...meta.defaultSx },
      position: { x: Math.max(0, x - meta.defaultSize.width / 2), y: Math.max(0, y - meta.defaultSize.height / 2) },
      size: { ...meta.defaultSize },
      children: [],
      parentId: null,
      isContainer: meta.isContainer,
      zIndex: 0,
      locked: false,
    };

    addNode(node);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppHeader />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <LeftSidebar />
          <Canvas />
          <RightSidebar />
        </Box>
      </Box>

      <DragOverlay>
        {dragMeta && (
          <Paper elevation={8} sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, pointerEvents: 'none' }}>
            <Typography variant="caption">{dragMeta.displayName}</Typography>
          </Paper>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default MainLayout;
