// ============================================================
// Row Node — with quick-add "+ Column" button (max 12)
// Redistributes columns automatically on add
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { useBuilderStore } from '../../store/builderStore';
import { findNode } from '../../engine/layoutTree';
import {
    createAddLayoutCommand,
    createBatchCommand,
    createUpdatePropsCommand,
    createUpdateClassesCommand,
} from '../../store/commands';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

const RowNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const executeCommand = useBuilderStore((s) => s.executeCommand);
    const colCount = node.children.filter((c) => c.type === 'column').length;

    // Filter out ICG layout classes for canvas display
    const canvasClasses = node.icgClasses.filter(
        (c) => !/^lmn-(row|no-gutters|container|col)/.test(c),
    );
    const extraClassStr = canvasClasses.length > 0 ? ' ' + canvasClasses.join(' ') : '';

    const handleAddColumn = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (colCount >= 12) return;

        // Add the column
        executeCommand(createAddLayoutCommand('column', node.id));

        // Redistribute all column widths + classes evenly
        const updatedTree = useBuilderStore.getState().layoutTree;
        const updatedRow = findNode(updatedTree, node.id);
        if (updatedRow && updatedRow.type === 'row') {
            const cols = updatedRow.children.filter((c) => c.type === 'column');
            const totalCols = cols.length;
            if (totalCols > 0 && totalCols <= 12) {
                const evenWidth = Math.floor(12 / totalCols);
                const remainder = 12 % totalCols;

                const cmds: ReturnType<typeof createUpdatePropsCommand>[] = [];

                cols.forEach((col, i) => {
                    const width = i < remainder ? evenWidth + 1 : evenWidth;

                    cmds.push(
                        createUpdatePropsCommand(col.id, { xs: col.props.xs }, { xs: width }),
                    );

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
    };

    return (
        <SelectionOverlay nodeId={node.id} nodeType="row">
            <DroppableZone id={node.id} nodeType="row">
                <div className={`layout-node layout-node--row${extraClassStr}`}>
                    <span className="layout-node__label layout-node__label--row">
                        Row {colCount > 0 ? `(${colCount} col${colCount > 1 ? 's' : ''})` : ''}
                    </span>
                    {node.children.length === 0 ? (
                        <div className="layout-node__placeholder">{PLACEHOLDER_TEXT.row}</div>
                    ) : (
                        <div className="row-grid">
                            <LayoutRenderer nodes={node.children} />
                        </div>
                    )}
                    {colCount < 12 && (
                        <button
                            className="quick-add-btn quick-add-btn--col"
                            onClick={handleAddColumn}
                            title={`Add Column (${colCount}/12)`}
                        >
                            + Col ({12 - colCount} left)
                        </button>
                    )}
                </div>
            </DroppableZone>
        </SelectionOverlay>
    );
};

export default RowNode;
