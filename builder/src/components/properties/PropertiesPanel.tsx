// ============================================================
// Properties Panel — Dynamic prop editor for selected node
// With auto-sync column classes and categorized class dropdown
// ============================================================
import React, { useCallback } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { getComponentDefinition } from '../../registry/componentRegistry';
import { getContentDefinition } from '../../registry/contentRegistry';
import { createUpdatePropsCommand, createUpdateClassesCommand, createRemoveCommand } from '../../store/commands';
import { findParent } from '../../engine/layoutTree';
import { NODE_LABELS } from '../../registry/layoutConstraints';
import { getClassesByCategory, getClassCategories } from '../../registry/classRegistry';
import type { PropField, LayoutNode } from '../../store/types';

/** Human-readable labels for class categories */
const CATEGORY_LABELS: Record<string, string> = {
    display: '📐 Display',
    flex: '⫸ Flexbox',
    grid: '▦ Grid / Columns',
    margin: '↔ Margin',
    padding: '↕ Padding',
    sizing: '📏 Sizing',
    typography: '🔤 Typography',
    text: 'Aa Text Utilities',
    fontFamily: '🖋 Font Family',
    colors: '🎨 Colors',
    backgrounds: '🎭 Backgrounds',
    borders: '🔲 Borders',
    shadows: '💧 Shadows',
    position: '📍 Position',
    image: '🖼 Image',
    visibility: '👁 Visibility',
};

/**
 * Build the correct ICG column classes from xs/sm/md/lg/xl props.
 * This is the single source of truth for column class generation.
 */
function buildColumnClasses(props: Record<string, unknown>): string[] {
    const classes: string[] = [];
    const xs = props.xs as number | undefined;
    const sm = props.sm as number | undefined;
    const md = props.md as number | undefined;
    const lg = props.lg as number | undefined;
    const xl = props.xl as number | undefined;

    if (xs !== undefined && xs !== null) classes.push(`lmn-col-${xs}`);
    if (sm !== undefined && sm !== null) classes.push(`lmn-col-sm-${sm}`);
    if (md !== undefined && md !== null) classes.push(`lmn-col-md-${md}`);
    if (lg !== undefined && lg !== null) classes.push(`lmn-col-lg-${lg}`);
    if (xl !== undefined && xl !== null) classes.push(`lmn-col-xl-${xl}`);

    // If no xs set, default to lmn-col
    if (classes.length === 0) classes.push('lmn-col');

    return classes;
}

/** Check if a class is an auto-managed column class (lmn-col-*) */
function isColumnClass(cls: string): boolean {
    return /^lmn-col(-\d+|-[a-z]+-\d+)?$/.test(cls);
}

