// ============================================================
// DnD Provider — wraps the builder in @dnd-kit context
// ============================================================
import React, { useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import type { DragData, ContentType, LayoutNodeType } from '../store/types';
import { useBuilderStore } from '../store/builderStore';
import { canDrop } from './dndConstraints';
import { findNode, findParent } from '../engine/layoutTree';
import {
    createAddLayoutCommand,
    createAddComponentCommand,
    createAddContentCommand,
    createMoveCommand,
} from '../store/commands';

interface DndProviderProps {
    children: React.ReactNode;
}

const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
    const executeCommand = useBuilderStore((s) => s.executeCommand);
    const layoutTree = useBuilderStore((s) => s.layoutTree);

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    });
    const keyboardSensor = useSensor(KeyboardSensor);
    const sensors = useSensors(pointerSensor, keyboardSensor);

    const handleDragStart = useCallback((_event: DragStartEvent) => {
        // Could set drag state for overlay — future enhancement
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over) return;

            const dragData = active.data.current as DragData | undefined;
            if (!dragData) return;

            const dropTargetId = over.id as string;
            const dropTargetType = (over.data.current?.nodeType as LayoutNodeType | 'root') ?? 'root';

            // Validate drop
            if (!canDrop(dragData, dropTargetType, layoutTree, dropTargetId === 'canvas-root' ? null : dropTargetId)) {
                return;
            }

            const parentId = dropTargetId === 'canvas-root' ? null : dropTargetId;

            if (dragData.source === 'palette') {
                // New node from palette
                if (dragData.nodeType === 'component' && dragData.componentType) {
                    executeCommand(createAddComponentCommand(dragData.componentType, parentId!));
                } else if (dragData.nodeType === 'content' && dragData.contentType) {
                    executeCommand(createAddContentCommand(dragData.contentType as ContentType, parentId!));
                } else {
                    executeCommand(createAddLayoutCommand(dragData.nodeType, parentId));
                }
            } else if (dragData.source === 'canvas' && dragData.nodeId) {
                // Move existing node
                const node = findNode(layoutTree, dragData.nodeId);
                if (!node) return;
                const oldParent = findParent(layoutTree, dragData.nodeId);
                const oldParentId = oldParent?.id ?? null;
                const oldIndex = oldParent
                    ? oldParent.children.findIndex((c) => c.id === dragData.nodeId)
                    : layoutTree.findIndex((c) => c.id === dragData.nodeId);

                if (oldParentId !== parentId || oldIndex === -1) {
                    executeCommand(createMoveCommand(dragData.nodeId, oldParentId, oldIndex, parentId));
                }
            }
        },
        [executeCommand, layoutTree],
    );

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {children}
            <DragOverlay dropAnimation={null}>
                {/* Simplified drag overlay */}
                <div className="dnd-drag-overlay" />
            </DragOverlay>
        </DndContext>
    );
};

export default DndProvider;
