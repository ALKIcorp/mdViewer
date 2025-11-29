import React, { useState } from 'react';
import { FileText, Layout, Eye, Download, Upload, Menu, File, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type } from 'lucide-react';
import type { ViewMode } from '../../App';
import { exportToMarkdown, exportToPDF, exportToDOCX } from '../../utils/exportUtils';
import { EditorView } from '@codemirror/view';
import './TopBar.css';

interface TopBarProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    markdownContent: string;
    setMarkdownContent: (content: string) => void;
    isBlockPanelOpen: boolean;
    toggleBlockPanel: () => void;
    editorView: EditorView | null;
}

export const TopBar: React.FC<TopBarProps> = ({
    viewMode,
    setViewMode,
    markdownContent,
    setMarkdownContent,
    isBlockPanelOpen,
    toggleBlockPanel,
    editorView
}) => {
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    setMarkdownContent(content);
                }
            };
            reader.readAsText(file);
        }
    };

    const insertFormat = (format: string) => {
        if (!editorView) return;

        const selection = editorView.state.selection.main;
        const selectedText = editorView.state.sliceDoc(selection.from, selection.to);
        let textToInsert = '';
        let newSelectionOffset = 0;

        switch (format) {
            case 'bold':
                textToInsert = `** ${selectedText || 'text'}** `;
                newSelectionOffset = selectedText ? 0 : 2; // Cursor inside if empty
                break;
            case 'italic':
                textToInsert = `* ${selectedText || 'text'}* `;
                newSelectionOffset = selectedText ? 0 : 1;
                break;
            case 'underline':
                textToInsert = `< u > ${selectedText || 'text'}</u > `;
                newSelectionOffset = selectedText ? 0 : 3;
                break;
            case 'strikethrough':
                textToInsert = `~~${selectedText || 'text'} ~~`;
                newSelectionOffset = selectedText ? 0 : 2;
                break;
            case 'uppercase':
                textToInsert = selectedText.toUpperCase();
                break;
            case 'lowercase':
                textToInsert = selectedText.toLowerCase();
                break;
            case 'align-left':
                // Default alignment, just remove wrapper if exists? For now, just insert text.
                // Or maybe we don't need to do anything for left align as it is default.
                textToInsert = selectedText;
                break;
            case 'align-center':
                textToInsert = `< div align = "center" >\n${selectedText || 'text'} \n</div > `;
                break;
            case 'align-right':
                textToInsert = `< div align = "right" >\n${selectedText || 'text'} \n</div > `;
                break;
            case 'align-justify':
                textToInsert = `< div align = "justify" >\n${selectedText || 'text'} \n</div > `;
                break;
        }

        editorView.dispatch({
            changes: { from: selection.from, to: selection.to, insert: textToInsert },
            selection: { anchor: selection.from + textToInsert.length } // Move cursor to end
        });

        // If we need to place cursor inside for empty selection
        if (!selectedText && newSelectionOffset > 0) {
            editorView.dispatch({
                selection: { anchor: selection.from + newSelectionOffset }
            });
        }

        editorView.focus();

        // Update content state via callback if needed, but CodeMirror onChange handles it in SplitView
    };

    return (
        <div className="top-bar">
            <div className="logo-section">
                <button
                    className={`icon-btn ${isBlockPanelOpen ? 'active' : ''}`}
                    onClick={toggleBlockPanel}
                    title={isBlockPanelOpen ? "Hide menu" : "Show menu"}
                >
                    <Menu className="icon" />
                </button>
                <FileText className="icon" style={{ marginLeft: '12px' }} />
                <span className="app-title">MD Live</span>
            </div>

            <div className="formatting-section">
                <div className="format-group">
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('bold'); }} title="Bold">
                        <Bold size={16} />
                    </button>
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('italic'); }} title="Italic">
                        <Italic size={16} />
                    </button>
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('underline'); }} title="Underline">
                        <Underline size={16} />
                    </button>
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('strikethrough'); }} title="Strikethrough">
                        <Strikethrough size={16} />
                    </button>
                </div>
                <div className="format-divider"></div>
                <div className="format-group">
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('uppercase'); }} title="UPPERCASE">
                        <Type size={16} />
                    </button>
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('lowercase'); }} title="lowercase">
                        <Type size={12} />
                    </button>
                </div>
                <div className="format-divider"></div>
                <div className="format-group">
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('align-left'); }} title="Align Left">
                        <AlignLeft size={16} />
                    </button>
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('align-center'); }} title="Align Center">
                        <AlignCenter size={16} />
                    </button>
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('align-right'); }} title="Align Right">
                        <AlignRight size={16} />
                    </button>
                    <button className="format-btn" onMouseDown={(e) => { e.preventDefault(); insertFormat('align-justify'); }} title="Justify">
                        <AlignJustify size={16} />
                    </button>
                </div>
            </div>

            <div className="actions-section">
                <div className="view-toggle">
                    <button
                        className={`toggle - btn ${viewMode === 'split' ? 'active' : ''} `}
                        onClick={() => setViewMode('split')}
                        title="Split View"
                    >
                        <Layout className="icon" />
                        <span>Split</span>
                    </button>
                    <button
                        className={`toggle - btn ${viewMode === 'live' ? 'active' : ''} `}
                        onClick={() => setViewMode('live')}
                        title="Live View"
                    >
                        <Eye className="icon" />
                        <span>Live</span>
                    </button>
                </div>
                <div className="file-actions">
                    <label className="btn btn-icon" title="Import Markdown">
                        <Upload className="icon" />
                        <input type="file" accept=".md,.txt" onChange={handleFileUpload} hidden />
                    </label>

                    <div className="export-dropdown-container">
                        <button
                            className={`btn btn-icon ${isExportMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            title="Export"
                        >
                            <Download className="icon" />
                        </button>

                        {isExportMenuOpen && (
                            <div className="export-menu">
                                <button
                                    className="export-item"
                                    onClick={() => { exportToMarkdown(markdownContent); setIsExportMenuOpen(false); }}
                                    title="Download as Markdown"
                                >
                                    <FileText size={14} />
                                    <span>Export as .md</span>
                                </button>
                                <button
                                    className="export-item"
                                    onClick={() => { exportToDOCX(markdownContent); setIsExportMenuOpen(false); }}
                                    title="Download as DOCX"
                                >
                                    <FileText size={14} />
                                    <span>Export as .docx</span>
                                </button>
                                <button
                                    className="export-item"
                                    onClick={() => { exportToPDF('markdown-preview-container'); setIsExportMenuOpen(false); }}
                                    title="Download as PDF"
                                >
                                    <File size={14} />
                                    <span>Export as .pdf</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
