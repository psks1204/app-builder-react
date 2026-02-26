// ============================================================
// Canvas — Main canvas with droppable root zone
// ============================================================
import React from 'react';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import { useBuilderStore } from '../../store/builderStore';

const Canvas: React.FC = () => {
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const selectNode = useBuilderStore((s) => s.selectNode);

    const handleCanvasClick = (e: React.MouseEvent) => {
        // Only deselect when clicking the canvas itself, not a child node
        if (e.target === e.currentTarget) {
            selectNode(null);
        }
    };

    return (
        <div className="builder-canvas" onClick={handleCanvasClick}>
            <DroppableZone id="canvas-root" nodeType="root" className="builder-canvas__inner">
                {layoutTree.length === 0 ? (
                    <div className="builder-canvas__empty">
                        <div className="builder-canvas__empty-icon">📐</div>
                        <div className="builder-canvas__empty-text">
                            Drop a Container or Flex Container to start
                        </div>
                        <div className="builder-canvas__empty-hint">
                            Drag items from the left palette onto this canvas
                        </div>
                    </div>
                ) : (
                    <LayoutRenderer nodes={layoutTree} />
                )}
            </DroppableZone>
        </div>
    );
};

export default Canvas;
