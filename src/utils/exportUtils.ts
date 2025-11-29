import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export const exportToMarkdown = (content: string, filename: string = 'document.md') => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);
};

export const exportToPDF = async (elementId: string, filename: string = 'document.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait',
    });

    // Use the .html() method to render the HTML content to PDF
    // This requires the element to be visible
    await doc.html(element, {
        callback: (pdf) => {
            pdf.save(filename);
        },
        x: 40,
        y: 40,
        width: 515, // A4 width (595) - margins (40*2)
        windowWidth: 800, // Adjust as needed for the rendering width
        autoPaging: 'text',
    });
};

export const exportToDOCX = async (content: string, filename: string = 'document.docx') => {
    // Simple Markdown to DOCX parser
    // This is a basic implementation that handles headings and paragraphs
    const lines = content.split('\n');
    const children = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('# ')) {
            children.push(
                new Paragraph({
                    text: line.substring(2),
                    heading: HeadingLevel.HEADING_1,
                })
            );
        } else if (line.startsWith('## ')) {
            children.push(
                new Paragraph({
                    text: line.substring(3),
                    heading: HeadingLevel.HEADING_2,
                })
            );
        } else if (line.startsWith('### ')) {
            children.push(
                new Paragraph({
                    text: line.substring(4),
                    heading: HeadingLevel.HEADING_3,
                })
            );
        } else if (line === '') {
            // Empty line, maybe add spacing or ignore
            children.push(new Paragraph({ text: '' }));
        } else {
            // Regular paragraph
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: line,
                        }),
                    ],
                })
            );
        }
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
};
