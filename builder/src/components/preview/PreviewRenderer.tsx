// ============================================================
// Preview Renderer — Interactive preview of the layout tree
// No design-time chrome. Components are interactive.
// ============================================================
import React, { useState } from 'react';
import type { LayoutNode } from '../../store/types';
import { buildClassString } from '../../utils/icgClassBuilder';
import { getComponentDefinition } from '../../registry/componentRegistry';

interface PreviewRendererProps {
    nodes: LayoutNode[];
}

const PreviewRenderer: React.FC<PreviewRendererProps> = ({ nodes }) => (
    <>
        {nodes.map((node) => (
            <PreviewNode key={node.id} node={node} />
        ))}
    </>
);

const PreviewNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    switch (node.type) {
        case 'container':
            return <PreviewContainer node={node} />;
        case 'row':
            return <PreviewRow node={node} />;
        case 'column':
            return <PreviewColumn node={node} />;
        case 'flex-container':
            return <PreviewFlex node={node} />;
        case 'content':
            return <PreviewContent node={node} />;
        case 'component':
            return <PreviewComponent node={node} />;
        default:
            return null;
    }
};

/* ─── Container ───────────────────────────────────────── */
const PreviewContainer: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const containerClass = node.props.fluid ? 'lmn-container-fluid' : 'lmn-container';
    const extra = node.icgClasses.filter((c) => c !== 'lmn-container' && c !== 'lmn-container-fluid');
    return (
        <div className={buildClassString(containerClass, ...extra)}>
            <PreviewRenderer nodes={node.children} />
        </div>
    );
};

/* ─── Row ─────────────────────────────────────────────── */
const PreviewRow: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const classes = ['lmn-row'];
    if (node.props.noGutters) classes.push('lmn-no-gutters');
    return (
        <div className={buildClassString(...classes, ...node.icgClasses)}>
            <PreviewRenderer nodes={node.children} />
        </div>
    );
};

/* ─── Column ──────────────────────────────────────────── */
const PreviewColumn: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const classes: string[] = [];
    const xs = node.props.xs as number | undefined;
    const sm = node.props.sm as number | undefined;
    const md = node.props.md as number | undefined;
    const lg = node.props.lg as number | undefined;
    const xl = node.props.xl as number | undefined;

    if (xs) classes.push(`lmn-col-${xs}`);
    else classes.push('lmn-col');
    if (sm) classes.push(`lmn-col-sm-${sm}`);
    if (md) classes.push(`lmn-col-md-${md}`);
    if (lg) classes.push(`lmn-col-lg-${lg}`);
    if (xl) classes.push(`lmn-col-xl-${xl}`);

    return (
        <div className={buildClassString(...classes, ...node.icgClasses)}>
            <PreviewRenderer nodes={node.children} />
        </div>
    );
};

/* ─── Flex Container ──────────────────────────────────── */
const PreviewFlex: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const classes = ['lmn-d-flex'];
    const dir = node.props.direction as string | undefined;
    const justify = node.props.justifyContent as string | undefined;
    const align = node.props.alignItems as string | undefined;
    const wrap = node.props.wrap as boolean | undefined;

    if (dir && dir !== 'row') classes.push(`lmn-flex-${dir}`);
    if (justify) classes.push(`lmn-justify-content-${justify}`);
    if (align) classes.push(`lmn-align-items-${align}`);
    if (wrap) classes.push('lmn-flex-wrap');

    return (
        <div className={buildClassString(...classes, ...node.icgClasses)}>
            <PreviewRenderer nodes={node.children} />
        </div>
    );
};

/* ─── Content (Typography) — pure ICG classes ─────────── */
const PreviewContent: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const { contentType, props, icgClasses } = node;
    const text = String(props.text ?? '');
    const align = props.align as string | undefined;
    const alignClass = align ? `lmn-text-${align}` : '';

    switch (contentType) {
        case 'heading': {
            const level = (props.level as string) ?? 'h2';
            const colorClass = (props.colorClass as string) ?? '';
            const variant = props.variant as string;
            const variantClass =
                variant === 'compact' ? 'lmn-ui-compact'
                    : variant === 'spacious' ? 'lmn-ui-spacious' : '';
            const Tag = level as keyof React.JSX.IntrinsicElements;
            return (
                <Tag className={buildClassString(`lmn-${level}`, colorClass, alignClass, variantClass, ...icgClasses)}>
                    {text || 'Heading'}
                </Tag>
            );
        }
        case 'display-heading': {
            const size = (props.size as string) ?? '1';
            return (
                <h1 className={buildClassString(`lmn-display-${size}`, alignClass, ...icgClasses)}>
                    {text || 'Display'}
                </h1>
            );
        }
        case 'paragraph': {
            const colorClass = (props.colorClass as string) ?? '';
            const weight = props.fontWeight as string;
            const weightClass = weight && weight !== 'regular' ? `lmn-font-weight-${weight}` : '';
            return (
                <p className={buildClassString(colorClass, alignClass, weightClass, ...icgClasses)}>
                    {text || 'Paragraph text…'}
                </p>
            );
        }
        case 'lead':
            return (
                <p className={buildClassString('lmn-lead', alignClass, ...icgClasses)}>
                    {text || 'Lead text…'}
                </p>
            );
        default:
            return null;
    }
};

/* ─── Interactive Component Preview ───────────────────── */
const PreviewComponent: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const _def = getComponentDefinition(node.componentType ?? '');
    const displayName = _def?.displayName ?? node.componentType ?? 'Unknown';
    const previewLabel =
        typeof node.props.label === 'string' ? node.props.label :
            typeof node.props.text === 'string' ? node.props.text :
                typeof node.props.message === 'string' ? node.props.message :
                    displayName;

    return <InteractiveWidget node={node} displayName={displayName} previewLabel={previewLabel} />;
};

