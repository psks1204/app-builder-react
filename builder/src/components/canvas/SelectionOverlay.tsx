// ============================================================
// Selection Overlay — click to select, visual highlight
// ============================================================
import React, { useCallback } from 'react';
import type { LayoutNodeType } from '../../store/types';
import { useBuilderStore } from '../../store/builderStore';

interface SelectionOverlayProps {
    nodeId: string;
    nodeType: LayoutNodeType;
    children: React.ReactNode;
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ nodeId, children }) => {
    const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
    const selectNode = useBuilderStore((s) => s.selectNode);
    const isSelected = selectedNodeId === nodeId;

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            selectNode(nodeId);
        },
        [nodeId, selectNode],
    );

    return (
        <div
            onClick={handleClick}
            className={isSelected ? 'layout-node--selected' : ''}
        >
            {children}
        </div>
    );
};

export default SelectionOverlay;
