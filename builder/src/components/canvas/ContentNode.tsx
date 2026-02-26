// ============================================================
// Content Node — renders typography/heading content
// ============================================================
import React from 'react';
import type { LayoutNode } from '../../store/types';
import SelectionOverlay from './SelectionOverlay';
import { buildClassString } from '../../utils/icgClassBuilder';

const ContentNode: React.FC<{ node: LayoutNode }> = ({ node }) => {
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
                variant === 'compact' ? 'lmn-ui-compact' : variant === 'spacious' ? 'lmn-ui-spacious' : '';
            const Tag = level as keyof React.JSX.IntrinsicElements;
            const headingClass = `lmn-${level}`;
            return (
                <SelectionOverlay nodeId={node.id} nodeType="content">
                    <Tag className={buildClassString(headingClass, colorClass, alignClass, variantClass, ...icgClasses)}>
                        {text}
                    </Tag>
                </SelectionOverlay>
            );
        }

        case 'display-heading': {
            const size = (props.size as string) ?? '1';
            const displayClass = `lmn-display-${size}`;
            return (
                <SelectionOverlay nodeId={node.id} nodeType="content">
                    <h1 className={buildClassString(displayClass, alignClass, ...icgClasses)}>
                        {text}
                    </h1>
                </SelectionOverlay>
            );
        }

        case 'paragraph': {
            const colorClass = (props.colorClass as string) ?? '';
            const weight = props.fontWeight as string;
            const weightClass = weight && weight !== 'regular' ? `lmn-font-weight-${weight}` : '';
            return (
                <SelectionOverlay nodeId={node.id} nodeType="content">
                    <p className={buildClassString(colorClass, alignClass, weightClass, ...icgClasses)}>
                        {text}
                    </p>
                </SelectionOverlay>
            );
        }

        case 'lead':
            return (
                <SelectionOverlay nodeId={node.id} nodeType="content">
                    <p className={buildClassString('lmn-lead', alignClass, ...icgClasses)}>
                        {text}
                    </p>
                </SelectionOverlay>
            );

        default:
            return null;
    }
};

export default ContentNode;
