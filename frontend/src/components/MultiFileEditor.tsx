import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { FileNode, getFileIcon } from '../utils/fileUtils';

interface MultiFileEditorProps {
  openFiles: FileNode[];
  activeFile?: string;
  onFileClose: (path: string) => void;
  onFileChange: (path: string, content: string) => void;
  onTabClick: (path: string) => void;
  readOnly?: boolean;
}

/**
 * MultiFileEditor Component
 * Tabbed editor interface for multiple files
 */
export function MultiFileEditor({
  openFiles,
  activeFile,
  onFileClose,
  onFileChange,
  onTabClick,
  readOnly = false,
}: MultiFileEditorProps) {
  const activeFileNode = openFiles.find(f => f.path === activeFile);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Tabs */}
      {openFiles.length > 0 ? (
        <>
          <div className="flex bg-[#1a1a1a] border-b border-[#333] overflow-x-auto">
            {openFiles.map(file => (
              <FileTab
                key={file.path}
                file={file}
                isActive={file.path === activeFile}
                onClose={() => onFileClose(file.path)}
                onClick={() => onTabClick(file.path)}
              />
            ))}
          </div>

          {/* Editor */}
          {activeFileNode && (
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={activeFileNode.content || ''}
                onChange={(value) => onFileChange(activeFileNode.path, value)}
                language={activeFileNode.language}
                readOnly={readOnly}
                height="100%"
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-lg">No files open</p>
            <p className="text-sm mt-2">Select a file from the explorer to open it</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface FileTabProps {
  file: FileNode;
  isActive: boolean;
  onClose: () => void;
  onClick: () => void;
}

/**
 * FileTab Component
 * Individual tab for an open file
 */
function FileTab({ file, isActive, onClose, onClick }: FileTabProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 border-r border-[#333] cursor-pointer
        hover:bg-[#2a2a2a] transition-colors min-w-max max-w-xs
        ${isActive ? 'bg-[#0a0a0a] text-white' : 'bg-[#1a1a1a] text-gray-400'}
      `}
    >
      {/* File Icon */}
      <span className="flex-shrink-0 text-sm">
        {getFileIcon(file.name)}
      </span>

      {/* File Name */}
      <span className="text-sm truncate">
        {file.name}
      </span>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 hover:bg-[#333] rounded p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
