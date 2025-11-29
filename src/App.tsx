import { useState, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { SplitView } from './components/Editor/SplitView';
import { LiveView } from './components/Editor/LiveView';
import { TopBar } from './components/Toolbar/TopBar';
import { BlockPanel } from './components/BlockPanel/BlockPanel';
import './App.css';

export type ViewMode = 'live' | 'split';

function App() {
  const [markdownContent, setMarkdownContent] = useState<string>('# Welcome to Markdown Live Viewer\n\nStart typing to see the magic happen!');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isBlockPanelOpen, setIsBlockPanelOpen] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  const handleContentChange = useCallback((newContent: string) => {
    setMarkdownContent(newContent);
  }, []);

  const handleInsertBlock = useCallback((text: string) => {
    if (editorView) {
      // Get the current cursor position
      const currentPos = editorView.state.selection.main.head;

      // Insert at cursor position
      const transaction = editorView.state.update({
        changes: { from: currentPos, insert: text },
        selection: { anchor: currentPos + text.length }
      });
      editorView.dispatch(transaction);
      editorView.focus(); // Focus the editor after insertion
    } else {
      // Fallback for when editorView is not available (e.g., in LiveView mode)
      setMarkdownContent((prev) => prev + '\n' + text);
    }
  }, [editorView]);

  return (
    <div className="app-container">
      <TopBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        markdownContent={markdownContent}
        setMarkdownContent={handleContentChange}
        isBlockPanelOpen={isBlockPanelOpen}
        toggleBlockPanel={() => setIsBlockPanelOpen(!isBlockPanelOpen)}
        editorView={editorView}
      />
      <main className="editor-container">
        <BlockPanel isOpen={isBlockPanelOpen} onInsert={handleInsertBlock} />
        {viewMode === 'split' ? (
          <SplitView
            content={markdownContent}
            onChange={handleContentChange}
            setEditorView={setEditorView}
            editorView={editorView}
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
