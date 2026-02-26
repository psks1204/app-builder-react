// ============================================================
// Draggable Palette Item — drag source for palette items
// ============================================================
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { DragData } from '../store/types';

interface DraggablePaletteItemProps {
    id: string;
    dragData: DragData;
    children: React.ReactNode;
}

const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({
    id,
    dragData,
    children,
}) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: dragData,
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="palette-item"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {children}
        </div>
    );
};

export default DraggablePaletteItem;
