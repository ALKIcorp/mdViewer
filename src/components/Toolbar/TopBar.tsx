import React, { useState, useEffect } from 'react';
import { FileText, Layout, Eye, Download, Upload, Menu, ChevronLeft, File, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type } from 'lucide-react';
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

interface FormatState {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    alignCenter: boolean;
    alignRight: boolean;
    alignJustify: boolean;
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
    const [activeFormats, setActiveFormats] = useState<FormatState>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        alignCenter: false,
        alignRight: false,
        alignJustify: false
    });

    // Detect formatting at cursor position
    const detectFormattingAtCursor = () => {
        if (!editorView) return;

        const selection = editorView.state.selection.main;
        const pos = selection.from;
        const doc = editorView.state.doc;

        // Get the line containing the cursor
        const line = doc.lineAt(pos);
        const lineText = line.text;
        const posInLine = pos - line.from;

        // Get surrounding text for context (before and after cursor)
        const beforeCursor = lineText.slice(Math.max(0, posInLine - 50), posInLine);
        const afterCursor = lineText.slice(posInLine, Math.min(lineText.length, posInLine + 50));
        const surroundingText = beforeCursor + afterCursor;

        // Check for bold (**text**)
        const boldPattern = /\*\*([^*]+)\*\*/;
        const isBold = boldPattern.test(surroundingText) &&
            beforeCursor.includes('**') && afterCursor.includes('**');

        // Check for italic (*text*)
        const italicPattern = /(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/;
        const hasItalicBefore = !!beforeCursor.match(/(?<!\*)\*(?!\*)/);
        const hasItalicAfter = !!afterCursor.match(/\*(?!\*)/);
        const isItalic = italicPattern.test(surroundingText) && hasItalicBefore && hasItalicAfter;

        // Check for underline (<u>text</u>)
        const isUnderline = beforeCursor.includes('<u>') && afterCursor.includes('</u>');

        // Check for strikethrough (~~text~~)
        const isStrikethrough = beforeCursor.includes('~~') && afterCursor.includes('~~');

        // Check for alignment
        const isAlignCenter = lineText.includes('<div align="center">') || lineText.includes("align='center'");
        const isAlignRight = lineText.includes('<div align="right">') || lineText.includes("align='right'");
        const isAlignJustify = lineText.includes('<div align="justify">') || lineText.includes("align='justify'");

        setActiveFormats({
            bold: isBold,
            italic: isItalic,
            underline: isUnderline,
            strikethrough: isStrikethrough,
            alignCenter: isAlignCenter,
            alignRight: isAlignRight,
            alignJustify: isAlignJustify
        });
    };

    // Update active formats when selection changes
    useEffect(() => {
        if (!editorView) return;

        // Initial detection
        detectFormattingAtCursor();

        // Set up a listener to detect formatting changes
        const intervalId = setInterval(() => {
            detectFormattingAtCursor();
        }, 100); // Check every 100ms for cursor/selection changes

        return () => clearInterval(intervalId);
    }, [editorView]);

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

    const toggleFormat = (format: string) => {
        if (!editorView) return;

        const selection = editorView.state.selection.main;
        const selectedText = editorView.state.sliceDoc(selection.from, selection.to);

        // Get extended context for detection
        const doc = editorView.state.doc;
        const line = doc.lineAt(selection.from);

        let textToInsert = '';
        let fromPos = selection.from;
        let toPos = selection.to;
        let newCursorPos = selection.from;

        switch (format) {
            case 'bold': {
                if (activeFormats.bold) {
                    // Remove bold - find and remove ** markers
                    const beforePos = Math.max(line.from, selection.from - 100);
                    const afterPos = Math.min(line.to, selection.to + 100);
                    const contextText = editorView.state.sliceDoc(beforePos, afterPos);
                    const relativeFrom = selection.from - beforePos;

                    // Find the ** before cursor
                    const beforeText = contextText.slice(0, relativeFrom);
                    const afterText = contextText.slice(relativeFrom);
                    const startMarker = beforeText.lastIndexOf('**');
                    const endMarker = afterText.indexOf('**');

                    if (startMarker !== -1 && endMarker !== -1) {
                        const actualStart = beforePos + startMarker;
                        const actualEnd = selection.from + endMarker + 2;
                        const content = editorView.state.sliceDoc(actualStart + 2, actualEnd - 2);

                        editorView.dispatch({
                            changes: { from: actualStart, to: actualEnd, insert: content },
                            selection: { anchor: actualStart + content.length }
                        });
                        editorView.focus();
                        return;
                    }
                }
                // Add bold
                if (selectedText) {
                    textToInsert = `**${selectedText}**`;
                    newCursorPos = fromPos + textToInsert.length;
                } else {
                    textToInsert = '**text**';
                    newCursorPos = fromPos + 2; // Position cursor inside **|text**
                }
                break;
            }
            case 'italic': {
                if (activeFormats.italic) {
                    // Remove italic
                    const beforePos = Math.max(line.from, selection.from - 100);
                    const afterPos = Math.min(line.to, selection.to + 100);
                    const contextText = editorView.state.sliceDoc(beforePos, afterPos);
                    const relativeFrom = selection.from - beforePos;

                    const beforeText = contextText.slice(0, relativeFrom);
                    const afterText = contextText.slice(relativeFrom);
                    const startMarker = beforeText.lastIndexOf('*');
                    const endMarker = afterText.indexOf('*');

                    if (startMarker !== -1 && endMarker !== -1) {
                        const actualStart = beforePos + startMarker;
                        const actualEnd = selection.from + endMarker + 1;
                        const content = editorView.state.sliceDoc(actualStart + 1, actualEnd - 1);

                        editorView.dispatch({
                            changes: { from: actualStart, to: actualEnd, insert: content },
                            selection: { anchor: actualStart + content.length }
                        });
                        editorView.focus();
                        return;
                    }
                }
                // Add italic
                if (selectedText) {
                    textToInsert = `*${selectedText}*`;
                    newCursorPos = fromPos + textToInsert.length;
                } else {
                    textToInsert = '*text*';
                    newCursorPos = fromPos + 1;
                }
                break;
            }
            case 'underline': {
                if (activeFormats.underline) {
                    // Remove underline
                    const beforePos = Math.max(line.from, selection.from - 100);
                    const afterPos = Math.min(line.to, selection.to + 100);
                    const contextText = editorView.state.sliceDoc(beforePos, afterPos);
                    const relativeFrom = selection.from - beforePos;

                    const beforeText = contextText.slice(0, relativeFrom);
                    const afterText = contextText.slice(relativeFrom);
                    const startMarker = beforeText.lastIndexOf('<u>');
                    const endMarker = afterText.indexOf('</u>');

                    if (startMarker !== -1 && endMarker !== -1) {
                        const actualStart = beforePos + startMarker;
                        const actualEnd = selection.from + endMarker + 4;
                        const content = editorView.state.sliceDoc(actualStart + 3, actualEnd - 4);

                        editorView.dispatch({
                            changes: { from: actualStart, to: actualEnd, insert: content },
                            selection: { anchor: actualStart + content.length }
                        });
                        editorView.focus();
                        return;
                    }
                }
                // Add underline
                if (selectedText) {
                    textToInsert = `<u>${selectedText}</u>`;
                    newCursorPos = fromPos + textToInsert.length;
                } else {
                    textToInsert = '<u>text</u>';
                    newCursorPos = fromPos + 3;
                }
                break;
            }
            case 'strikethrough': {
                if (activeFormats.strikethrough) {
                    // Remove strikethrough
                    const beforePos = Math.max(line.from, selection.from - 100);
                    const afterPos = Math.min(line.to, selection.to + 100);
                    const contextText = editorView.state.sliceDoc(beforePos, afterPos);
                    const relativeFrom = selection.from - beforePos;

                    const beforeText = contextText.slice(0, relativeFrom);
                    const afterText = contextText.slice(relativeFrom);
                    const startMarker = beforeText.lastIndexOf('~~');
                    const endMarker = afterText.indexOf('~~');

                    if (startMarker !== -1 && endMarker !== -1) {
                        const actualStart = beforePos + startMarker;
                        const actualEnd = selection.from + endMarker + 2;
                        const content = editorView.state.sliceDoc(actualStart + 2, actualEnd - 2);

                        editorView.dispatch({
                            changes: { from: actualStart, to: actualEnd, insert: content },
                            selection: { anchor: actualStart + content.length }
                        });
                        editorView.focus();
                        return;
                    }
                }
                // Add strikethrough
                if (selectedText) {
                    textToInsert = `~~${selectedText}~~`;
                    newCursorPos = fromPos + textToInsert.length;
                } else {
                    textToInsert = '~~text~~';
                    newCursorPos = fromPos + 2;
                }
                break;
            }
            case 'uppercase': {
                textToInsert = selectedText.toUpperCase();
                newCursorPos = fromPos + textToInsert.length;
                break;
            }
            case 'lowercase': {
                textToInsert = selectedText.toLowerCase();
                newCursorPos = fromPos + textToInsert.length;
                break;
            }
            case 'align-center': {
                if (activeFormats.alignCenter) {
                    // Remove center alignment - find the entire <div> block
                    const doc = editorView.state.doc;
                    let searchFrom = selection.from;
                    let searchTo = selection.to;

                    // Expand search to find the complete div tags
                    for (let i = searchFrom; i >= Math.max(0, searchFrom - 200); i--) {
                        const text = doc.sliceString(i, i + 20);
                        if (text.startsWith('<div align="center">') || text.startsWith("<div align='center'>")) {
                            searchFrom = i;
                            break;
                        }
                    }

                    for (let i = searchTo; i <= Math.min(doc.length, searchTo + 200); i++) {
                        const text = doc.sliceString(i - 6, i);
                        if (text.endsWith('</div>')) {
                            searchTo = i;
                            break;
                        }
                    }

                    const fullText = doc.sliceString(searchFrom, searchTo);
                    const unwrapped = fullText
                        .replace(/^<div align=["']center["']>\s*/, '')
                        .replace(/\s*<\/div>$/, '');

                    editorView.dispatch({
                        changes: { from: searchFrom, to: searchTo, insert: unwrapped },
                        selection: { anchor: searchFrom + unwrapped.length }
                    });
                    editorView.focus();
                    return;
                }
                // Add center alignment - wrap the selection or current line
                const textToWrap = selectedText || line.text || 'text';
                textToInsert = `<div align="center">${textToWrap}</div>`;

                // If no selection, replace the entire line
                if (!selectedText) {
                    fromPos = line.from;
                    toPos = line.to;
                }
                newCursorPos = fromPos + textToInsert.length;
                break;
            }
            case 'align-right': {
                if (activeFormats.alignRight) {
                    // Remove right alignment
                    const doc = editorView.state.doc;
                    let searchFrom = selection.from;
                    let searchTo = selection.to;

                    for (let i = searchFrom; i >= Math.max(0, searchFrom - 200); i--) {
                        const text = doc.sliceString(i, i + 19);
                        if (text.startsWith('<div align="right">') || text.startsWith("<div align='right'>")) {
                            searchFrom = i;
                            break;
                        }
                    }

                    for (let i = searchTo; i <= Math.min(doc.length, searchTo + 200); i++) {
                        const text = doc.sliceString(i - 6, i);
                        if (text.endsWith('</div>')) {
                            searchTo = i;
                            break;
                        }
                    }

                    const fullText = doc.sliceString(searchFrom, searchTo);
                    const unwrapped = fullText
                        .replace(/^<div align=["']right["']>\s*/, '')
                        .replace(/\s*<\/div>$/, '');

                    editorView.dispatch({
                        changes: { from: searchFrom, to: searchTo, insert: unwrapped },
                        selection: { anchor: searchFrom + unwrapped.length }
                    });
                    editorView.focus();
                    return;
                }
                const textToWrap = selectedText || line.text || 'text';
                textToInsert = `<div align="right">${textToWrap}</div>`;

                if (!selectedText) {
                    fromPos = line.from;
                    toPos = line.to;
                }
                newCursorPos = fromPos + textToInsert.length;
                break;
            }
            case 'align-justify': {
                if (activeFormats.alignJustify) {
                    // Remove justify alignment
                    const doc = editorView.state.doc;
                    let searchFrom = selection.from;
                    let searchTo = selection.to;

                    for (let i = searchFrom; i >= Math.max(0, searchFrom - 200); i--) {
                        const text = doc.sliceString(i, i + 21);
                        if (text.startsWith('<div align="justify">') || text.startsWith("<div align='justify'>")) {
                            searchFrom = i;
                            break;
                        }
                    }

                    for (let i = searchTo; i <= Math.min(doc.length, searchTo + 200); i++) {
                        const text = doc.sliceString(i - 6, i);
                        if (text.endsWith('</div>')) {
                            searchTo = i;
                            break;
                        }
                    }

                    const fullText = doc.sliceString(searchFrom, searchTo);
                    const unwrapped = fullText
                        .replace(/^<div align=["']justify["']>\s*/, '')
                        .replace(/\s*<\/div>$/, '');

                    editorView.dispatch({
                        changes: { from: searchFrom, to: searchTo, insert: unwrapped },
                        selection: { anchor: searchFrom + unwrapped.length }
                    });
                    editorView.focus();
                    return;
                }
                const textToWrap = selectedText || line.text || 'text';
                textToInsert = `<div align="justify">${textToWrap}</div>`;

                if (!selectedText) {
                    fromPos = line.from;
                    toPos = line.to;
                }
                newCursorPos = fromPos + textToInsert.length;
                break;
            }
            case 'align-left': {
                // Remove any alignment
                const doc = editorView.state.doc;
                let searchFrom = selection.from;
                let searchTo = selection.to;

                // Look for any alignment div
                for (let i = searchFrom; i >= Math.max(0, searchFrom - 200); i--) {
                    const text = doc.sliceString(i, i + 25);
                    if (text.match(/<div align=["'](center|right|justify)["']>/)) {
                        searchFrom = i;
                        break;
                    }
                }

                for (let i = searchTo; i <= Math.min(doc.length, searchTo + 200); i++) {
                    const text = doc.sliceString(i - 6, i);
                    if (text.endsWith('</div>')) {
                        searchTo = i;
                        break;
                    }
                }

                const fullText = doc.sliceString(searchFrom, searchTo);
                if (fullText.match(/<div align=["'](center|right|justify)["']>/)) {
                    const unwrapped = fullText
                        .replace(/^<div align=["'](center|right|justify)["']>\s*/, '')
                        .replace(/\s*<\/div>$/, '');

                    editorView.dispatch({
                        changes: { from: searchFrom, to: searchTo, insert: unwrapped },
                        selection: { anchor: searchFrom + unwrapped.length }
                    });
                }
                editorView.focus();
                return;
            }
        }

        editorView.dispatch({
            changes: { from: fromPos, to: toPos, insert: textToInsert },
            selection: { anchor: newCursorPos }
        });

        editorView.focus();
    };

    return (
        <div className="top-bar">
            <div className="logo-section">
                <button
                    className={`icon-btn ${isBlockPanelOpen ? 'active' : ''}`}
                    onClick={toggleBlockPanel}
                    title={isBlockPanelOpen ? "Hide menu" : "Show menu"}
                >
                    <div className="menu-icon-wrapper">
                        {isBlockPanelOpen ? (
                            <ChevronLeft className="icon menu-icon" />
                        ) : (
                            <Menu className="icon menu-icon" />
                        )}
                    </div>
                </button>
                <FileText className="icon" style={{ marginLeft: '12px' }} />
                <span className="app-title">MD Live</span>
            </div>

            <div className="formatting-section">
                <div className="format-group">
                    <button
                        className={`format-btn ${activeFormats.bold ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('bold'); }}
                        title="Bold"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        className={`format-btn ${activeFormats.italic ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('italic'); }}
                        title="Italic"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        className={`format-btn ${activeFormats.underline ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('underline'); }}
                        title="Underline"
                    >
                        <Underline size={16} />
                    </button>
                    <button
                        className={`format-btn ${activeFormats.strikethrough ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('strikethrough'); }}
                        title="Strikethrough"
                    >
                        <Strikethrough size={16} />
                    </button>
                </div>
                <div className="format-divider"></div>
                <div className="format-group">
                    <button
                        className="format-btn"
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('uppercase'); }}
                        title="UPPERCASE"
                    >
                        <Type size={16} />
                    </button>
                    <button
                        className="format-btn"
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('lowercase'); }}
                        title="lowercase"
                    >
                        <Type size={12} />
                    </button>
                </div>
                <div className="format-divider"></div>
                <div className="format-group">
                    <button
                        className={`format-btn ${!activeFormats.alignCenter && !activeFormats.alignRight && !activeFormats.alignJustify ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('align-left'); }}
                        title="Align Left"
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        className={`format-btn ${activeFormats.alignCenter ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('align-center'); }}
                        title="Align Center"
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        className={`format-btn ${activeFormats.alignRight ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('align-right'); }}
                        title="Align Right"
                    >
                        <AlignRight size={16} />
                    </button>
                    <button
                        className={`format-btn ${activeFormats.alignJustify ? 'active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); toggleFormat('align-justify'); }}
                        title="Justify"
                    >
                        <AlignJustify size={16} />
                    </button>
                </div>
            </div>

            <div className="actions-section">
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
                        onClick={() => setViewMode('split')}
                        title="Split View"
                    >
                        <Layout className="icon" />
                        <span>Split</span>
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'live' ? 'active' : ''}`}
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
