import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { FileNode, getFileIcon } from '../utils/fileUtils';

interface FileTreeProps {
  nodes: FileNode[];
  selectedFile?: string;
  onFileSelect: (file: FileNode) => void;
}

/**
 * FileTree Component
 * Displays hierarchical file and folder structure
 */
export function FileTree({ nodes, selectedFile, onFileSelect }: FileTreeProps) {
  return (
    <div className="bg-[#0a0a0a] text-gray-100 h-full overflow-y-auto">
      <div className="p-2 border-b border-[#333] font-semibold text-sm">
        FILES
      </div>
      <div className="p-2">
        {nodes.map(node => (
          <FileTreeNode
            key={node.path}
            node={node}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  selectedFile?: string;
  onFileSelect: (file: FileNode) => void;
  depth: number;
}

/**
 * FileTreeNode Component
 * Individual node in the file tree (file or folder)
 */
function FileTreeNode({ node, selectedFile, onFileSelect, depth }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node);
    }
  };

  const paddingLeft = depth * 12 + 8;

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm
          hover:bg-[#1a1a1a] transition-colors
          ${isSelected ? 'bg-[#2a2a2a]' : ''}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {/* Expand/Collapse Icon */}
        {node.type === 'folder' && (
          <span className="flex-shrink-0 w-4 h-4">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}

        {/* Folder/File Icon */}
        {node.type === 'folder' ? (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-slate-400" />
            ) : (
              <Folder className="w-4 h-4 text-slate-400" />
            )}
          </span>
        ) : (
          <span className="flex-shrink-0 ml-4 text-base">
            {getFileIcon(node.name)}
          </span>
        )}

        {/* Name */}
        <span className={`truncate ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
          {node.name}
        </span>
      </div>

      {/* Children (for folders) */}
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
