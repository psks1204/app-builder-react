// ============================================================
// Row Node — displays children as a 12-column grid layout
// ICG layout classes stripped from canvas to avoid conflicts
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

const RowNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const colCount = node.children.filter((c) => c.type === 'column').length;

    // Filter out ICG layout classes for canvas display
    const canvasClasses = node.icgClasses.filter(
        (c) => !/^lmn-(row|no-gutters|container|col)/.test(c),
    );
    const extraClassStr = canvasClasses.length > 0 ? ' ' + canvasClasses.join(' ') : '';

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
                </div>
            </DroppableZone>
        </SelectionOverlay>
    );
};

export default RowNode;
