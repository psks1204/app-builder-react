// ============================================================
// Properties Panel — Dynamic prop editor for selected node
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

    return (
        <div className="properties-panel">
            <div className="properties-panel__title">{nodeLabel}</div>

            {propSchema.map((field) => (
                <PropFieldEditor
                    key={field.name}
                    field={field}
                    value={selectedNode.props[field.name]}
                    onChange={(val) => {
                        const oldProps = { [field.name]: selectedNode.props[field.name] };
                        const newProps = { [field.name]: val };
                        executeCommand(createUpdatePropsCommand(selectedNode.id, oldProps, newProps));
                    }}
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

/* ─── ICG Class Editor ─────────────────────────────────── */
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
            const oldClasses = [...node.icgClasses];
            const newClasses = node.icgClasses.filter((c) => c !== className);
            executeCommand(createUpdateClassesCommand(node.id, oldClasses, newClasses));
        },
        [node, executeCommand],
    );

    return (
        <div style={{ marginTop: 16 }}>
            <div className="properties-field__label">ICG Classes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {node.icgClasses.map((cls) => (
                    <span
                        key={cls}
                        className="class-chip"
                        onClick={() => handleRemoveClass(cls)}
                        title="Click to remove"
                    >
                        {cls} ×
                    </span>
                ))}
            </div>
            <select
                value=""
                onChange={(e) => {
                    if (e.target.value) handleAddClass(e.target.value);
                }}
            >
                <option value="">+ Add class…</option>
                {categories.map((cat) => (
                    <optgroup key={cat} label={cat}>
                        {getClassesByCategory(cat)
                            .filter((c) => !node.icgClasses.includes(c))
                            .map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                    </optgroup>
                ))}
            </select>
        </div>
    );
};

export default PropertiesPanel;