/* ─── Interactive Widgets (with local state!) ─────────── */
const InteractiveWidget: React.FC<{
    node: LayoutNode;
    displayName: string;
    previewLabel: string;
}> = ({ node, displayName, previewLabel }) => {
    const p = node.props;
    const className = buildClassString(...node.icgClasses);

    // Local interactive state
    const [inputVal, setInputVal] = useState('');
    const [textareaVal, setTextareaVal] = useState('');
    const [checked, setChecked] = useState(Boolean(p.checked));
    const [switchOn, setSwitchOn] = useState(Boolean(p.checked));
    const [sliderVal, setSliderVal] = useState(Number(p.value ?? 50));
    const [selectVal, setSelectVal] = useState('');
    const [btnClicked, setBtnClicked] = useState(false);

    switch (node.componentType) {
        case 'Button':
            return (
                <button
                    className={className}
                    onClick={() => { setBtnClicked(true); setTimeout(() => setBtnClicked(false), 300); }}
                    disabled={Boolean(p.disabled)}
                    style={{
                        padding: '8px 22px',
                        borderRadius: 6,
                        border: p.type === 'primary' ? 'none' : '1px solid #2563eb',
                        background: btnClicked
                            ? '#1d4ed8'
                            : p.type === 'primary' ? '#2563eb' : p.type === 'dashed' ? 'transparent' : '#fff',
                        color: p.type === 'primary' || btnClicked ? '#fff' : '#2563eb',
                        cursor: p.disabled ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        borderStyle: p.type === 'dashed' ? 'dashed' : 'solid',
                        transition: 'all 0.15s ease',
                        transform: btnClicked ? 'scale(0.96)' : 'scale(1)',
                        ...(p.danger ? { background: btnClicked ? '#b91c1c' : '#ef4444', border: 'none', color: '#fff' } : {}),
                        ...(p.block ? { width: '100%' } : {}),
                        opacity: p.disabled ? 0.5 : 1,
                    }}
                >
                    {previewLabel}
                </button>
            );

        case 'Input':
            return (
                <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={String(p.placeholder ?? 'Enter text…')}
                    disabled={Boolean(p.disabled)}
                    className={className}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                />
            );

        case 'InputTextArea':
            return (
                <textarea
                    value={textareaVal}
                    onChange={(e) => setTextareaVal(e.target.value)}
                    placeholder={String(p.placeholder ?? 'Enter text…')}
                    rows={Number(p.rows ?? 4)}
                    disabled={Boolean(p.disabled)}
                    className={className}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; }}
                />
            );

        case 'Select':
            return (
                <select
                    value={selectVal}
                    onChange={(e) => setSelectVal(e.target.value)}
                    className={className}
                    disabled={Boolean(p.disabled)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <option value="">{String(p.placeholder ?? 'Select…')}</option>
                    {Array.isArray(p.options) &&
                        (p.options as string[]).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                </select>
            );

        case 'Checkbox':
            return (
                <label className={className} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                        disabled={Boolean(p.disabled)}
                        style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    {previewLabel}
                </label>
            );

        case 'Switch':
            return (
                <label className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                    {previewLabel}
                    <div
                        onClick={() => setSwitchOn(!switchOn)}
                        style={{
                            width: 44,
                            height: 24,
                            borderRadius: 12,
                            background: switchOn ? '#2563eb' : '#d1d5db',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
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
                                left: switchOn ? 22 : 2,
                                transition: 'left 0.2s ease',
                            }}
                        />
                    </div>
                </label>
            );

        case 'Slider':
            return (
                <div className={className} style={{ padding: '4px 0' }}>
                    <input
                        type="range"
                        min={Number(p.min ?? 0)}
                        max={Number(p.max ?? 100)}
                        step={Number(p.step ?? 1)}
                        value={sliderVal}
                        onChange={(e) => setSliderVal(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                    <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>{sliderVal}</div>
                </div>
            );

        case 'Alert':
            return (
                <div
                    className={className}
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
                    className={className}
                    style={{
                        border: '1px solid #e4e7ec',
                        borderRadius: 8,
                        background: '#fff',
                        overflow: 'hidden',
                        boxShadow: p.hoverable ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => { if (p.hoverable) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={(e) => { if (p.hoverable) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                >
                    {typeof p.title === 'string' && p.title && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f1f3', fontWeight: 600, fontSize: 14 }}>
                            {p.title}
                        </div>
                    )}
                    <div style={{ padding: '16px' }}>Card content area</div>
                </div>
            );

        case 'Tag':
            return (
                <span
                    className={className}
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

        case 'Divider':
            return <hr className={className} style={{ border: 'none', borderTop: `1px ${p.dashed ? 'dashed' : 'solid'} #e4e7ec`, margin: '16px 0' }} />;

        case 'Table': {
            const cols = Array.isArray(p.columns) ? (p.columns as string[]) : ['Column 1', 'Column 2'];
            const rows = Array.isArray(p.rows) ? (p.rows as string[]) : [];
            return (
                <table className={className} style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
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
                <div className={className} style={{ width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', borderRadius: 8, color: '#94a3b8' }}>
                    🖼 {typeof p.alt === 'string' ? p.alt : 'Image placeholder'}
                </div>
            );

        default:
            return (
                <div
                    className={className}
                    style={{ padding: '10px 14px', border: '1px solid #e4e7ec', borderRadius: 6, background: '#fafbfc', fontSize: 13 }}
                >
                    <strong>{displayName}</strong>
                    {previewLabel !== displayName && <span style={{ marginLeft: 8, opacity: 0.6 }}>"{previewLabel}"</span>}
                </div>
            );
    }
};

export default PreviewRenderer;
