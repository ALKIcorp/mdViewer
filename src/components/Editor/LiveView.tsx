import React from 'react';
import { Milkdown, useEditor, MilkdownProvider } from '@milkdown/react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { nord } from '@milkdown/theme-nord';
import './LiveView.css';

interface LiveViewProps {
    content: string;
    onChange: (value: string) => void;
}

const LiveViewEditor: React.FC<LiveViewProps> = ({ content, onChange }) => {
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
                return () => {
                    // Configure listener after it's added
                    ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
                        if (markdown !== prevMarkdown) {
                            onChange(markdown);
                        }
                    });
                };
            })
        , [onChange]);

    return <Milkdown />;
};

export const LiveView: React.FC<LiveViewProps> = (props) => {
    // Handle external content updates (e.g. file load)
    // Note: Milkdown doesn't easily support 2-way binding without full re-init or specific plugin.
    // For now, we assume LiveView is the source of truth when active.
    // If we switch back to LiveView from SplitView, the editor is re-mounted, so it picks up the new content via defaultValueCtx.

    return (
        <div className="live-view">
            <MilkdownProvider>
                <LiveViewEditor {...props} />
            </MilkdownProvider>
        </div>
    );
};
