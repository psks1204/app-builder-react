// ============================================================
// Column Node — shows proportional width in the 12-col grid
// gridColumn is on the outermost wrapper so CSS grid can see it
// ICG column classes are stripped from canvas to avoid conflicts
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

const ColumnNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const xs = (node.props.xs as number) || 12;
    // How many of the 12 grid tracks this column occupies
    const colSpan = Math.min(xs, 12);

    // Filter out ICG column/grid classes for the canvas display
    // These would conflict with our canvas CSS grid system
    // They're still stored on the node and used in preview/export
    const canvasClasses = node.icgClasses.filter(
        (c) => !/^lmn-(col|row|container|no-gutters)/.test(c),
    );
    const extraClassStr = canvasClasses.length > 0 ? ' ' + canvasClasses.join(' ') : '';

    return (
        <SelectionOverlay nodeId={node.id} nodeType="column" style={{ gridColumn: `span ${colSpan}` }}>
            <DroppableZone id={node.id} nodeType="column">
                <div className={`layout-node layout-node--column${extraClassStr}`}>
                    <span className="layout-node__label layout-node__label--column">
                        Col {colSpan}/12
                    </span>
                    {node.children.length === 0 ? (
                        <div className="layout-node__placeholder">
                            {PLACEHOLDER_TEXT.column}
                            <div className="layout-node__col-size">{colSpan} of 12</div>
                        </div>
                    ) : (
                        <LayoutRenderer nodes={node.children} />
                    )}
                </div>
            </DroppableZone>
        </SelectionOverlay>
    );
};

export default ColumnNode;
