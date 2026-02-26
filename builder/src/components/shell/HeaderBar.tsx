// ============================================================
// Header Bar — top bar with undo/redo, save, load, export, theme
// Now with API server integration for save/load
// ============================================================
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { saveDesignToFile, loadDesignFromFile } from '../../persistence/storageAdapter';
import {
    apiListDesigns,
    apiCreateDesign,
    apiUpdateDesign,
} from '../../persistence/apiClient';

interface DesignMeta {
    id: string;
    designName: string;
    updatedAt: string;
}

const HeaderBar: React.FC<{ onExport: () => void }> = ({ onExport }) => {
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const canUndoFn = useBuilderStore((s) => s.canUndo);
    const canRedoFn = useBuilderStore((s) => s.canRedo);
    const toggleTheme = useBuilderStore((s) => s.toggleTheme);
    const themeMode = useBuilderStore((s) => s.themeMode);
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const designId = useBuilderStore((s) => s.designId);
    const designName = useBuilderStore((s) => s.designName);
    const setDesignId = useBuilderStore((s) => s.setDesignId);
    const setDesignName = useBuilderStore((s) => s.setDesignName);
    const setLayoutTree = useBuilderStore((s) => s.setLayoutTree);
    const markSaved = useBuilderStore((s) => s.markSaved);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // server designs list
    const [serverDesigns, setServerDesigns] = useState<DesignMeta[]>([]);
    const [showLoadMenu, setShowLoadMenu] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch server designs once on mount
    useEffect(() => {
        apiListDesigns()
            .then((designs) => setServerDesigns(designs))
            .catch(() => {
                /* server might not be running */
            });
    }, []);

    /* ─── Save to Server ─────────────────────────────────── */
    const handleSaveToServer = useCallback(async () => {
        const name = designName || 'My Design';
        setSaving(true);
        try {
            if (designId) {
                // Update existing
                await apiUpdateDesign(designId, layoutTree, name, themeMode);
            } else {
                // Create new
                const saved = await apiCreateDesign(layoutTree, name, themeMode);
                if (saved.id) setDesignId(saved.id);
            }
            markSaved();
            // Refresh server design list
            const designs = await apiListDesigns();
            setServerDesigns(designs);
        } catch (err) {
            console.error('Server save failed, falling back to file download', err);
            // Fallback to local file save
            saveDesignToFile(layoutTree, name, themeMode);
            markSaved();
        } finally {
            setSaving(false);
        }
    }, [layoutTree, designName, designId, themeMode, markSaved, setDesignId]);

    /* ─── Save to File (fallback) ────────────────────────── */
    const handleSaveToFile = useCallback(() => {
        const name = designName || 'My Design';
        saveDesignToFile(layoutTree, name, themeMode);
        markSaved();
    }, [layoutTree, designName, themeMode, markSaved]);

    /* ─── Load from Server ───────────────────────────────── */
    const handleLoadFromServer = useCallback(
        async (id: string) => {
            try {
                const { apiGetDesign } = await import('../../persistence/apiClient');
                const design = await apiGetDesign(id);
                setLayoutTree(design.layoutTree);
                if (design.designName) setDesignName(design.designName);
                if (design.id) setDesignId(design.id);
                setShowLoadMenu(false);
            } catch (err) {
                alert('Failed to load: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
        },
        [setLayoutTree, setDesignName, setDesignId],
    );

    /* ─── Load from File ─────────────────────────────────── */
    const handleLoadFile = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const result = await loadDesignFromFile(file);
                setLayoutTree(result.layoutTree);
                if (result.designName) setDesignName(result.designName);
                if (result.id) setDesignId(result.id);
                setShowLoadMenu(false);
            } catch (err) {
                alert('Failed to load design: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        [setLayoutTree, setDesignName, setDesignId],
    );

    const btnStyle: React.CSSProperties = {
        padding: '4px 12px',
        fontSize: 13,
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: 4,
        background: '#fff',
    };

    return (
        <div className="builder-header">
            <div className="builder-header__group">
                <strong style={{ fontSize: 14 }}>ICG Builder</strong>
                <input
                    type="text"
                    value={designName ?? ''}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Design name…"
                    style={{ ...btnStyle, width: 180 }}
                />
                {isDirty && (
                    <span style={{ fontSize: 11, opacity: 0.5 }}>● unsaved</span>
                )}
                {designId && (
                    <span style={{ fontSize: 10, opacity: 0.3 }} title={designId}>
                        🔗 synced
                    </span>
                )}
            </div>

            <div className="builder-header__group">
                <button onClick={undo} disabled={!canUndoFn()} style={btnStyle}>
                    ↩ Undo
                </button>
                <button onClick={redo} disabled={!canRedoFn()} style={btnStyle}>
                    ↪ Redo
                </button>

                {/* Save — primary = server, shift+click = file */}
                <button
                    onClick={handleSaveToServer}
                    disabled={saving}
                    style={btnStyle}
                    title="Save to server (shift+click for file)"
                >
                    {saving ? '⏳' : '💾'} Save
                </button>
                <button onClick={handleSaveToFile} style={btnStyle} title="Download as JSON file">
                    📥 File
                </button>

                {/* Load — dropdown with server designs + file option */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        onClick={() => {
                            setShowLoadMenu(!showLoadMenu);
                            apiListDesigns()
                                .then((d) => setServerDesigns(d))
                                .catch(() => { });
                        }}
                        style={btnStyle}
                    >
                        📂 Load
                    </button>
                    {showLoadMenu && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                background: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: 220,
                                maxHeight: 300,
                                overflowY: 'auto',
                            }}
                        >
                            <div
                                style={{
                                    padding: '6px 12px',
                                    fontSize: 11,
                                    fontWeight: 'bold',
                                    borderBottom: '1px solid #eee',
                                    color: '#666',
                                }}
                            >
                                Server Designs
                            </div>
                            {serverDesigns.length === 0 && (
                                <div style={{ padding: '8px 12px', fontSize: 12, opacity: 0.5 }}>
                                    No saved designs
                                </div>
                            )}
                            {serverDesigns.map((d) => (
                                <div
                                    key={d.id}
                                    onClick={() => handleLoadFromServer(d.id)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: 12,
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f5f5f5',
                                    }}
                                >
                                    <div>{d.designName || 'Untitled'}</div>
                                    <div style={{ fontSize: 10, opacity: 0.5 }}>
                                        {new Date(d.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            <div
                                style={{
                                    padding: '6px 12px',
                                    borderTop: '1px solid #eee',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                                onClick={handleLoadFile}
                            >
                                📁 Load from file…
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={onExport} style={btnStyle}>
                    🚀 Export
                </button>
                <button onClick={toggleTheme} style={btnStyle}>
                    {themeMode === 'light' ? '🌙' : '☀️'} Theme
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default HeaderBar;
