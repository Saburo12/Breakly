import React, { useState, useEffect } from 'react';
import { FileTree } from './FileTree';
import { MultiFileEditor } from './MultiFileEditor';
import { GeneratedFile } from '../types';
import { buildFileTree, flattenFileTree, getFileByPath, FileNode } from '../utils/fileUtils';

interface CodeWorkspaceProps {
  files: GeneratedFile[];
  onFileChange?: (path: string, content: string) => void;
  readOnly?: boolean;
}

/**
 * CodeWorkspace Component
 * Complete code editing workspace with file tree and multi-file editor
 */
export function CodeWorkspace({ files, onFileChange, readOnly = false }: CodeWorkspaceProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<string | undefined>();

  // Build file tree when files change
  useEffect(() => {
    const tree = buildFileTree(files);
    setFileTree(tree);

    // Auto-open first file if no file is open
    if (openFiles.length === 0 && tree.length > 0) {
      const allFiles = flattenFileTree(tree);
      if (allFiles.length > 0) {
        handleFileSelect(allFiles[0]);
      }
    }
  }, [files]);

  const handleFileSelect = (file: FileNode) => {
    // Don't open folders
    if (file.type !== 'file') return;

    // Add to open files if not already open
    if (!openFiles.find(f => f.path === file.path)) {
      setOpenFiles([...openFiles, file]);
    }

    // Set as active file
    setActiveFile(file.path);
  };

  const handleFileClose = (path: string) => {
    const newOpenFiles = openFiles.filter(f => f.path !== path);
    setOpenFiles(newOpenFiles);

    // If closing active file, switch to another open file
    if (activeFile === path) {
      if (newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1].path);
      } else {
        setActiveFile(undefined);
      }
    }
  };

  const handleFileContentChange = (path: string, content: string) => {
    // Update content in open files
    setOpenFiles(openFiles.map(file =>
      file.path === path ? { ...file, content } : file
    ));

    // Update content in file tree
    const updatedTree = updateFileContent(fileTree, path, content);
    setFileTree(updatedTree);

    // Notify parent component
    if (onFileChange) {
      onFileChange(path, content);
    }
  };

  const handleTabClick = (path: string) => {
    setActiveFile(path);
  };

  return (
    <div className="flex h-full bg-[#0a0a0a]">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r border-[#333] flex-shrink-0 overflow-hidden">
        <FileTree
          nodes={fileTree}
          selectedFile={activeFile}
          onFileSelect={handleFileSelect}
        />
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <MultiFileEditor
          openFiles={openFiles}
          activeFile={activeFile}
          onFileClose={handleFileClose}
          onFileChange={handleFileContentChange}
          onTabClick={handleTabClick}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

/**
 * Helper function to update file content in the tree
 */
function updateFileContent(nodes: FileNode[], path: string, content: string): FileNode[] {
  return nodes.map(node => {
    if (node.path === path && node.type === 'file') {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateFileContent(node.children, path, content) };
    }
    return node;
  });
}
