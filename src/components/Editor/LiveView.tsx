import React, { useRef, useState, useEffect } from 'react';
import { Milkdown, useEditor, MilkdownProvider } from '@milkdown/react';
import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { nord } from '@milkdown/theme-nord';
import './LiveView.css';

interface LiveViewProps {
    content: string;
    onChange: (value: string) => void;
    setEditorInstance?: (instance: any) => void;
}

const LiveViewEditor: React.FC<LiveViewProps> = ({ content, onChange, setEditorInstance }) => {
    const editorInstanceRef = useRef<any>(null);
    const liveViewRef = useRef<HTMLDivElement>(null);
    const insertLineRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const trackedInsertPosRef = useRef<number | null>(null);

    useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, content);
            })
            .config(nord)
            .use(commonmark)
            .use(gfm)
            .use(history)
            .use(listener)
            .use((ctx) => {
                return async () => {
                    // Configure listener after it's added
                    ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
                        if (markdown !== prevMarkdown) {
                            onChange(markdown);
                        }
                    });

                    // Store editor instance for cursor tracking
                    try {
                        const editorView = ctx.get(editorViewCtx);
                        editorInstanceRef.current = {
                            view: editorView,
                            getSelection: () => {
                                return editorView.state.selection;
                            },
                            insertText: (text: string) => {
                                const { state, dispatch } = editorView;
                                const { from } = state.selection;
                                const transaction = state.tr.insertText(text, from);
                                dispatch(transaction);
                            }
                        };
                        setEditorInstance?.(editorInstanceRef.current);
                    } catch (e) {
                        console.error('Failed to get editor view:', e);
                    }
                };
            })
        , [onChange]);

    // Calculate line position based on mouse Y coordinate in Milkdown
    const calculateInsertPosition = (clientY: number): number | null => {
        if (!editorInstanceRef.current?.view || !liveViewRef.current) return null;

        const editorView = editorInstanceRef.current.view;
        const liveViewRect = liveViewRef.current.getBoundingClientRect();

        // Simple approach: return position at start, middle, or end based on Y coordinate
        // This is used for actual insertion, the indicator will show at mouse Y
        if (clientY < liveViewRect.top + liveViewRect.height / 3) {
            return 0; // Top third: insert at beginning
        } else if (clientY > liveViewRect.top + (liveViewRect.height * 2 / 3)) {
            // Bottom third: insert at end
            try {
                if (editorView.state?.doc?.content?.size !== undefined) {
                    return editorView.state.doc.content.size;
                }
            } catch (e) {
                console.debug('Could not get doc size');
            }
            return 9999; // Large number as fallback
        } else {
            // Middle third: insert in middle
            try {
                if (editorView.state?.doc?.content?.size !== undefined) {
                    return Math.floor(editorView.state.doc.content.size / 2);
                }
            } catch (e) {
                console.debug('Could not get doc size');
            }
            return 0; // Fallback to beginning
        }
    };

    // Update the visual indicator position
    const updateIndicatorPosition = (clientY: number) => {
        if (!liveViewRef.current || !insertLineRef.current) return;

        const pos = calculateInsertPosition(clientY);
        if (pos === null) return;

        const liveViewRect = liveViewRef.current.getBoundingClientRect();

        // Find the DOM element at the mouse position to snap to line boundaries
        const targetElement = document.elementFromPoint(liveViewRect.left + 100, clientY);

        if (targetElement) {
            // Find the nearest paragraph or block-level element (line)
            let lineElement = targetElement as HTMLElement | null;
            while (lineElement && lineElement !== liveViewRef.current) {
                const tagName = lineElement.tagName.toLowerCase();
                // Check if this is a block-level element (paragraph, heading, list item, etc.)
                if (tagName === 'p' || tagName === 'h1' || tagName === 'h2' || tagName === 'h3' ||
                    tagName === 'h4' || tagName === 'h5' || tagName === 'h6' || tagName === 'li' ||
                    tagName === 'pre' || tagName === 'blockquote' || tagName === 'div') {
                    // Found a line element, snap to its top
                    const lineRect = lineElement.getBoundingClientRect();
                    const relativeTop = lineRect.top - liveViewRect.top + liveViewRef.current.scrollTop;

                    insertLineRef.current.style.top = `${relativeTop}px`;
                    insertLineRef.current.style.display = 'block';
                    trackedInsertPosRef.current = pos;
                    return;
                }
                lineElement = lineElement.parentElement;
            }
        }

        // Fallback: use mouse position if no line element found
        const relativeTop = clientY - liveViewRect.top + liveViewRef.current.scrollTop;
        insertLineRef.current.style.top = `${relativeTop}px`;
        insertLineRef.current.style.display = 'block';
        trackedInsertPosRef.current = pos;
    };

    const handleDragEnter = (e: React.DragEvent) => {
        const types = e.dataTransfer.types;
        if (types.includes('text/plain')) {
            setIsDragging(true);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';

        if (isDragging) {
            updateIndicatorPosition(e.clientY);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!liveViewRef.current?.contains(relatedTarget)) {
            setIsDragging(false);
            trackedInsertPosRef.current = null;
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const text = e.dataTransfer.getData('text/plain');
        if (!text || !editorInstanceRef.current?.view) {
            setIsDragging(false);
            return;
        }

        const insertPos = trackedInsertPosRef.current;
        if (insertPos !== null) {
            try {
                const editorView = editorInstanceRef.current.view;
                const transaction = editorView.state.tr.insertText(text, insertPos);
                editorView.dispatch(transaction);
                editorView.focus();
            } catch (e) {
                console.error('Error inserting text:', e);
            }
        }

        setIsDragging(false);
        trackedInsertPosRef.current = null;
    };

    // Hide indicator when dragging ends
    useEffect(() => {
        if (!isDragging && insertLineRef.current) {
            insertLineRef.current.style.display = 'none';
        }
    }, [isDragging]);

    return (
        <div
            ref={liveViewRef}
            className="live-view-editor"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag insertion indicator */}
            <div
                ref={insertLineRef}
                className="drag-insert-indicator"
                style={{ display: 'none' }}
            />
            <Milkdown />
        </div>
    );
};

export const LiveView: React.FC<LiveViewProps> = (props) => {
    return (
        <div className="live-view" id="markdown-preview-container">
            <MilkdownProvider>
                <LiveViewEditor {...props} />
            </MilkdownProvider>
        </div>
    );
};
