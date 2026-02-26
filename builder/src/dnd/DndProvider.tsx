// ============================================================
// DnD Provider — wraps the builder in @dnd-kit context
// With auto-redistribute column widths on column add
// ============================================================
import React, { useCallback, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
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
    createBatchCommand,
    createUpdatePropsCommand,
    createUpdateClassesCommand,
} from '../store/commands';

interface DndProviderProps {
    children: React.ReactNode;
}

const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
    const executeCommand = useBuilderStore((s) => s.executeCommand);
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const [activeDragData, setActiveDragData] = useState<DragData | null>(null);

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
    });
    const keyboardSensor = useSensor(KeyboardSensor);
    const sensors = useSensors(pointerSensor, keyboardSensor);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const dragData = event.active.data.current as DragData | undefined;
        setActiveDragData(dragData ?? null);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveDragData(null);
            const { active, over } = event;
            if (!over) return;

            const dragData = active.data.current as DragData | undefined;
            if (!dragData) return;

            const dropTargetId = over.id as string;
            const dropTargetType =
                (over.data.current?.nodeType as LayoutNodeType | 'root') ?? 'root';

            if (
                !canDrop(
                    dragData,
                    dropTargetType,
                    layoutTree,
                    dropTargetId === 'canvas-root' ? null : dropTargetId,
                )
            ) {
                return;
            }

            const parentId = dropTargetId === 'canvas-root' ? null : dropTargetId;

            if (dragData.source === 'palette') {
                if (dragData.nodeType === 'component' && dragData.componentType) {
                    executeCommand(createAddComponentCommand(dragData.componentType, parentId!));
                } else if (dragData.nodeType === 'content' && dragData.contentType) {
                    executeCommand(createAddContentCommand(dragData.contentType as ContentType, parentId!));
                } else if (dragData.nodeType === 'column' && parentId) {
                    // ── Column add: enforce max 12 & auto-redistribute ──
                    const parentNode = findNode(layoutTree, parentId);
                    if (parentNode && parentNode.type === 'row') {
                        const currentColCount = parentNode.children.filter((c) => c.type === 'column').length;
                        if (currentColCount >= 12) {
                            // Max 12 columns reached — silently reject
                            return;
                        }
                    }

                    // Add the column first
                    executeCommand(createAddLayoutCommand(dragData.nodeType, parentId));

                    // After add, redistribute all column widths + classes evenly
                    const updatedTree = useBuilderStore.getState().layoutTree;
                    const updatedParent = findNode(updatedTree, parentId);
                    if (updatedParent && updatedParent.type === 'row') {
                        const cols = updatedParent.children.filter((c) => c.type === 'column');
                        const totalCols = cols.length;
                        if (totalCols > 0 && totalCols <= 12) {
                            const evenWidth = Math.floor(12 / totalCols);
                            const remainder = 12 % totalCols;

                            const cmds: ReturnType<typeof createUpdatePropsCommand>[] = [];

                            cols.forEach((col, i) => {
                                const width = i < remainder ? evenWidth + 1 : evenWidth;

                                // Update props (xs width)
                                cmds.push(
                                    createUpdatePropsCommand(col.id, { xs: col.props.xs }, { xs: width }),
                                );

                                // Update ICG classes: replace column classes, keep others
                                const nonColClasses = col.icgClasses.filter(
                                    (c) => !/^lmn-col(-\d+|-[a-z]+-\d+)?$/.test(c),
                                );
                                const newClasses = [`lmn-col-${width}`, ...nonColClasses];
                                cmds.push(
                                    createUpdateClassesCommand(col.id, [...col.icgClasses], newClasses),
                                );
                            });

                            if (cmds.length > 0) {
                                executeCommand(createBatchCommand(cmds, 'Redistribute column widths'));
                            }
                        }
                    }
                } else {
                    executeCommand(createAddLayoutCommand(dragData.nodeType, parentId));
                }
            } else if (dragData.source === 'canvas' && dragData.nodeId) {
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

    const handleDragCancel = useCallback(() => {
        setActiveDragData(null);
    }, []);

    const getDragLabel = (data: DragData): string => {
        if (data.componentType) return data.componentType;
        if (data.contentType) {
            const labels: Record<string, string> = {
                heading: 'Heading',
                'display-heading': 'Display Heading',
                paragraph: 'Paragraph',
                lead: 'Lead Text',
            };
            return labels[data.contentType] ?? data.contentType;
        }
        const labels: Record<string, string> = {
            container: 'Container',
            row: 'Row',
            column: 'Column',
            'flex-container': 'Flex Container',
        };
        return labels[data.nodeType] ?? data.nodeType;
    };

    const getDragColor = (data: DragData): string => {
        if (data.componentType) return '#2563eb';
        if (data.contentType) return '#059669';
        const colors: Record<string, string> = {
            container: '#475569',
            row: '#2563eb',
            column: '#16a34a',
            'flex-container': '#8b5cf6',
        };
        return colors[data.nodeType] ?? '#64748b';
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {children}
            <DragOverlay dropAnimation={null}>
                {activeDragData ? (
                    <div
                        className="dnd-drag-overlay"
                        style={{
                            padding: '8px 16px',
                            background: '#fff',
                            border: `2px solid ${getDragColor(activeDragData)}`,
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "'Inter', sans-serif",
                            color: getDragColor(activeDragData),
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {getDragLabel(activeDragData)}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default DndProvider;
