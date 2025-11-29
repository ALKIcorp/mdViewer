import React, { useState } from 'react';
import { BlockCard } from './BlockCard';
import './BlockPanel.css';

interface BlockPanelProps {
    isOpen: boolean;
    onInsert: (text: string) => void;
}

export const BlockPanel: React.FC<BlockPanelProps> = ({ isOpen, onInsert }) => {
    const [sampleText, setSampleText] = useState('ALKI Corp MD Viewer');

    if (!isOpen) return null;

    const blocks = [
        {
            title: 'Big Title',
            description: 'Main document title. Use once at the top.',
            previewContent: `# ${sampleText}`,
            insertContent: `# ${sampleText}\n\n`,
        },
        {
            title: 'Section Title',
            description: 'Heading for a new section.',
            previewContent: `## ${sampleText}`,
            insertContent: `## ${sampleText}\n\n`,
        },
        {
            title: 'Text',
            description: 'Standard body paragraph.',
            previewContent: sampleText,
            insertContent: `${sampleText}\n\n`,
        },
        {
            title: 'Code Block',
            description: 'Fenced code block for code snippets.',
            previewContent: "```javascript\n" + sampleText + "\n```",
            insertContent: "```javascript\n" + sampleText + "\n```\n\n",
        },
        {
            title: 'Bullet List',
            description: 'Simple bulleted list.',
            previewContent: `- ${sampleText}\n- ${sampleText}`,
            insertContent: `- ${sampleText}\n- ${sampleText}\n\n`,
        },
        {
            title: 'Divider',
            description: 'Horizontal divider line. Use to separate sections.',
            previewContent: '---',
            insertContent: '---\n\n',
        },
    ];

    const handleDragStart = (e: React.DragEvent, content: string) => {
        e.dataTransfer.setData('text/plain', content);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="block-panel">
            <div className="sample-text-container">
                <label className="sample-text-label">Sample text</label>
                <input
                    type="text"
                    className="sample-text-input"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                />
            </div>
            <div className="blocks-list">
                {blocks.map((block, index) => (
                    <BlockCard
                        key={index}
                        title={block.title}
                        description={block.description}
                        previewContent={block.previewContent}
                        onInsert={() => onInsert(block.insertContent)}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, block.insertContent)}
                    />
                ))}
            </div>
        </div>
    );
};
