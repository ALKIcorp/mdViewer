import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { oneDark } from '@codemirror/theme-one-dark'; // We might need to install this or use basic theme
import './SplitView.css';

interface SplitViewProps {
    content: string;
    onChange: (value: string) => void;
}

export const SplitView: React.FC<SplitViewProps> = ({ content, onChange }) => {
    return (
        <div className="split-view">
            <div className="editor-pane">
                <CodeMirror
                    value={content}
                    height="100%"
                    theme={oneDark}
                    extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                    onChange={(value) => onChange(value)}
                    className="codemirror-wrapper"
                />
            </div>
            <div className="preview-pane markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
