// ============================================================
// Component Node — renders ICG component in design mode
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import { getComponentDefinition } from '../../registry/componentRegistry';
import SelectionOverlay from './SelectionOverlay';
import { buildClassString } from '../../utils/icgClassBuilder';

const ComponentNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
    const def = getComponentDefinition(node.componentType ?? '');
    const displayName = def?.displayName ?? node.componentType ?? 'Unknown';

    // In design mode we show a preview representation of the component.
    // The actual ICG component rendering can be added when running with the ICG lib.
    return (
        <SelectionOverlay nodeId={node.id} nodeType="component">
            <div className={buildClassString('component-node', ...node.icgClasses)}>
                <div
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        background: '#fafafa',
                        fontSize: '13px',
                    }}
                >
                    <strong>{displayName}</strong>
                    {typeof node.props.label === 'string' && node.props.label && (
                        <span style={{ marginLeft: 8, opacity: 0.6 }}>
                            "{node.props.label}"
                        </span>
                    )}
                    {typeof node.props.text === 'string' && node.props.text && !node.props.label && (
                        <span style={{ marginLeft: 8, opacity: 0.6 }}>
                            "{node.props.text}"
                        </span>
                    )}
                    {typeof node.props.message === 'string' && node.props.message && !node.props.label && !node.props.text && (
                        <span style={{ marginLeft: 8, opacity: 0.6 }}>
                            "{node.props.message}"
                        </span>
                    )}
                </div>
            </div>
        </SelectionOverlay>
    );
};

export default ComponentNode;
