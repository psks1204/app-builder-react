// ============================================================
// Component Node — renders ICG component VISUAL PREVIEW on canvas
// Same visual output as PreviewRenderer, but non-interactive.
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import { getComponentDefinition } from '../../registry/componentRegistry';
import SelectionOverlay from './SelectionOverlay';
import { buildClassString } from '../../utils/icgClassBuilder';

const ComponentNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const def = getComponentDefinition(node.componentType ?? '');
    const displayName = def?.displayName ?? node.componentType ?? 'Unknown';

    return (
        <SelectionOverlay nodeId={node.id} nodeType="component">
            <div className={buildClassString('component-node', ...node.icgClasses)}>
                <div className="component-preview">
                    <div className="component-preview__type">{displayName}</div>
                    {renderWidgetPreview(node, displayName)}
                </div>
            </div>
        </SelectionOverlay>
    );
};

function renderWidgetPreview(node: LayoutNode, displayName: string): React.ReactElement {
    const p = node.props;
    const previewLabel =
        typeof p.label === 'string' ? p.label :
            typeof p.text === 'string' ? p.text :
                typeof p.message === 'string' ? p.message :
                    displayName;

    switch (node.componentType) {
        case 'Button':
            return (
                <button
                    style={{
                        padding: '8px 22px',
                        borderRadius: 6,
                        border: p.type === 'primary' ? 'none' : '1px solid #2563eb',
                        background: p.type === 'primary' ? '#2563eb' : p.type === 'dashed' ? 'transparent' : '#fff',
                        color: p.type === 'primary' ? '#fff' : '#2563eb',
                        cursor: 'default',
                        fontSize: 14,
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        borderStyle: p.type === 'dashed' ? 'dashed' : 'solid',
                        ...(p.danger ? { background: '#ef4444', border: 'none', color: '#fff' } : {}),
                        ...(p.block ? { width: '100%' } : {}),
                        opacity: p.disabled ? 0.5 : 1,
                    }}
                    disabled
                >
                    {previewLabel}
                </button>
            );

        case 'Input':
            return (
                <input
                    type="text"
                    placeholder={String(p.placeholder ?? 'Enter text…')}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#fafbfc',
                    }}
                    disabled
                    readOnly
                />
            );

        case 'InputTextArea':
            return (
                <textarea
                    placeholder={String(p.placeholder ?? 'Enter text…')}
                    rows={Number(p.rows ?? 4)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        background: '#fafbfc',
                    }}
                    disabled
                    readOnly
                />
            );

        case 'InputNumber':
            return (
                <input
                    type="number"
                    placeholder={String(p.placeholder ?? '0')}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#fafbfc',
                    }}
                    disabled
                    readOnly
                />
            );

        case 'Select':
            return (
                <select
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'default',
                        background: '#fafbfc',
                    }}
                    disabled
                >
                    <option>{String(p.placeholder ?? 'Select…')}</option>
                    {Array.isArray(p.options) && (p.options as string[]).map((opt) => (
                        <option key={opt}>{opt}</option>
                    ))}
                </select>
            );

        case 'Checkbox':
            return (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'default' }}>
                    <input
                        type="checkbox"
                        checked={Boolean(p.checked)}
                        readOnly
                        style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'default' }}
                    />
                    {previewLabel}
                </label>
            );

        case 'Radio':
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Array.isArray(p.options) &&
                        (p.options as string[]).slice(0, 3).map((opt, i) => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                <input type="radio" name={node.id} checked={i === 0} readOnly style={{ accentColor: '#2563eb' }} />
                                {opt}
                            </label>
                        ))}
                </div>
            );

        case 'Switch':
            return (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'default' }}>
                    {previewLabel}
                    <div
                        style={{
                            width: 44,
                            height: 24,
                            borderRadius: 12,
                            background: p.checked ? '#2563eb' : '#d1d5db',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#fff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                position: 'absolute',
                                top: 2,
                                left: p.checked ? 22 : 2,
                            }}
                        />
                    </div>
                </label>
            );

        case 'Slider':
            return (
                <div style={{ padding: '4px 0' }}>
                    <input
                        type="range"
                        min={Number(p.min ?? 0)}
                        max={Number(p.max ?? 100)}
                        defaultValue={Number(p.value ?? 50)}
                        style={{ width: '100%', accentColor: '#2563eb' }}
                        disabled
                    />
                    <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>{Number(p.value ?? 50)}</div>
                </div>
            );

        case 'Alert':
            return (
                <div
                    style={{
                        padding: '10px 16px',
                        borderRadius: 6,
                        fontSize: 14,
                        border: `1px solid ${p.type === 'error' ? '#fecaca' : p.type === 'warning' ? '#fde68a' : p.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
                        background: p.type === 'error' ? '#fef2f2' : p.type === 'warning' ? '#fffbeb' : p.type === 'success' ? '#f0fdf4' : '#eff6ff',
                        color: p.type === 'error' ? '#991b1b' : p.type === 'warning' ? '#92400e' : p.type === 'success' ? '#166534' : '#1e40af',
                    }}
                >
                    {typeof p.message === 'string' ? p.message : 'Alert message'}
                </div>
            );

        case 'Card':
            return (
                <div
                    style={{
                        border: '1px solid #e4e7ec',
                        borderRadius: 8,
                        background: '#fff',
                        overflow: 'hidden',
                        boxShadow: p.hoverable ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}
                >
                    {typeof p.title === 'string' && p.title && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f1f3', fontWeight: 600, fontSize: 14 }}>
                            {p.title}
                        </div>
                    )}
                    <div style={{ padding: '16px', fontSize: 13, color: '#94a3b8' }}>Card content area</div>
                </div>
            );

        case 'Tag':
            return (
                <span
                    style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                    }}
                >
                    {previewLabel}
                </span>
            );

        case 'Avatar':
            return (
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: p.shape === 'square' ? 8 : '50%',
                        background: '#2563eb',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    {typeof p.text === 'string' ? p.text : 'AB'}
                </div>
            );

        case 'Badge':
            return (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 600, color: '#475569'
                    }}>U</div>
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700,
                        borderRadius: 10, minWidth: 16, height: 16, padding: '0 5px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {p.dot ? '' : String(p.count ?? 0)}
                    </span>
                </div>
            );

        case 'Divider':
            return <hr style={{ border: 'none', borderTop: `1px ${p.dashed ? 'dashed' : 'solid'} #e4e7ec`, margin: '16px 0' }} />;

        case 'Table': {
            const cols = Array.isArray(p.columns) ? (p.columns as string[]) : ['Column 1', 'Column 2'];
            const rows = Array.isArray(p.rows) ? (p.rows as string[]) : [];
            return (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr>
                            {cols.map((c) => (
                                <th key={c} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e4e7ec', fontWeight: 600, color: '#475569' }}>
                                    {c}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? rows.map((row, ri) => {
                            const cells = row.split(',');
                            return (
                                <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                    {cols.map((_, ci) => (
                                        <td key={ci} style={{ padding: '8px 12px', borderBottom: '1px solid #f0f1f3' }}>
                                            {(cells[ci] ?? '').trim()}
                                        </td>
                                    ))}
                                </tr>
                            );
                        }) : (
                            <tr>
                                {cols.map((_, ci) => (
                                    <td key={ci} style={{ padding: '8px 12px', borderBottom: '1px solid #f0f1f3', color: '#94a3b8' }}>
                                        Sample data
                                    </td>
                                ))}
                            </tr>
                        )}
                    </tbody>
                </table>
            );
        }

        case 'Image':
            return (
                <div style={{ width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', borderRadius: 8, color: '#94a3b8' }}>
                    🖼 {typeof p.alt === 'string' ? p.alt : 'Image placeholder'}
                </div>
            );

        case 'Loading':
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                    <div style={{ width: 20, height: 20, border: '2px solid #e4e7ec', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    {typeof p.tip === 'string' && p.tip ? p.tip : 'Loading…'}
                </div>
            );

        case 'Breadcrumb':
            return (
                <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 6 }}>
                    {Array.isArray(p.items) && (p.items as string[]).map((item, i, arr) => (
                        <span key={item}>
                            <span style={i === arr.length - 1 ? { color: '#1e293b', fontWeight: 500 } : { color: '#2563eb' }}>{item}</span>
                            {i < arr.length - 1 && <span style={{ margin: '0 2px', color: '#cbd5e1' }}>/</span>}
                        </span>
                    ))}
                </div>
            );

        case 'Pagination':
            return (
                <div style={{ display: 'flex', gap: 4, fontSize: 13 }}>
                    {['‹', '1', '2', '3', '…', '10', '›'].map((pg, i) => (
                        <span
                            key={i}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 4,
                                border: '1px solid #e4e7ec',
                                background: pg === '1' ? '#2563eb' : '#fff',
                                color: pg === '1' ? '#fff' : '#64748b',
                                cursor: 'default',
                            }}
                        >
                            {pg}
                        </span>
                    ))}
                </div>
            );

        case 'Steps': {
            const steps = Array.isArray(p.steps) ? (p.steps as string[]) : ['Step 1', 'Step 2', 'Step 3'];
            const current = Number(p.current ?? 0);
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontSize: 13 }}>
                    {steps.map((step, i) => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%',
                                background: i <= current ? '#2563eb' : '#e4e7ec',
                                color: i <= current ? '#fff' : '#94a3b8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 600, flexShrink: 0,
                            }}>
                                {i < current ? '✓' : i + 1}
                            </div>
                            <span style={{ margin: '0 6px', color: i <= current ? '#1e293b' : '#94a3b8', fontWeight: i === current ? 600 : 400, whiteSpace: 'nowrap' }}>
                                {step}
                            </span>
                            {i < steps.length - 1 && (
                                <div style={{ width: 32, height: 2, background: i < current ? '#2563eb' : '#e4e7ec', margin: '0 4px', flexShrink: 0 }} />
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        case 'Tabs': {
            const tabs = Array.isArray(p.tabs) ? (p.tabs as string[]) : ['Tab 1', 'Tab 2'];
            return (
                <div>
                    <div style={{ display: 'flex', borderBottom: '2px solid #e4e7ec' }}>
                        {tabs.map((tab, i) => (
                            <div key={tab} style={{
                                padding: '8px 16px', fontSize: 13,
                                borderBottom: i === 0 ? '2px solid #2563eb' : 'none',
                                color: i === 0 ? '#2563eb' : '#64748b',
                                fontWeight: i === 0 ? 600 : 400,
                                marginBottom: -2, cursor: 'default',
                            }}>
                                {tab}
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: '12px 0', fontSize: 13, color: '#94a3b8' }}>
                        {tabs[0]} content
                    </div>
                </div>
            );
        }

        case 'Menu': {
            const items = Array.isArray(p.items) ? (p.items as string[]) : ['Item 1', 'Item 2', 'Item 3'];
            return (
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e4e7ec' }}>
                    {items.map((item, i) => (
                        <div key={item} style={{
                            padding: '8px 16px', fontSize: 13, cursor: 'default',
                            color: i === 0 ? '#2563eb' : '#475569',
                            borderBottom: i === 0 ? '2px solid #2563eb' : 'none',
                            fontWeight: i === 0 ? 600 : 400,
                        }}>
                            {item}
                        </div>
                    ))}
                </div>
            );
        }

        case 'Collapse':
            return (
                <div style={{ border: '1px solid #e4e7ec', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#fafbfc', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{typeof p.title === 'string' ? p.title : 'Panel'}</span>
                        <span style={{ color: '#94a3b8' }}>▼</span>
                    </div>
                    <div style={{ padding: '10px 14px', fontSize: 13, borderTop: '1px solid #e4e7ec' }}>
                        {typeof p.content === 'string' ? p.content : 'Collapse content'}
                    </div>
                </div>
            );

        case 'Dropdown':
            return (
                <button style={{
                    padding: '8px 22px', borderRadius: 6, border: '1px solid #2563eb',
                    background: '#fff', color: '#2563eb', fontSize: 14, fontWeight: 500,
                    fontFamily: 'inherit', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                    {previewLabel} <span style={{ fontSize: 10 }}>▼</span>
                </button>
            );

        case 'Upload':
            return (
                <div style={{ border: '1px dashed #d1d5db', borderRadius: 6, padding: '16px', textAlign: 'center', color: '#64748b', fontSize: 13, cursor: 'default' }}>
                    📁 {typeof p.text === 'string' ? p.text : 'Click or drag to upload'}
                </div>
            );

        case 'DatePicker':
            return (
                <input
                    type="text"
                    placeholder={String(p.placeholder ?? 'Select date…')}
                    style={{
                        width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
                        borderRadius: 6, fontSize: 14, fontFamily: 'inherit', background: '#fafbfc',
                        outline: 'none', cursor: 'default',
                    }}
                    disabled readOnly
                />
            );

        case 'Tooltip':
        case 'Popover':
            return (
                <button style={{
                    padding: '8px 22px', borderRadius: 6, border: '1px solid #2563eb',
                    background: '#fff', color: '#2563eb', fontSize: 14, fontWeight: 500,
                    fontFamily: 'inherit', cursor: 'default',
                }}>
                    Hover me
                </button>
            );

        case 'Modal':
            return (
                <button style={{
                    padding: '8px 22px', borderRadius: 6, border: 'none',
                    background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 500,
                    fontFamily: 'inherit', cursor: 'default',
                }}>
                    Open Modal
                </button>
            );

        default:
            return (
                <div style={{ padding: '10px 14px', border: '1px solid #e4e7ec', borderRadius: 6, background: '#fafbfc', fontSize: 13 }}>
                    <strong>{displayName}</strong>
                    {previewLabel !== displayName && <span style={{ marginLeft: 8, opacity: 0.6 }}>"{previewLabel}"</span>}
                </div>
            );
    }
}

export default ComponentNode;
