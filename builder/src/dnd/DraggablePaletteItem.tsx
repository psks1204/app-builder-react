// ============================================================
// Draggable Palette Item — drag source + click to add
// ============================================================
import React, { useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { DragData } from '../store/types';

interface DraggablePaletteItemProps {
    id: string;
    dragData: DragData;
    children: React.ReactNode;
    onClick?: () => void;
}

const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({
    id,
    dragData,
    children,
    onClick,
}) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: dragData,
    });

    // Track mouse down position to distinguish click from drag
    const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
        // Let dnd-kit handle the mouse down too
        (listeners as any)?.onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (mouseDownPos.current && onClick) {
            const dx = Math.abs(e.clientX - mouseDownPos.current.x);
            const dy = Math.abs(e.clientY - mouseDownPos.current.y);
            // Only fire click if mouse barely moved (< 5px = click, not drag)
            if (dx < 5 && dy < 5) {
                onClick();
            }
        }
        mouseDownPos.current = null;
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="palette-item"
            style={{ opacity: isDragging ? 0.5 : 1 }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            {children}
        </div>
    );
};

export default DraggablePaletteItem;
