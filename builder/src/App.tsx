// ============================================================
// App.tsx — Main application shell with Builder/Preview toggle
// With keyboard shortcuts and zoom support
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import DndProvider from './dnd/DndProvider';
import HeaderBar from './components/shell/HeaderBar';
import PalettePanel from './components/palette/PalettePanel';
import Canvas from './components/canvas/Canvas';
import PropertiesPanel from './components/properties/PropertiesPanel';
import PreviewPanel from './components/preview/PreviewPanel';
import ExportDialog from './components/dialogs/ExportDialog';
import { useBuilderStore } from './store/builderStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { loadAutoSave, autoSave } from './persistence/storageAdapter';

type AppMode = 'builder' | 'preview';

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

const App: React.FC = () => {
    const [exportOpen, setExportOpen] = useState(false);
    const [appMode, setAppMode] = useState<AppMode>('builder');
    const [canvasZoom, setCanvasZoom] = useState(1);

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        setCanvasZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    }, []);
    const handleZoomOut = useCallback(() => {
        setCanvasZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
    }, []);
    const handleZoomReset = useCallback(() => setCanvasZoom(1), []);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onZoomIn: handleZoomIn,
        onZoomOut: handleZoomOut,
        onZoomReset: handleZoomReset,
    });

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

    const zoomPercent = Math.round(canvasZoom * 100);

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
                        {/* Left Sidebar — Palette */}
                        <div className="builder-sidebar" onClick={(e) => e.stopPropagation()}>
                            <PalettePanel />
                        </div>

                        {/* Canvas with zoom */}
                        <div className="builder-canvas-wrapper">
                            {/* Zoom controls */}
                            <div className="canvas-zoom-bar">
                                <button className="canvas-zoom-btn" onClick={handleZoomOut} title="Zoom Out (Ctrl+-)">−</button>
                                <span className="canvas-zoom-label" onClick={handleZoomReset} title="Reset Zoom (Ctrl+0)">{zoomPercent}%</span>
                                <button className="canvas-zoom-btn" onClick={handleZoomIn} title="Zoom In (Ctrl+=)">+</button>
                            </div>
                            <div style={{ transform: `scale(${canvasZoom})`, transformOrigin: 'top left', width: `${100 / canvasZoom}%`, minHeight: `${100 / canvasZoom}%` }}>
                                <Canvas />
                            </div>
                        </div>

                        {/* Right Sidebar — Properties */}
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
