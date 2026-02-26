// ============================================================
// Container Node — renders lmn-container / lmn-container-fluid
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { buildClassString } from '../../utils/icgClassBuilder';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

interface ContainerNodeProps {
    node: LayoutNode;
}

const ContainerNode: React.FC<ContainerNodeProps> = ({ node }) => {
    const containerClass = node.props.fluid ? 'lmn-container-fluid' : 'lmn-container';
    const extraClasses = node.icgClasses.filter(
        (c) => c !== 'lmn-container' && c !== 'lmn-container-fluid',
    );

    return (
        <SelectionOverlay nodeId={node.id} nodeType="container">
            <DroppableZone id={node.id} nodeType="container">
                <div
                    className={buildClassString(
                        'layout-node',
                        'layout-node--container',
                        containerClass,
                        ...extraClasses,
                    )}
                >
                    <span className="layout-node__label layout-node__label--container">
                        {node.props.fluid ? 'Container (fluid)' : 'Container'}
                    </span>
                    {node.children.length === 0 ? (
                        <div className="layout-node__placeholder">{PLACEHOLDER_TEXT.container}</div>
                    ) : (
                        <LayoutRenderer nodes={node.children} />
                    )}
                </div>
            </DroppableZone>
        </SelectionOverlay>
    );
};

export default ContainerNode;
