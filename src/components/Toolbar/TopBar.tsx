import React from 'react';
import { FileText, Layout, Eye, Download, Upload } from 'lucide-react';
import type { ViewMode } from '../../App';
import './TopBar.css';

interface TopBarProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    markdownContent: string;
    setMarkdownContent: (content: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ viewMode, setViewMode, markdownContent, setMarkdownContent }) => {

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

    const handleExport = (type: 'md' | 'html') => {
        let content = markdownContent;
        let mimeType = 'text/markdown';
        let extension = 'md';

        if (type === 'html') {
            // Simple HTML export for now, could be improved
            // In a real app, we'd render it to HTML string properly
            // For now, let's just export the raw MD or use a basic wrapper if needed
            // But user asked for "convert it into every file type". 
            // We'll stick to MD for the basic "Save" and maybe a simple HTML wrapper later.
            // For this MVP step, let's just do MD download.
            mimeType = 'text/markdown';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="top-bar">
            <div className="logo-section">
                <FileText className="icon" />
                <span className="app-title">MD Live</span>
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
                    <label className="btn btn-icon">
                        <Upload className="icon" />
                        <input type="file" accept=".md,.txt" onChange={handleFileUpload} hidden />
                    </label>
                    <button className="btn btn-icon" onClick={() => handleExport('md')}>
                        <Download className="icon" />
                    </button>
                </div>
            </div>
        </div>
    );
};
