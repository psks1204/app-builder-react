// ============================================================
// Container Node — with quick-add "+ Row" button
// ICG layout classes stripped from canvas to avoid conflicts
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import SelectionOverlay from './SelectionOverlay';
import { useBuilderStore } from '../../store/builderStore';
import { createAddLayoutCommand } from '../../store/commands';
import { PLACEHOLDER_TEXT } from '../../registry/layoutConstraints';

interface ContainerNodeProps {
    node: LayoutNode;
}

const ContainerNode: React.FC<ContainerNodeProps> = ({ node }) => {
    const executeCommand = useBuilderStore((s) => s.executeCommand);

    // Filter out ICG layout classes for canvas display  
    const canvasClasses = node.icgClasses.filter(
        (c) => !/^lmn-(container|row|col)/.test(c),
    );
    const extraClassStr = canvasClasses.length > 0 ? ' ' + canvasClasses.join(' ') : '';

    const handleAddRow = (e: React.MouseEvent) => {
        e.stopPropagation();
        executeCommand(createAddLayoutCommand('row', node.id));
    };

    return (
        <SelectionOverlay nodeId={node.id} nodeType="container">
            <DroppableZone id={node.id} nodeType="container">
                <div className={`layout-node layout-node--container${extraClassStr}`}>
                    <span className="layout-node__label layout-node__label--container">
                        {node.props.fluid ? 'Container (fluid)' : 'Container'}
                    </span>
                    {node.children.length === 0 ? (
                        <div className="layout-node__placeholder">{PLACEHOLDER_TEXT.container}</div>
                    ) : (
                        <LayoutRenderer nodes={node.children} />
                    )}
                    <button
                        className="quick-add-btn quick-add-btn--row"
                        onClick={handleAddRow}
                        title="Add a Row"
                    >
                        + Row
                    </button>
                </div>
            </DroppableZone>
        </SelectionOverlay>
    );
};

export default ContainerNode;
