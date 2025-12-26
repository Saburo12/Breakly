import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react';
import { GeneratedFile } from '../types';

interface LivePreviewProps {
  files: GeneratedFile[];
}

/**
 * LivePreview Component
 * Uses Sandpack to render a live preview of React/TypeScript projects
 */
export function LivePreview({ files }: LivePreviewProps) {
  // Convert GeneratedFile[] to Sandpack file format
  const sandpackFiles = files.reduce((acc, file) => {
    // Sandpack expects files with "/" prefix
    const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
    acc[path] = {
      code: file.content,
    };
    return acc;
  }, {} as Record<string, { code: string }>);

  // Determine entry point
  const hasIndexHtml = files.some(f => f.path === 'index.html' || f.path === '/index.html');
  const hasSrcMain = files.some(f => f.path.includes('src/main.tsx') || f.path.includes('src/index.tsx'));

  // Set up Sandpack template and files
  const template = hasIndexHtml ? 'vanilla-ts' : 'react-ts';
  const entry = hasSrcMain ? '/src/main.tsx' : hasIndexHtml ? '/index.html' : '/src/App.tsx';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <SandpackProvider
        template={template as any}
        files={sandpackFiles}
        theme="dark"
        options={{
          externalResources: [
            'https://cdn.tailwindcss.com',
          ],
        }}
        customSetup={{
          entry,
        }}
      >
        <SandpackLayout style={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}>
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={true}
            style={{ height: '100%', width: '100%' }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
