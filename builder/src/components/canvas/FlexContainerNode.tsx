import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { buildClassString } from '../../utils/icgClassBuilder';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

const FlexContainerNode: React.FC<{ node: LayoutNode }> = ({ node }) => (
    <SelectionOverlay nodeId={node.id} nodeType="flex-container">
        <DroppableZone id={node.id} nodeType="flex-container">
            <div
                className={buildClassString(
                    'layout-node',
                    'layout-node--flex-container',
                    ...node.icgClasses,
                )}
            >
                <span className="layout-node__label">Flex Container</span>
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

export default FlexContainerNode;
