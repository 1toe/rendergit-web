import { useState, useCallback } from 'react';
import { FileInfo } from './repoFlattenerService';

export interface FileOperation {
  type: 'read' | 'write' | 'delete' | 'rename';
  path: string;
  success: boolean;
  error?: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  isExpanded?: boolean;
  isSelected?: boolean;
}

export const useFileService = () => {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);
  const [operations, setOperations] = useState<FileOperation[]>([]);

  const buildFileTree = useCallback((files: FileInfo[]): FileTreeNode[] => {
    const root: FileTreeNode = {
      name: 'root',
      path: '',
      type: 'directory',
      children: [],
      isExpanded: true
    };

    for (const file of files) {
      addFileToTree(root, file);
    }

    const tree = root.children || [];
    setFileTree(tree);
    return tree;
  }, []);

  const addFileToTree = (root: FileTreeNode, file: FileInfo): void => {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');

      let child = current.children?.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path,
          type: isLast ? 'file' : 'directory',
          children: isLast ? undefined : [],
          size: isLast ? file.size : undefined,
          isExpanded: false,
          isSelected: false
        };
        if (!current.children) current.children = [];
        current.children.push(child);
      }

      if (!isLast) {
        current = child;
      }
    }
  };

  const selectFile = useCallback((file: FileInfo) => {
    setCurrentFile(file);
    setSelectedFiles(prev => {
      if (!prev.find(f => f.path === file.path)) {
        return [...prev, file];
      }
      return prev;
    });
  }, []);

  const deselectFile = useCallback((file: FileInfo) => {
    setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
    if (currentFile?.path === file.path) {
      setCurrentFile(null);
    }
  }, [currentFile]);

  const toggleFileSelection = useCallback((file: FileInfo) => {
    const isSelected = selectedFiles.some(f => f.path === file.path);
    if (isSelected) {
      deselectFile(file);
    } else {
      selectFile(file);
    }
  }, [selectedFiles, selectFile, deselectFile]);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
    setCurrentFile(null);
  }, []);

  const addOperation = useCallback((operation: FileOperation) => {
    setOperations(prev => [...prev, operation]);
  }, []);

  const clearOperations = useCallback(() => {
    setOperations([]);
  }, []);

  return {
    fileTree,
    selectedFiles,
    currentFile,
    operations,
    buildFileTree,
    selectFile,
    deselectFile,
    toggleFileSelection,
    clearSelection,
    addOperation,
    clearOperations
  };
};
