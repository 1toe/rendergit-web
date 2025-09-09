import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import './DirectoryTree.css';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
}

interface DirectoryTreeProps {
  files: { path: string; size: number }[];
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ files, onFileSelect, selectedFile }) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']));

  // Construir el árbol de archivos
  const buildTree = (files: { path: string; size: number }[]): FileNode[] => {
    const pathMap = new Map<string, FileNode>();

    // Crear nodo raíz
    const root: FileNode = { name: '', path: '/', type: 'directory', children: [] };
    pathMap.set('/', root);

    files.forEach(({ path, size }) => {
      const parts = path.split('/').filter(Boolean);
      let currentPath = '';
      let currentNode = root;

      parts.forEach((part, index) => {
        currentPath += '/' + part;
        const isFile = index === parts.length - 1;
        
        if (!pathMap.has(currentPath)) {
          const newNode: FileNode = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'directory',
            children: isFile ? undefined : [],
            size: isFile ? size : undefined
          };
          
          pathMap.set(currentPath, newNode);
          currentNode.children!.push(newNode);
        }
        
        if (!isFile) {
          currentNode = pathMap.get(currentPath)!;
        }
      });
    });

    return root.children || [];
  };

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const handleFileClick = (filePath: string) => {
    if (onFileSelect) {
      onFileSelect(filePath);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedDirs.has(node.path);
    const isSelected = selectedFile === node.path;

    if (node.type === 'directory') {
      return (
        <div key={node.path} className="tree-node directory">
          <div 
            className={`tree-item ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => toggleDirectory(node.path)}
          >
            <span className="tree-icon">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <span className="folder-icon">
              {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            </span>
            <span className="tree-label">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div className="tree-children">
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={node.path} className="tree-node file">
          <div 
            className={`tree-item ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${depth * 20 + 24}px` }}
            onClick={() => handleFileClick(node.path)}
          >
            <span className="file-icon">
              <File size={16} />
            </span>
            <span className="tree-label">{node.name}</span>
            {node.size !== undefined && (
              <span className="file-size">{formatSize(node.size)}</span>
            )}
          </div>
        </div>
      );
    }
  };

  const tree = buildTree(files);

  return (
    <div className="directory-tree">
      <div className="tree-header">
        <h3>Directory Tree</h3>
        <span className="file-count">{files.length} archivos</span>
      </div>
      <div className="tree-content">
        {tree.map(node => renderNode(node))}
      </div>
    </div>
  );
};

export default DirectoryTree;