const PropertiesPanel: React.FC = () => {
    const selectedNode = useBuilderStore((s) => s.getSelectedNode());
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const executeCommand = useBuilderStore((s) => s.executeCommand);

    if (!selectedNode) {
        return (
            <div className="properties-panel">
                <div className="properties-panel__empty">
                    Select a node to edit its properties
                </div>
            </div>
        );
    }

    const nodeLabel = NODE_LABELS[selectedNode.type] ?? selectedNode.type;
    let propSchema: PropField[] = [];

    if (selectedNode.type === 'component' && selectedNode.componentType) {
        const def = getComponentDefinition(selectedNode.componentType);
        propSchema = def?.propSchema ?? [];
    } else if (selectedNode.type === 'content' && selectedNode.contentType) {
        const def = getContentDefinition(selectedNode.contentType);
        propSchema = def?.propSchema ?? [];
    } else if (selectedNode.type === 'container') {
        propSchema = [
            { name: 'fluid', label: 'Fluid', type: 'boolean', defaultValue: false },
        ];
    } else if (selectedNode.type === 'row') {
        propSchema = [
            { name: 'noGutters', label: 'No Gutters', type: 'boolean', defaultValue: false },
        ];
    } else if (selectedNode.type === 'column') {
        propSchema = [
            { name: 'xs', label: 'XS Width (1-12)', type: 'number', defaultValue: 12, min: 1, max: 12 },
            { name: 'sm', label: 'SM Width', type: 'number', defaultValue: undefined as unknown as number, min: 1, max: 12 },
            { name: 'md', label: 'MD Width', type: 'number', defaultValue: undefined as unknown as number, min: 1, max: 12 },
            { name: 'lg', label: 'LG Width', type: 'number', defaultValue: undefined as unknown as number, min: 1, max: 12 },
            { name: 'xl', label: 'XL Width', type: 'number', defaultValue: undefined as unknown as number, min: 1, max: 12 },
        ];
    } else if (selectedNode.type === 'flex-container') {
        propSchema = [
            { name: 'direction', label: 'Direction', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'], defaultValue: 'row' },
            { name: 'justifyContent', label: 'Justify', type: 'select', options: ['start', 'center', 'end', 'between', 'around', 'evenly'], defaultValue: 'start' },
            { name: 'alignItems', label: 'Align', type: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'], defaultValue: 'stretch' },
            { name: 'wrap', label: 'Wrap', type: 'boolean', defaultValue: false },
        ];
    }

    /**
     * Handle prop changes.
     * For columns: auto-sync ICG classes when xs/sm/md/lg/xl change.
     */
    const handlePropChange = (field: PropField, val: unknown) => {
        const oldProps = { [field.name]: selectedNode.props[field.name] };
        const newProps = { [field.name]: val };
        executeCommand(createUpdatePropsCommand(selectedNode.id, oldProps, newProps));

        // Auto-sync column classes when breakpoint widths change
        if (selectedNode.type === 'column' && ['xs', 'sm', 'md', 'lg', 'xl'].includes(field.name)) {
            // Build new props with the updated value
            const updatedProps = { ...selectedNode.props, [field.name]: val };
            const newColClasses = buildColumnClasses(updatedProps);

            // Keep non-column classes intact, replace column classes
            const nonColumnClasses = selectedNode.icgClasses.filter((c) => !isColumnClass(c));
            const mergedClasses = [...newColClasses, ...nonColumnClasses];

            executeCommand(createUpdateClassesCommand(
                selectedNode.id,
                [...selectedNode.icgClasses],
                mergedClasses,
            ));
        }
    };

    return (
        <div className="properties-panel">
            <div className="properties-panel__title">{nodeLabel}</div>

            {propSchema.map((field) => (
                <PropFieldEditor
                    key={field.name}
                    field={field}
                    value={selectedNode.props[field.name]}
                    onChange={(val) => handlePropChange(field, val)}
                />
            ))}

            <ClassEditor node={selectedNode} />

            <div style={{ marginTop: 20 }}>
                <button
                    className="properties-delete-btn"
                    onClick={() => {
                        const parent = findParent(layoutTree, selectedNode.id);
                        const parentId = parent?.id ?? null;
                        const siblings = parent ? parent.children : layoutTree;
                        const idx = siblings.findIndex((c) => c.id === selectedNode.id);
                        executeCommand(createRemoveCommand(selectedNode.id, parentId, idx, selectedNode));
                    }}
                >
                    🗑 Delete Node
                </button>
            </div>
        </div>
    );
};

/* ─── Prop Field Editor ────────────────────────────────── */
const PropFieldEditor: React.FC<{
    field: PropField;
    value: unknown;
    onChange: (val: unknown) => void;
}> = ({ field, value, onChange }) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const target = e.target;
            if (field.type === 'boolean') {
                onChange((target as HTMLInputElement).checked);
            } else if (field.type === 'number') {
                const num = parseFloat(target.value);
                onChange(isNaN(num) ? undefined : num);
            } else {
                onChange(target.value);
            }
        },
        [field.type, onChange],
    );

    return (
        <div className="properties-field">
            <label className="properties-field__label">{field.label}</label>

            {field.type === 'text' && (
                <input
                    type="text"
                    value={String(value ?? '')}
                    onChange={handleChange}
                />
            )}

            {field.type === 'number' && (
                <input
                    type="number"
                    value={value !== undefined && value !== null ? String(value) : ''}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    onChange={handleChange}
                />
            )}

            {field.type === 'boolean' && (
                <div className="properties-field__checkbox">
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={handleChange}
                    />
                    <span style={{ fontSize: 13 }}>{Boolean(value) ? 'Yes' : 'No'}</span>
                </div>
            )}

            {field.type === 'select' && field.options && (
                <select value={String(value ?? '')} onChange={handleChange}>
                    <option value="">—</option>
                    {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            )}

            {field.type === 'color' && (
                <input
                    type="color"
                    value={String(value ?? '#000000')}
                    onChange={handleChange}
                    style={{ width: '100%', height: 32 }}
                />
            )}

            {field.type === 'list' && (
                <textarea
                    value={Array.isArray(value) ? (value as string[]).join('\n') : String(value ?? '')}
                    onChange={(e) => onChange(e.target.value.split('\n').filter(Boolean))}
                    rows={3}
                />
            )}
        </div>
    );
};

