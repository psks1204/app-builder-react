// ============================================================
// Flex Container Node — ICG layout classes filtered for canvas
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

const FlexContainerNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    // Filter out ICG layout classes for canvas display to avoid conflicts
    const canvasClasses = node.icgClasses.filter(
        (c) => !/^lmn-(d-flex|flex-|justify-|align-|container|row|col)/.test(c),
    );
    const extraClassStr = canvasClasses.length > 0 ? ' ' + canvasClasses.join(' ') : '';

    return (
        <SelectionOverlay nodeId={node.id} nodeType="flex-container">
            <DroppableZone id={node.id} nodeType="flex-container">
                <div className={`layout-node layout-node--flex-container${extraClassStr}`}>
                    <span className="layout-node__label layout-node__label--flex">Flex Container</span>
                    {node.children.length === 0 ? (
                        <div className="layout-node__placeholder">
                            {PLACEHOLDER_TEXT['flex-container']}
                        </div>
                    ) : (
                        <LayoutRenderer nodes={node.children} />
                    )}
                </div>
            </DroppableZone>
        </SelectionOverlay>
    );
};

export default FlexContainerNode;
