import React, { useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import { useBuilderStore } from '../../store/useBuilderStore';
import ComponentRenderer from '../preview/ComponentRenderer';
import type { CanvasNode } from '../../store/types';

/* ─── Resize handle positions ────────────────────────────── */
type HandlePos = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const HANDLES: HandlePos[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

const cursorMap: Record<HandlePos, string> = {
  n: 'ns-resize', s: 'ns-resize',
  e: 'ew-resize', w: 'ew-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
  nw: 'nwse-resize', se: 'nwse-resize',
};

const handleStyle = (pos: HandlePos): Record<string, unknown> => {
  const size = 8;
  const half = -size / 2;
  const base = {
    position: 'absolute' as const,
    width: size,
    height: size,
    bgcolor: 'primary.main',
    border: '1px solid',
    borderColor: 'background.paper',
    borderRadius: '2px',
    zIndex: 10,
    cursor: cursorMap[pos],
  };
  switch (pos) {
    case 'n': return { ...base, top: half, left: '50%', transform: 'translateX(-50%)' };
    case 's': return { ...base, bottom: half, left: '50%', transform: 'translateX(-50%)' };
    case 'e': return { ...base, right: half, top: '50%', transform: 'translateY(-50%)' };
    case 'w': return { ...base, left: half, top: '50%', transform: 'translateY(-50%)' };
    case 'ne': return { ...base, top: half, right: half };
    case 'nw': return { ...base, top: half, left: half };
    case 'se': return { ...base, bottom: half, right: half };
    case 'sw': return { ...base, bottom: half, left: half };
  }
};

interface CanvasItemProps {
  node: CanvasNode;
}

const CanvasItem: React.FC<CanvasItemProps> = ({ node }) => {
  const {
    selectedNodeIds, selectNode, toggleNodeSelection,
    updateNodePosition, updateNodeSize, pushHistory, viewport,
  } = useBuilderStore();

  const isSelected = selectedNodeIds.has(node.id);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef({ handle: '' as HandlePos, startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 });

  /* ── Drag move ─────────────────────────────────────────── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (node.locked) return;
    // Ignore if resize handle
    if ((e.target as HTMLElement).dataset.resize) return;
    e.stopPropagation();

    if (e.shiftKey) {
      toggleNodeSelection(node.id);
      return;
    }
    if (!isSelected) selectNode(node.id);

    pushHistory();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: node.position.x, origY: node.position.y };

    const onMove = (me: MouseEvent) => {
      const dx = (me.clientX - dragRef.current.startX) / viewport.zoom;
      const dy = (me.clientY - dragRef.current.startY) / viewport.zoom;
      updateNodePosition(node.id, {
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [node, isSelected, selectNode, toggleNodeSelection, updateNodePosition, pushHistory, viewport.zoom]);

  /* ── Resize ────────────────────────────────────────────── */
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: HandlePos) => {
    e.stopPropagation();
    e.preventDefault();
    pushHistory();

    resizeRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.position.x,
      origY: node.position.y,
      origW: node.size.width,
      origH: node.size.height,
    };

    const onMove = (me: MouseEvent) => {
      const r = resizeRef.current;
      const dx = (me.clientX - r.startX) / viewport.zoom;
      const dy = (me.clientY - r.startY) / viewport.zoom;

      let newX = r.origX;
      let newY = r.origY;
      let newW = r.origW;
      let newH = r.origH;

      if (handle.includes('e')) newW = Math.max(20, r.origW + dx);
      if (handle.includes('w')) { newW = Math.max(20, r.origW - dx); newX = r.origX + (r.origW - newW); }
      if (handle.includes('s')) newH = Math.max(20, r.origH + dy);
      if (handle.includes('n')) { newH = Math.max(20, r.origH - dy); newY = r.origY + (r.origH - newH); }

      updateNodeSize(node.id, { width: newW, height: newH });
      updateNodePosition(node.id, { x: newX, y: newY });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [node, updateNodeSize, updateNodePosition, pushHistory, viewport.zoom]);

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
        zIndex: node.zIndex,
        outline: isSelected ? '2px solid' : '1px solid transparent',
        outlineColor: isSelected ? 'primary.main' : 'transparent',
        cursor: node.locked ? 'default' : 'move',
        '&:hover': {
          outline: isSelected ? '2px solid' : '1px solid',
          outlineColor: isSelected ? 'primary.main' : 'primary.light',
        },
        boxSizing: 'border-box',
      }}
    >
      {/* Rendered MUI component */}
      <Box sx={{ width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
        <ComponentRenderer node={node} />
      </Box>

      {/* Selection label */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: -18,
            left: 0,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: 10,
            px: 0.5,
            borderRadius: '2px 2px 0 0',
            lineHeight: '16px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {node.type}
        </Box>
      )}

      {/* 8 resize handles */}
      {isSelected && !node.locked && HANDLES.map((h) => (
        <Box
          key={h}
          data-resize="true"
          onMouseDown={(e) => handleResizeStart(e, h)}
          sx={handleStyle(h)}
        />
      ))}
    </Box>
  );
};

export default CanvasItem;
