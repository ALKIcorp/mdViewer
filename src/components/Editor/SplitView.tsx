import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    return (
        <div className="split-view">
            <div className="editor-pane">
                <CodeMirror
                    value={content}
                    height="100%"
                    theme={oneDark}
                    extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                    onChange={(value) => onChange(value)}
                    onCreateEditor={(view) => setEditorView?.(view)}
                    className="codemirror-wrapper"
                    basicSetup={{
                        dropCursor: true,
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        const text = event.dataTransfer.getData('text/plain');
                        if (!text || !editorView) return; // Ensure text and editorView are available

                        const pos = editorView.posAtCoords({ x: event.clientX, y: event.clientY });

                        if (pos !== null) {
                            editorView.dispatch({
                                changes: { from: pos, insert: text },
                                selection: { anchor: pos + text.length }, // Place cursor after inserted text
                            });
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                    }}
                />
            </div>
            <div id="markdown-preview-container" className="preview-pane markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
