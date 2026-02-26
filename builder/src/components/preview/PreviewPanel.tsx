// ============================================================
// Preview Panel — Full preview of the design without builder chrome
// ============================================================
import React from 'react';
import PreviewRenderer from './PreviewRenderer';
import { useBuilderStore } from '../../store/builderStore';

const PreviewPanel: React.FC = () => {
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const themeMode = useBuilderStore((s) => s.themeMode);

    if (layoutTree.length === 0) {
        return (
            <div className="preview-panel">
                <div className="preview-panel__empty">
                    No components to preview. Switch to Builder mode and add some elements.
                </div>
            </div>
        );
    }

    return (
        <div className={`preview-panel ${themeMode === 'dark' ? 'preview-panel--dark' : ''}`}>
            <div className="preview-panel__viewport">
                <PreviewRenderer nodes={layoutTree} />
            </div>
        </div>
    );
};

export default PreviewPanel;
