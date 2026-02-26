// ============================================================
// Export Dialog — shows generated code with copy/download
// ============================================================
import React, { useState, useMemo, useCallback } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { generateCode } from '../../codegen/codeGenerator';

interface ExportDialogProps {
    open: boolean;
    onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose }) => {
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const designName = useBuilderStore((s) => s.designName);
    const [copied, setCopied] = useState(false);

    const code = useMemo(
        () => (open ? generateCode(layoutTree, designName ?? 'GeneratedPage') : ''),
        [open, layoutTree, designName],
    );

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [code]);

    const handleDownload = useCallback(() => {
        const fileName = (designName ?? 'GeneratedPage')
            .replace(/[^a-zA-Z0-9]/g, '')
            .replace(/^[^A-Z]/i, (c) => c.toUpperCase()) || 'GeneratedPage';
        const blob = new Blob([code], { type: 'text/tsx' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.tsx`;
        a.click();
        URL.revokeObjectURL(url);
    }, [code, designName]);

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)',
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff',
                    borderRadius: 8,
                    width: '80vw',
                    maxWidth: 900,
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
            >
                {/* Header */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Export Code</strong>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleCopy}
                            style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4, background: copied ? '#e8f5e9' : '#fff' }}
                        >
                            {copied ? '✓ Copied' : '📋 Copy'}
                        </button>
                        <button
                            onClick={handleDownload}
                            style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
                        >
                            💾 Download .tsx
                        </button>
                        <button
                            onClick={onClose}
                            style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>

                {/* Code */}
                <pre
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        margin: 0,
                        padding: 16,
                        fontSize: 12,
                        lineHeight: 1.5,
                        fontFamily: '"Fira Code", "Cascadia Code", monospace',
                        background: '#fafafa',
                    }}
                >
                    {code}
                </pre>
            </div>
        </div>
    );
};

export default ExportDialog;
