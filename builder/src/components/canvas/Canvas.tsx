// ============================================================
// Canvas — Main canvas with droppable root zone
// ============================================================
import React from 'react';
import DroppableZone from '../../dnd/DroppableZone';
import LayoutRenderer from './LayoutRenderer';
import { useBuilderStore } from '../../store/builderStore';

const Canvas: React.FC = () => {
    const layoutTree = useBuilderStore((s) => s.layoutTree);

    return (
        <div className="builder-canvas">
            <DroppableZone id="canvas-root" nodeType="root" className="builder-canvas__inner">
                {layoutTree.length === 0 ? (
                    <div className="builder-canvas__empty">
                        Drag a Container or Flex Container here to start building
                    </div>
                ) : (
                    <LayoutRenderer nodes={layoutTree} />
                )}
            </DroppableZone>
        </div>
    );
};

export default Canvas;
