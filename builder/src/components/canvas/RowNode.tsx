import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { buildClassString } from '../../utils/icgClassBuilder';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

const RowNode: React.FC<{ node: LayoutNode }> = ({ node }) => (
    <SelectionOverlay nodeId={node.id} nodeType="row">
        <DroppableZone id={node.id} nodeType="row">
            <div className={buildClassString('layout-node', 'layout-node--row', ...node.icgClasses)}>
                <span className="layout-node__label">Row</span>
                {node.children.length === 0 ? (
                    <div className="layout-node__placeholder">{PLACEHOLDER_TEXT.row}</div>
                ) : (
                    <LayoutRenderer nodes={node.children} />
                )}
            </div>
        </DroppableZone>
    </SelectionOverlay>
);

export default RowNode;
