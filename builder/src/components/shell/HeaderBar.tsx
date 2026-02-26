// ============================================================
// Header Bar — top bar with undo/redo, save, load, export, theme
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

interface HeaderBarProps {
    onExport: () => void;
    appMode: 'builder' | 'preview';
    onModeChange: (mode: 'builder' | 'preview') => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ onExport, appMode, onModeChange }) => {
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

    const [serverDesigns, setServerDesigns] = useState<DesignMeta[]>([]);
    const [showLoadMenu, setShowLoadMenu] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        apiListDesigns()
            .then((designs) => setServerDesigns(designs))
            .catch(() => { /* server might not be running */ });
    }, []);

    const handleSaveToServer = useCallback(async () => {
        const name = designName || 'My Design';
        setSaving(true);
        try {
            if (designId) {
                await apiUpdateDesign(designId, layoutTree, name, themeMode);
            } else {
                const saved = await apiCreateDesign(layoutTree, name, themeMode);
                if (saved.id) setDesignId(saved.id);
            }
            markSaved();
            const designs = await apiListDesigns();
            setServerDesigns(designs);
        } catch {
            saveDesignToFile(layoutTree, name, themeMode);
            markSaved();
        } finally {
            setSaving(false);
        }
    }, [layoutTree, designName, designId, themeMode, markSaved, setDesignId]);

    const handleSaveToFile = useCallback(() => {
        saveDesignToFile(layoutTree, designName || 'My Design', themeMode);
        markSaved();
    }, [layoutTree, designName, themeMode, markSaved]);

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
                alert('Failed to load: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        [setLayoutTree, setDesignName, setDesignId],
    );

    return (
        <div className="builder-header">
            {/* Left — Logo + Name */}
            <div className="builder-header__group">
                <span className="builder-header__logo">⬡ ICG Builder</span>
                <input
                    type="text"
                    value={designName ?? ''}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Design name…"
                    className="builder-header__name-input"
                />
                {isDirty && <span className="builder-header__unsaved">● unsaved</span>}
                {designId && <span className="builder-header__synced" title={designId}>✓ synced</span>}
            </div>

            {/* Center — Mode Toggle */}
            <div className="builder-header__mode-toggle">
                <button
                    onClick={() => onModeChange('builder')}
                    className={`mode-toggle-btn ${appMode === 'builder' ? 'mode-toggle-btn--active' : ''}`}
                >
                    🛠 Builder
                </button>
                <button
                    onClick={() => onModeChange('preview')}
                    className={`mode-toggle-btn ${appMode === 'preview' ? 'mode-toggle-btn--active' : ''}`}
                >
                    👁 Preview
                </button>
            </div>

            {/* Right — Actions */}
            <div className="builder-header__group">
                <button onClick={undo} disabled={!canUndoFn()} className="header-btn">
                    ↩ Undo
                </button>
                <button onClick={redo} disabled={!canRedoFn()} className="header-btn">
                    ↪ Redo
                </button>

                <button onClick={handleSaveToServer} disabled={saving} className="header-btn header-btn--primary">
                    {saving ? '⏳' : '💾'} Save
                </button>
                <button onClick={handleSaveToFile} className="header-btn" title="Download JSON">
                    📥 File
                </button>

                {/* Load Dropdown */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        onClick={() => {
                            setShowLoadMenu(!showLoadMenu);
                            apiListDesigns().then((d) => setServerDesigns(d)).catch(() => { });
                        }}
                        className="header-btn"
                    >
                        📂 Load
                    </button>
                    {showLoadMenu && (
                        <div className="load-dropdown">
                            <div className="load-dropdown__header">Server Designs</div>
                            {serverDesigns.length === 0 && (
                                <div className="load-dropdown__item">
                                    <div className="load-dropdown__item-name" style={{ opacity: 0.4 }}>No saved designs</div>
                                </div>
                            )}
                            {serverDesigns.map((d) => (
                                <div key={d.id} onClick={() => handleLoadFromServer(d.id)} className="load-dropdown__item">
                                    <div className="load-dropdown__item-name">{d.designName || 'Untitled'}</div>
                                    <div className="load-dropdown__item-date">{new Date(d.updatedAt).toLocaleString()}</div>
                                </div>
                            ))}
                            <div onClick={handleLoadFile} className="load-dropdown__file">
                                📁 Load from file…
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={onExport} className="header-btn">
                    🚀 Export
                </button>
                <button onClick={toggleTheme} className="header-btn">
                    {themeMode === 'light' ? '🌙' : '☀️'}
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
