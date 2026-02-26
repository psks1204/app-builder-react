// ============================================================
// Palette Panel — Category-based component/content/layout list
// ============================================================
import React from 'react';
import DraggablePaletteItem from '../../dnd/DraggablePaletteItem';
import { LAYOUT_PALETTE_ITEMS } from '../../registry/layoutConstraints';
import { contentRegistry } from '../../registry/contentRegistry';
import { componentRegistry, componentCategories } from '../../registry/componentRegistry';
import type { DragData } from '../../store/types';

const PalettePanel: React.FC = () => {
    return (
        <div>
            {/* ── Layout Section ─────────────────────────────── */}
            <div className="palette-section">
                <div className="palette-section__title">Layout</div>
                {LAYOUT_PALETTE_ITEMS.map((item) => (
                    <DraggablePaletteItem
                        key={item.nodeType}
                        id={`palette-layout-${item.nodeType}`}
                        dragData={{ source: 'palette', nodeType: item.nodeType } as DragData}
                    >
                        <span>▦</span>
                        <span>{item.label}</span>
                    </DraggablePaletteItem>
                ))}
            </div>

            {/* ── Content Section ────────────────────────────── */}
            <div className="palette-section">
                <div className="palette-section__title">Content</div>
                {contentRegistry.map((content) => (
                    <DraggablePaletteItem
                        key={content.contentType}
                        id={`palette-content-${content.contentType}`}
                        dragData={{
                            source: 'palette',
                            nodeType: 'content',
                            contentType: content.contentType,
                        }}
                    >
                        <span>T</span>
                        <span>{content.displayName}</span>
                    </DraggablePaletteItem>
                ))}
            </div>

            {/* ── Component Sections (by category) ───────────── */}
            {componentCategories.map((category) => {
                const items = componentRegistry.filter((c) => c.category === category);
                if (items.length === 0) return null;
                return (
                    <div key={category} className="palette-section">
                        <div className="palette-section__title">{category}</div>
                        {items.map((comp) => (
                            <DraggablePaletteItem
                                key={comp.type}
                                id={`palette-component-${comp.type}`}
                                dragData={{
                                    source: 'palette',
                                    nodeType: 'component',
                                    componentType: comp.type,
                                }}
                            >
                                <span>◈</span>
                                <span>{comp.displayName}</span>
                            </DraggablePaletteItem>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default PalettePanel;
