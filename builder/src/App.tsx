// ============================================================
// App.tsx — Main application shell with Builder/Preview toggle
// ============================================================
import React, { useState, useEffect } from 'react';
import DndProvider from './dnd/DndProvider';
import HeaderBar from './components/shell/HeaderBar';
import PalettePanel from './components/palette/PalettePanel';
import Canvas from './components/canvas/Canvas';
import PropertiesPanel from './components/properties/PropertiesPanel';
import PreviewPanel from './components/preview/PreviewPanel';
import ExportDialog from './components/dialogs/ExportDialog';
import { useBuilderStore } from './store/builderStore';
import { useKeyboardHistory } from './store/history';
import { loadAutoSave, autoSave } from './persistence/storageAdapter';

type AppMode = 'builder' | 'preview';

const App: React.FC = () => {
    const [exportOpen, setExportOpen] = useState(false);
    const [appMode, setAppMode] = useState<AppMode>('builder');

    // Keyboard shortcuts for undo/redo
    useKeyboardHistory();

    // Auto-load on mount
    const setLayoutTree = useBuilderStore((s) => s.setLayoutTree);
    const setDesignName = useBuilderStore((s) => s.setDesignName);

    useEffect(() => {
        const saved = loadAutoSave();
        if (saved && saved.layoutTree.length > 0) {
            const resume = window.confirm(
                `Resume previous design "${saved.designName || 'Untitled'}"?`,
            );
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

    return (
        <DndProvider>
            <div className="builder-shell">
                <HeaderBar
                    onExport={() => setExportOpen(true)}
                    appMode={appMode}
                    onModeChange={setAppMode}
                />

                {appMode === 'builder' ? (
                    <div className="builder-body">
                        {/* Left Sidebar — Palette (stop propagation so clicks don't deselect) */}
                        <div className="builder-sidebar" onClick={(e) => e.stopPropagation()}>
                            <PalettePanel />
                        </div>

                        {/* Canvas */}
                        <Canvas />

                        {/* Right Sidebar — Properties (stop propagation!) */}
                        <div
                            className="builder-sidebar builder-sidebar--right"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <PropertiesPanel />
                        </div>
                    </div>
                ) : (
                    <div className="builder-body builder-body--preview">
                        <PreviewPanel />
                    </div>
                )}
            </div>

            <ExportDialog
                open={exportOpen}
                onClose={() => setExportOpen(false)}
            />
        </DndProvider>
    );
};

export default App;
