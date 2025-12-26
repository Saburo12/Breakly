# Multi-File Code Editor - Usage Example

This project now includes a powerful multi-file code editor similar to Lovable, with file tree navigation, tabs, and syntax highlighting.

## Components Created

1. **CodeWorkspace** - Main component that combines file tree and editor
2. **FileTree** - Hierarchical file/folder browser
3. **MultiFileEditor** - Tabbed editor for multiple files
4. **fileUtils** - Utilities for file handling and language detection

## Usage Example

### Basic Usage

```tsx
import { CodeWorkspace } from './components/CodeWorkspace';
import { GeneratedFile } from './types';

function MyComponent() {
  const files: GeneratedFile[] = [
    {
      name: 'Index.tsx',
      path: 'src/pages/Index.tsx',
      content: 'import Navbar from "@/components/Navbar";\n...',
      language: 'typescript'
    },
    {
      name: 'App.tsx',
      path: 'src/App.tsx',
      content: 'function App() {...}',
      language: 'typescript'
    },
    {
      name: 'index.css',
      path: 'src/index.css',
      content: '@tailwind base;\n...',
      language: 'css'
    },
    {
      name: 'tsconfig.json',
      path: 'tsconfig.json',
      content: '{\n  "compilerOptions": {...}\n}',
      language: 'json'
    }
  ];

  return (
    <div style={{ height: '600px' }}>
      <CodeWorkspace files={files} readOnly={true} />
    </div>
  );
}
```

### File Path Format

The `path` field should include the full folder structure:
- `src/components/Button.tsx`
- `src/pages/Index.tsx`
- `public/index.html`
- `package.json`

The component will automatically:
- Build a folder tree structure
- Detect file language from extension
- Show appropriate icons for each file type
- Allow navigation between files with tabs

### Editable Mode

```tsx
<CodeWorkspace
  files={files}
  readOnly={false}
  onFileChange={(path, newContent) => {
    console.log(`File ${path} changed:`, newContent);
  }}
/>
```

### ChatInterface Integration

The ChatInterface now automatically uses CodeWorkspace when displaying generated files:

```tsx
// In your message handler
const message: Message = {
  id: '1',
  role: 'assistant',
  content: 'I created a React app for you!',
  timestamp: new Date(),
  files: [
    {
      name: 'App.tsx',
      path: 'src/App.tsx',
      content: '...',
      language: 'typescript'
    },
    {
      name: 'index.css',
      path: 'src/index.css',
      content: '...',
      language: 'css'
    }
  ]
};
```

The files will be displayed in a full-featured code workspace with:
- File tree on the left
- Tabbed editor on the right
- Syntax highlighting
- Dark theme
- File icons

## Supported File Types

The editor automatically detects and highlights:
- TypeScript/JavaScript (.ts, .tsx, .js, .jsx)
- CSS/SCSS/Less (.css, .scss, .less)
- HTML (.html)
- JSON (.json)
- Markdown (.md)
- Python (.py)
- And many more...

## Features

✅ Hierarchical folder structure
✅ File tree navigation
✅ Multiple file tabs
✅ Syntax highlighting with Monaco Editor
✅ Dark theme
✅ File type icons
✅ Auto-expand folders
✅ Read-only and editable modes
✅ Responsive design

## File Icons

The system includes emojis for common file types:
- 📦 package.json
- ⚙️ tsconfig.json
- ⚡ vite.config.ts
- 🎨 tailwind.config.ts
- ⚛️ .tsx/.jsx files
- 📘 .ts files
- 🌐 .html files
- And more...
