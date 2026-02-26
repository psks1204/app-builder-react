// ============================================================
// Droppable Zone — drop target inside the layout tree
// ============================================================
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { LayoutNodeType } from '../store/types';

interface DroppableZoneProps {
    id: string;
    nodeType: LayoutNodeType | 'root';
    children: React.ReactNode;
    className?: string;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
    id,
    nodeType,
    children,
    className = '',
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { nodeType },
    });

    const dropClass = isOver ? 'dnd-drop-indicator' : '';

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${dropClass}`.trim()}
        >
            {children}
        </div>
    );
};

export default DroppableZone;
