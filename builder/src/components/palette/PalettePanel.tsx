// ============================================================
// Palette Panel — Category-based component/content/layout list
// Supports both drag-to-canvas AND click-to-add
// ============================================================
import React, { useCallback } from 'react';
import DraggablePaletteItem from '../../dnd/DraggablePaletteItem';
import { LAYOUT_PALETTE_ITEMS } from '../../registry/layoutConstraints';
import { contentRegistry } from '../../registry/contentRegistry';
import { componentRegistry, componentCategories } from '../../registry/componentRegistry';
import { useBuilderStore } from '../../store/builderStore';
import { canInsert } from '../../engine/layoutValidator';
import { findNode, findParent } from '../../engine/layoutTree';
import {
    createAddLayoutCommand,
    createAddComponentCommand,
    createAddContentCommand,
    createBatchCommand,
    createUpdatePropsCommand,
    createUpdateClassesCommand,
} from '../../store/commands';
import type { DragData, LayoutNodeType, ContentType } from '../../store/types';

/**
 * Walk up from a target node to find the nearest ancestor that accepts
 * the given child type. Returns the target id (null = root).
 */
function findValidParent(
    tree: import('../../store/types').LayoutNode[],
    startId: string | null,
    childType: LayoutNodeType,
): string | null {
    if (startId === null) {
        // Check if root accepts this type
        if (canInsert('root', childType)) return null;
        return null; // Can't place here
    }

    const node = findNode(tree, startId);
    if (!node) return null;

    // Check if the selected node accepts this child
    if (canInsert(node.type, childType)) return startId;

    // Walk up to parent
    const parent = findParent(tree, startId);
    if (parent) {
        if (canInsert(parent.type, childType)) return parent.id;
        // Try grandparent
        const grandParent = findParent(tree, parent.id);
        if (grandParent && canInsert(grandParent.type, childType)) return grandParent.id;
    }

    // Fallback: try root
    if (canInsert('root', childType)) return null;

    return undefined as unknown as string | null; // no valid target
}

const PalettePanel: React.FC = () => {
    const executeCommand = useBuilderStore((s) => s.executeCommand);
    const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
    const layoutTree = useBuilderStore((s) => s.layoutTree);

    /**
     * Click handler for palette items — adds directly to the
     * selected node or walks up to find a valid parent.
     */
    const handleClick = useCallback(
        (dragData: DragData) => {
            const tree = useBuilderStore.getState().layoutTree;
            const selected = useBuilderStore.getState().selectedNodeId;

            if (dragData.nodeType === 'component' && dragData.componentType) {
                const parentId = findValidParent(tree, selected, 'component');
                if (parentId === undefined) return;
                executeCommand(createAddComponentCommand(dragData.componentType, parentId!));
            } else if (dragData.nodeType === 'content' && dragData.contentType) {
                const parentId = findValidParent(tree, selected, 'content');
                if (parentId === undefined) return;
                executeCommand(createAddContentCommand(dragData.contentType as ContentType, parentId!));
            } else if (dragData.nodeType === 'column') {
                // Column needs a row parent — find nearest row
                const parentId = findValidParent(tree, selected, 'column');
                if (parentId === undefined || parentId === null) return;

                const parentNode = findNode(tree, parentId);
                if (parentNode && parentNode.type === 'row') {
                    const colCount = parentNode.children.filter((c) => c.type === 'column').length;
                    if (colCount >= 12) return;
                }

                executeCommand(createAddLayoutCommand('column', parentId));

                // Auto-redistribute columns
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
                            cmds.push(createUpdatePropsCommand(col.id, { xs: col.props.xs }, { xs: width }));
                            const nonColClasses = col.icgClasses.filter(
                                (c) => !/^lmn-col(-\d+|-[a-z]+-\d+)?$/.test(c),
                            );
                            cmds.push(
                                createUpdateClassesCommand(col.id, [...col.icgClasses], [`lmn-col-${width}`, ...nonColClasses]),
                            );
                        });

                        if (cmds.length > 0) {
                            executeCommand(createBatchCommand(cmds, 'Redistribute column widths'));
                        }
                    }
                }
            } else {
                // Layout nodes (container, row, flex-container)
                const parentId = findValidParent(tree, selected, dragData.nodeType);
                if (parentId === undefined) return;
                executeCommand(createAddLayoutCommand(dragData.nodeType, parentId));
            }
        },
        [executeCommand],
    );

    return (
        <div>
            {/* ── Layout Section ─────────────────────────────── */}
            <div className="palette-section">
                <div className="palette-section__title">Layout</div>
                {LAYOUT_PALETTE_ITEMS.map((item) => {
                    const dragData: DragData = { source: 'palette', nodeType: item.nodeType };
                    return (
                        <DraggablePaletteItem
                            key={item.nodeType}
                            id={`palette-layout-${item.nodeType}`}
                            dragData={dragData}
                            onClick={() => handleClick(dragData)}
                        >
                            <span>▦</span>
                            <span>{item.label}</span>
                        </DraggablePaletteItem>
                    );
                })}
            </div>

            {/* ── Content Section ────────────────────────────── */}
            <div className="palette-section">
                <div className="palette-section__title">Content</div>
                {contentRegistry.map((content) => {
                    const dragData: DragData = {
                        source: 'palette',
                        nodeType: 'content',
                        contentType: content.contentType,
                    };
                    return (
                        <DraggablePaletteItem
                            key={content.contentType}
                            id={`palette-content-${content.contentType}`}
                            dragData={dragData}
                            onClick={() => handleClick(dragData)}
                        >
                            <span>T</span>
                            <span>{content.displayName}</span>
                        </DraggablePaletteItem>
                    );
                })}
            </div>

            {/* ── Component Sections (by category) ───────────── */}
            {componentCategories.map((category) => {
                const items = componentRegistry.filter((c) => c.category === category);
                if (items.length === 0) return null;
                return (
                    <div key={category} className="palette-section">
                        <div className="palette-section__title">{category}</div>
                        {items.map((comp) => {
                            const dragData: DragData = {
                                source: 'palette',
                                nodeType: 'component',
                                componentType: comp.type,
                            };
                            return (
                                <DraggablePaletteItem
                                    key={comp.type}
                                    id={`palette-component-${comp.type}`}
                                    dragData={dragData}
                                    onClick={() => handleClick(dragData)}
                                >
                                    <span>◈</span>
                                    <span>{comp.displayName}</span>
                                </DraggablePaletteItem>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default PalettePanel;
