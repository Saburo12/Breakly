/**
 * Utility functions for file handling, language detection, and folder organization
 */

import { GeneratedFile } from '../types';

/**
 * File tree node interface
 */
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

/**
 * Get language from file extension
 */
export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'sql': 'sql',
    'sh': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'toml': 'toml',
    'ini': 'ini',
    'env': 'plaintext',
    'txt': 'plaintext',
  };

  return languageMap[ext || ''] || 'plaintext';
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  // Special files
  if (filename === 'package.json') return '📦';
  if (filename === 'tsconfig.json') return '⚙️';
  if (filename === 'vite.config.ts' || filename === 'vite.config.js') return '⚡';
  if (filename === 'tailwind.config.ts' || filename === 'tailwind.config.js') return '🎨';
  if (filename === '.gitignore') return '📝';
  if (filename === 'README.md') return '📖';
  if (filename.endsWith('.lock')) return '🔒';

  // Extensions
  const iconMap: Record<string, string> = {
    'tsx': '⚛️',
    'ts': '📘',
    'jsx': '⚛️',
    'js': '📜',
    'json': '📋',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'less': '🎨',
    'md': '📄',
    'py': '🐍',
    'java': '☕',
    'go': '🔵',
    'rs': '🦀',
    'rb': '💎',
    'php': '🐘',
    'sql': '🗄️',
    'sh': '💻',
    'yaml': '⚙️',
    'yml': '⚙️',
    'xml': '📋',
    'env': '🔐',
  };

  return iconMap[ext || ''] || '📄';
}

/**
 * Build file tree from flat list of files
 */
export function buildFileTree(files: GeneratedFile[]): FileNode[] {
  const root: FileNode[] = [];
  const folderMap = new Map<string, FileNode>();

  files.forEach(file => {
    const path = file.path || file.name;
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];

    // Create folder nodes
    let currentPath = '';
    let currentLevel = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

      let folder = folderMap.get(currentPath);

      if (!folder) {
        folder = {
          name: folderName,
          type: 'folder',
          path: currentPath,
          children: [],
        };

        currentLevel.push(folder);
        folderMap.set(currentPath, folder);
      }

      currentLevel = folder.children!;
    }

    // Create file node
    const fileNode: FileNode = {
      name: fileName,
      type: 'file',
      path: path,
      content: file.content,
      language: file.language || getLanguageFromFilename(fileName),
    };

    currentLevel.push(fileNode);
  });

  return sortFileTree(root);
}

/**
 * Sort file tree: folders first, then files, both alphabetically
 */
function sortFileTree(nodes: FileNode[]): FileNode[] {
  return nodes.sort((a, b) => {
    // Folders before files
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    // Alphabetically
    return a.name.localeCompare(b.name);
  }).map(node => {
    if (node.children) {
      node.children = sortFileTree(node.children);
    }
    return node;
  });
}

/**
 * Flatten file tree to get all files
 */
export function flattenFileTree(nodes: FileNode[]): FileNode[] {
  const files: FileNode[] = [];

  function traverse(nodes: FileNode[]) {
    nodes.forEach(node => {
      if (node.type === 'file') {
        files.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(nodes);
  return files;
}

/**
 * Get file by path from file tree
 */
export function getFileByPath(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path && node.type === 'file') {
      return node;
    }
    if (node.children) {
      const found = getFileByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}
