# MD Viewer V2 Documentation

## Overview
MD Viewer V2 introduces a new Block Panel for building documents with formatted blocks and adds comprehensive export options.

## New Features

### Block Panel
The Block Panel is a collapsible sidebar on the left side of the application. It allows users to quickly insert common Markdown structures into their document.

- **Toggle**: Click the panel icon in the top-left corner to show or hide the Block Panel.
- **Sample Text**: A text input at the top of the panel allows you to define "sample text". This text is used in the previews of the blocks and is inserted as placeholder content when you add a block.
- **Block Types**:
    - **Big Title**: Inserts a level 1 heading (`# Title`).
    - **Section Title**: Inserts a level 2 heading (`## Title`).
    - **Text**: Inserts a standard paragraph.
    - **Code Block**: Inserts a fenced code block.
    - **Bullet List**: Inserts a bulleted list.
- **Previews**: Hover over the "?" icon on any block card to see a description. The card itself shows a live preview of how the block will look with your sample text.
- **Insertion**: Click the "+" button on a block card to append that block to your document.

### Export Options
New export buttons are available in the top toolbar:

- **MD**: Downloads the current document as a Markdown (`.md`) file.
- **DOCX**: Downloads the current document as a Microsoft Word (`.docx`) file.
- **PDF**: Downloads the current document as a PDF (`.pdf`) file, capturing the rendered preview.

### Layout
The application now supports a responsive 3-column layout when the Block Panel is open:
1. **Block Panel** (Left)
2. **Editor** (Center)
3. **Live Preview** (Right)

When the Block Panel is closed, the layout reverts to the standard Editor/Preview split.
