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

        try {
            // Use posAtCoords to find the document position
            const pos = editorView.posAtCoords({ left: liveViewRect.left + 100, top: clientY });

            if (pos === null || pos.pos === undefined) {
                // If we're above or below the editor content
                if (clientY < liveViewRect.top) {
                    return 0; // Insert at the beginning
                } else {
                    return editorView.state.doc.content.size; // Insert at the end
                }
            }

            return pos.pos;
        } catch (e) {
            console.error('Error calculating insert position:', e);
            return null;
        }
    };

    // Update the visual indicator position
    const updateIndicatorPosition = (clientY: number) => {
        if (!editorInstanceRef.current?.view || !liveViewRef.current || !insertLineRef.current) return;

        const pos = calculateInsertPosition(clientY);
        if (pos === null) return;

        try {
            const editorView = editorInstanceRef.current.view;
            const coords = editorView.coordsAtPos(pos);

            if (coords) {
                const liveViewRect = liveViewRef.current.getBoundingClientRect();
                const relativeTop = coords.top - liveViewRect.top + liveViewRef.current.scrollTop;

                insertLineRef.current.style.top = `${relativeTop}px`;
                insertLineRef.current.style.display = 'block';
                trackedInsertPosRef.current = pos;
            }
        } catch (e) {
            console.error('Error updating indicator:', e);
        }
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
