// ============================================================
// App.tsx — Main application shell
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import DndProvider from './dnd/DndProvider';
import HeaderBar from './components/shell/HeaderBar';
import PalettePanel from './components/palette/PalettePanel';
import Canvas from './components/canvas/Canvas';
import PropertiesPanel from './components/properties/PropertiesPanel';
import ExportDialog from './components/dialogs/ExportDialog';
import { useBuilderStore } from './store/builderStore';
import { useKeyboardHistory } from './store/history';
import { loadAutoSave, autoSave } from './persistence/storageAdapter';

const App: React.FC = () => {
    const [exportOpen, setExportOpen] = useState(false);

    // Keyboard shortcuts for undo/redo
    useKeyboardHistory();

    // Auto-load on mount
    const setLayoutTree = useBuilderStore((s) => s.setLayoutTree);
    const setDesignName = useBuilderStore((s) => s.setDesignName);

    useEffect(() => {
        const saved = loadAutoSave();
        if (saved && saved.layoutTree.length > 0) {
            const resume = window.confirm(`Resume previous design "${saved.designName || 'Untitled'}"?`);
            if (resume) {
                setLayoutTree(saved.layoutTree);
                if (saved.designName) setDesignName(saved.designName);
            }
        }
    }, [setLayoutTree, setDesignName]);

    // Auto-save on every tree change
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const designName = useBuilderStore((s) => s.designName);
    const themeMode = useBuilderStore((s) => s.themeMode);

    useEffect(() => {
        if (layoutTree.length > 0) {
            autoSave(layoutTree, designName ?? 'Untitled', themeMode);
        }
    }, [layoutTree, designName, themeMode]);

    // Deselect when clicking canvas background
    const selectNode = useBuilderStore((s) => s.selectNode);
    const handleCanvasClick = useCallback(() => selectNode(null), [selectNode]);

    return (
        <DndProvider>
            <div className="builder-shell" onClick={handleCanvasClick}>
                <HeaderBar onExport={() => setExportOpen(true)} />
                <div className="builder-body">
                    {/* Left Sidebar — Palette */}
                    <div className="builder-sidebar">
                        <PalettePanel />
                    </div>

                    {/* Canvas */}
                    <Canvas />

                    {/* Right Sidebar — Properties */}
                    <div className="builder-sidebar builder-sidebar--right">
                        <PropertiesPanel />
                    </div>
                </div>
            </div>

            <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
        </DndProvider>
    );
};

export default App;
