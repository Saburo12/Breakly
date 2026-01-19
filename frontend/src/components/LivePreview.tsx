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
  // Create image URL mappings for base64 images
  const imageMap: Record<string, string> = {};

  files.forEach(file => {
    if (file.language === 'base64') {
      // Determine MIME type from filename
      const ext = file.name.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' :
                       ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                       ext === 'gif' ? 'image/gif' :
                       ext === 'svg' ? 'image/svg+xml' : 'image/png';

      // Create data URL
      const dataUrl = `data:${mimeType};base64,${file.content}`;

      // Map both /assets/filename and public/assets/filename
      imageMap[`/assets/${file.name}`] = dataUrl;
      imageMap[`/public/assets/${file.name}`] = dataUrl;

      console.log(`[Preview] Mapped /assets/${file.name} to data URL`);
    }
  });

  // Convert GeneratedFile[] to Sandpack file format
  const sandpackFiles = files.reduce((acc, file) => {
    // Skip base64 image files - we'll handle them via imageMap
    if (file.language === 'base64') {
      return acc;
    }

    let code = file.content;

    // Replace image paths with data URLs in the code
    Object.entries(imageMap).forEach(([path, dataUrl]) => {
      code = code.replace(new RegExp(`["']${path}["']`, 'g'), `"${dataUrl}"`);
      code = code.replace(new RegExp(`url\\(${path}\\)`, 'g'), `url(${dataUrl})`);
    });

    // Sandpack expects files with "/" prefix
    const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;
    acc[filePath] = {
      code: code,
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
