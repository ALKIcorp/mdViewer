import React, { useRef, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import './SplitView.css';

interface SplitViewProps {
    content: string;
    onChange: (value: string) => void;
    setEditorView?: (view: EditorView) => void;
    editorView?: EditorView | null;
}

export const SplitView: React.FC<SplitViewProps> = ({ content, onChange, setEditorView, editorView }) => {
    const editorPaneRef = useRef<HTMLDivElement>(null);
    const insertLineRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const trackedInsertPosRef = useRef<number | null>(null);

    // Calculate line position based on mouse Y coordinate
    const calculateInsertPosition = (clientY: number): number | null => {
        if (!editorView || !editorPaneRef.current) return null;

        const editorRect = editorPaneRef.current.getBoundingClientRect();

        // Use posAtCoords to find the document position
        const pos = editorView.posAtCoords({ x: editorRect.left + 10, y: clientY });

        if (pos === null) {
            // If we're above or below the editor content
            if (clientY < editorRect.top) {
                return 0; // Insert at the beginning
            } else {
                return editorView.state.doc.length; // Insert at the end
            }
        }

        return pos;
    };

    // Update the visual indicator position
    const updateIndicatorPosition = (clientY: number) => {
        if (!editorView || !editorPaneRef.current || !insertLineRef.current) return;

        // Get the position in the document
        const pos = calculateInsertPosition(clientY);
        if (pos === null) return;

        // Get the line at this position
        const lineTop = editorView.lineBlockAt(pos).top;

        // Position the indicator at the top of the line
        insertLineRef.current.style.top = `${lineTop}px`;
        insertLineRef.current.style.display = 'block';

        trackedInsertPosRef.current = pos;
    };

    const handleDragEnter = (e: React.DragEvent) => {
        // Only show indicator when dragging block-cards
        const types = e.dataTransfer.types;
        if (types.includes('text/plain')) {
            setIsDragging(true);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent CodeMirror from processing drag events
        e.dataTransfer.dropEffect = 'copy';

        if (isDragging) {
            updateIndicatorPosition(e.clientY);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only hide if we're actually leaving the editor pane
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!editorPaneRef.current?.contains(relatedTarget)) {
            setIsDragging(false);
            trackedInsertPosRef.current = null;
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent CodeMirror from also handling this event

        const text = e.dataTransfer.getData('text/plain');
        if (!text || !editorView) {
            setIsDragging(false);
            return;
        }

        // Use the tracked position from the indicator instead of mouse position
        const insertPos = trackedInsertPosRef.current;

        if (insertPos !== null) {
            // Get the line at the insert position
            const line = editorView.state.doc.lineAt(insertPos);

            // Insert at the beginning of the line
            const insertionPoint = line.from;

            editorView.dispatch({
                changes: { from: insertionPoint, insert: text },
                selection: { anchor: insertionPoint + text.length },
            });

            editorView.focus();
        }

        // Clean up after successful drop
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
        <div className="split-view">
            <div
                className="editor-pane"
                ref={editorPaneRef}
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

                <CodeMirror
                    value={content}
                    height="100%"
                    theme={oneDark}
                    extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                    onChange={(value) => onChange(value)}
                    onCreateEditor={(view) => setEditorView?.(view)}
                    className="codemirror-wrapper"
                    basicSetup={{
                        dropCursor: false, // Disable default drop cursor since we have our own indicator
                    }}
                />
            </div>
            <div id="markdown-preview-container" className="preview-pane markdown-body">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
