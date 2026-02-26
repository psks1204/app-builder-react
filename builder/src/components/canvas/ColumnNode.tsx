// ============================================================
// Column Node — shows proportional width in the 12-col grid
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { buildClassString } from '../../utils/icgClassBuilder';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

const ColumnNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const xs = (node.props.xs as number) || 12;
    // CSS grid-column span — how many of the 12 grid tracks this column occupies
    const colSpan = Math.min(xs, 12);

    return (
        <SelectionOverlay nodeId={node.id} nodeType="column">
            <DroppableZone id={node.id} nodeType="column">
                <div
                    className={buildClassString('layout-node', 'layout-node--column', ...node.icgClasses)}
                    style={{ gridColumn: `span ${colSpan}` }}
                >
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
