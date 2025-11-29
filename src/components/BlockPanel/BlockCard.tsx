import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { HelpCircle, Plus } from 'lucide-react';
import './BlockPanel.css';

interface BlockCardProps {
    title: string;
    description: string;
    previewContent: string;
    onInsert: () => void;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({
    title,
    description,
    previewContent,
    onInsert,
    draggable,
    onDragStart,
    onDragEnd,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="block-card"
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="block-header">
                <div className="block-title-area">
                    <span className="block-title">{title}</span>
                    <div
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <HelpCircle size={14} className="help-icon" />
                        {showTooltip && <div className="tooltip">{description}</div>}
                    </div>
                </div>
                <button className="insert-button" onClick={onInsert} title="Insert block">
                    <Plus size={16} />
                </button>
            </div>
            <div className="block-preview markdown-body">
                <ReactMarkdown>{previewContent}</ReactMarkdown>
            </div>
        </div>
    );
};
