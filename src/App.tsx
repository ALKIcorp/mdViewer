import { useState, useCallback } from 'react';
import { SplitView } from './components/Editor/SplitView';
import { LiveView } from './components/Editor/LiveView';
import { TopBar } from './components/Toolbar/TopBar';
import './App.css';

export type ViewMode = 'live' | 'split';

function App() {
  const [markdownContent, setMarkdownContent] = useState<string>('# Welcome to Markdown Live Viewer\n\nStart typing to see the magic happen!');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const handleContentChange = useCallback((newContent: string) => {
    setMarkdownContent(newContent);
  }, []);

  return (
    <div className="app-container">
      <TopBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        markdownContent={markdownContent}
        setMarkdownContent={handleContentChange}
      />
      <main className="editor-container">
        {viewMode === 'split' ? (
          <SplitView
            content={markdownContent}
            onChange={handleContentChange}
          />
        ) : (
          <LiveView
            content={markdownContent}
            onChange={handleContentChange}
          />
        )}
      </main>
    </div>
  );
}

export default App;
