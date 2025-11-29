# MD Viewer V3 Update

## Overview
The V3 update brings a significant overhaul to the application's branding, editor experience, and user interface. This release focuses on creating a more polished, "word-processor-like" writing environment while enhancing the visual identity of the application.

## New Features & Changes

### 1. Branding & Identity
The application has received a complete visual identity refresh.
- **New Logo**: The application now features a custom "Triangle" logo (`mdviewer_triangle_logo.png`).
- **Rotating Logo Component**: A new `RotatingLogo` component has been added to the Top Bar.
  - **Location**: `src/components/RotatingLogo/RotatingLogo.tsx`
  - **Behavior**: The logo rotates slowly by default and speeds up/glows on hover, adding a dynamic, premium feel.
  - **Implementation**: Uses CSS animations and React state to handle hover interactions.
- **App Title**: The application name has been officially updated to **MD Viewer**.

### 2. Editor Experience
The editor layout has been reimagined to mimic a standard document writing experience, moving away from a purely code-centric view.

#### Word-Processor Style Layout
- **Fixed Width Content**: Both the Editor and Preview panes now enforce a maximum width of **900px**.
  - **Why**: To improve readability and emulate the standard width of a document page (similar to Microsoft Word).
  - **Implementation**: Modified `src/components/Editor/SplitView.css` to apply `max-width: 900px` and `width: 900px` to the content containers.
- **Horizontal Scrolling**:
  - **Behavior**: Instead of wrapping text at the window edge, the editor now scrolls horizontally if the window is narrower than the document width.
  - **Implementation**: Added `overflow-x: auto` to `.editor-pane` and `.preview-pane`.
- **Visual Page Edge**:
  - **Feature**: A subtle vertical line appears at the 900px mark in the editor.
  - **Purpose**: To visually indicate the "edge" of the document page.
  - **Implementation**: Added a `::after` pseudo-element to `.editor-pane` in `SplitView.css`.

### 3. Toolbar & Formatting
The Top Bar has been expanded with a comprehensive suite of formatting tools, making Markdown editing more accessible.

#### Rich Text Formatting
New buttons have been added to `src/components/Toolbar/TopBar.tsx` for common Markdown syntax:
- **Style**: Bold (`**`), Italic (`*`), Underline (`<u>`), Strikethrough (`~~`).
- **Case**: Uppercase and Lowercase conversion.
- **Alignment**: Left, Center, Right, and Justify alignment (injects HTML `<div>` tags).

#### Smart Detection
- **Feature**: The toolbar buttons now "light up" (active state) when the cursor is placed inside formatted text.
- **How it works**: The `TopBar` component now includes a `detectFormattingAtCursor` function that analyzes the text surrounding the cursor to determine active styles.

### 4. UI Refinements
- **Export Menu**: The export options (MD, DOCX, PDF) have been consolidated into a styled dropdown menu for a cleaner interface.
- **Split View Divider**: The draggable divider has been styled with a visual "grip" indicator for better affordance.

## File Changes
- **[NEW]** `src/components/RotatingLogo/RotatingLogo.tsx`: New component for the animated logo.
- **[NEW]** `src/components/RotatingLogo/RotatingLogo.css`: Styles for the logo animation.
- **[MODIFY]** `src/components/Toolbar/TopBar.tsx`: Added formatting logic, logo integration, and updated export menu.
- **[MODIFY]** `src/components/Editor/SplitView.css`: Implemented fixed-width layout, horizontal scrolling, and page edge indicator.
- **[MODIFY]** `src/index.css`: Updated global scrollbar styling and base theme variables.
