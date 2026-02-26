// ============================================================
// Keyboard Shortcuts — Global keyboard handler for the builder
// ============================================================
import { useEffect, useCallback } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { findParent } from '../engine/layoutTree';
import { createRemoveCommand } from '../store/commands';

interface UseKeyboardShortcutsOptions {
    onSave?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onZoomReset?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const canUndo = useBuilderStore((s) => s.canUndo);
    const canRedo = useBuilderStore((s) => s.canRedo);
    const selectNode = useBuilderStore((s) => s.selectNode);
    const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
    const layoutTree = useBuilderStore((s) => s.layoutTree);
    const executeCommand = useBuilderStore((s) => s.executeCommand);
    const getSelectedNode = useBuilderStore((s) => s.getSelectedNode);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Don't intercept shortcuts when typing in inputs
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            ) {
                return;
            }

            const isCtrl = e.ctrlKey || e.metaKey;

            // ── Delete / Backspace — remove selected node ──
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                e.preventDefault();
                const node = getSelectedNode();
                if (node) {
                    const parent = findParent(layoutTree, node.id);
                    const parentId = parent?.id ?? null;
                    const siblings = parent ? parent.children : layoutTree;
                    const idx = siblings.findIndex((c) => c.id === node.id);
                    executeCommand(createRemoveCommand(node.id, parentId, idx, node));
                    selectNode(null);
                }
            }

            // ── Ctrl+Z — Undo ──
            if (isCtrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo()) undo();
            }

            // ── Ctrl+Shift+Z or Ctrl+Y — Redo ──
            if ((isCtrl && e.key === 'z' && e.shiftKey) || (isCtrl && e.key === 'y')) {
                e.preventDefault();
                if (canRedo()) redo();
            }

            // ── Ctrl+S — Save ──
            if (isCtrl && e.key === 's') {
                e.preventDefault();
                options.onSave?.();
            }

            // ── Escape — Deselect ──
            if (e.key === 'Escape') {
                e.preventDefault();
                selectNode(null);
            }

            // ── Ctrl+= / Ctrl+- — Zoom ──
            if (isCtrl && (e.key === '=' || e.key === '+')) {
                e.preventDefault();
                options.onZoomIn?.();
            }
            if (isCtrl && e.key === '-') {
                e.preventDefault();
                options.onZoomOut?.();
            }

            // ── Ctrl+0 — Reset zoom ──
            if (isCtrl && e.key === '0') {
                e.preventDefault();
                options.onZoomReset?.();
            }
        },
        [
            selectedNodeId, layoutTree, undo, redo, canUndo, canRedo,
            selectNode, executeCommand, getSelectedNode, options,
        ],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