/* ─── Categorized ICG Class Editor ─────────────────────── */
const ClassEditor: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const executeCommand = useBuilderStore((s) => s.executeCommand);
    const categories = getClassCategories();

    const handleAddClass = useCallback(
        (className: string) => {
            if (node.icgClasses.includes(className)) return;
            const oldClasses = [...node.icgClasses];
            const newClasses = [...node.icgClasses, className];
            executeCommand(createUpdateClassesCommand(node.id, oldClasses, newClasses));
        },
        [node, executeCommand],
    );

    const handleRemoveClass = useCallback(
        (className: string) => {
            // Don't allow removing auto-managed column classes for column nodes
            if (node.type === 'column' && isColumnClass(className)) {
                return; // These are managed by the width props
            }
            const oldClasses = [...node.icgClasses];
            const newClasses = node.icgClasses.filter((c) => c !== className);
            executeCommand(createUpdateClassesCommand(node.id, oldClasses, newClasses));
        },
        [node, executeCommand],
    );

    /** Categorize applied classes for display */
    const getClassCategory = (cls: string): string => {
        for (const cat of categories) {
            if (getClassesByCategory(cat).includes(cls)) {
                return CATEGORY_LABELS[cat] ?? cat;
            }
        }
        return 'Other';
    };

    /** Group applied classes by category */
    const groupedClasses: Record<string, string[]> = {};
    node.icgClasses.forEach((cls) => {
        const cat = getClassCategory(cls);
        if (!groupedClasses[cat]) groupedClasses[cat] = [];
        groupedClasses[cat].push(cls);
    });

    return (
        <div className="class-editor">
            <div className="properties-field__label" style={{ marginBottom: 8 }}>ICG Classes</div>

            {/* Applied classes — grouped by category */}
            {Object.keys(groupedClasses).length > 0 ? (
                <div className="class-editor__groups">
                    {Object.entries(groupedClasses).map(([cat, classes]) => (
                        <div key={cat} className="class-editor__group">
                            <div className="class-editor__group-label">{cat}</div>
                            <div className="class-editor__chips">
                                {classes.map((cls) => {
                                    const isAutoManaged = node.type === 'column' && isColumnClass(cls);
                                    return (
                                        <span
                                            key={cls}
                                            className={`class-chip ${isAutoManaged ? 'class-chip--auto' : ''}`}
                                            onClick={() => handleRemoveClass(cls)}
                                            title={isAutoManaged ? 'Auto-managed by width props' : 'Click to remove'}
                                        >
                                            {cls} {isAutoManaged ? '🔒' : '×'}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontStyle: 'italic' }}>
                    No classes applied
                </div>
            )}

            {/* Categorized dropdown */}
            <select
                value=""
                onChange={(e) => {
                    if (e.target.value) handleAddClass(e.target.value);
                }}
                className="class-editor__dropdown"
            >
                <option value="">+ Add class…</option>
                {categories.map((cat) => {
                    const available = getClassesByCategory(cat).filter((c) => !node.icgClasses.includes(c));
                    if (available.length === 0) return null;
                    return (
                        <optgroup key={cat} label={CATEGORY_LABELS[cat] ?? cat}>
                            {available.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </optgroup>
                    );
                })}
            </select>
        </div>
    );
};

export default PropertiesPanel;
