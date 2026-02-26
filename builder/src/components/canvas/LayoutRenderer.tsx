// ============================================================
// Layout Renderer — Recursive tree → JSX renderer
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import ContainerNode from './ContainerNode';
import RowNode from './RowNode';
import ColumnNode from './ColumnNode';
import FlexContainerNode from './FlexContainerNode';
import ComponentNode from './ComponentNode';
import ContentNode from './ContentNode';

interface LayoutRendererProps {
    nodes: LayoutNode[];
}

const LayoutRenderer: React.FC<LayoutRendererProps> = ({ nodes }) => {
    return (
        <>
            {nodes.map((node) => (
                <LayoutNodeRenderer key={node.id} node={node} />
            ))}
        </>
    );
};

const LayoutNodeRenderer: React.FC<{ node: LayoutNode }> = ({ node }) => {
    switch (node.type) {
        case 'container':
            return <ContainerNode node={node} />;
        case 'row':
            return <RowNode node={node} />;
        case 'column':
            return <ColumnNode node={node} />;
        case 'flex-container':
            return <FlexContainerNode node={node} />;
        case 'component':
            return <ComponentNode node={node} />;
        case 'content':
            return <ContentNode node={node} />;
        default:
            return null;
    }
};

export default LayoutRenderer;
