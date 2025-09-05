import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileInfo } from './repo-flattener.service';

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

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private operationsSubject = new BehaviorSubject<FileOperation[]>([]);
  public operations$ = this.operationsSubject.asObservable();

  public fileTree = signal<FileTreeNode[]>([]);
  public selectedFiles = signal<FileInfo[]>([]);
  public currentFile = signal<FileInfo | null>(null);

  constructor() {}

  buildFileTree(files: FileInfo[]): FileTreeNode[] {
    const root: FileTreeNode = {
      name: 'root',
      path: '',
      type: 'directory',
      children: [],
      isExpanded: true
    };

    for (const file of files) {
      this.addFileToTree(root, file);
    }

    this.fileTree.set(root.children || []);
    return root.children || [];
  }

  private addFileToTree(root: FileTreeNode, file: FileInfo): void {
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
  }

  selectFile(file: FileInfo): void {
    this.currentFile.set(file);
    const currentSelected = this.selectedFiles();
    if (!currentSelected.find(f => f.path === file.path)) {
      this.selectedFiles.set([...currentSelected, file]);
    }
  }

  deselectFile(file: FileInfo): void {
    const currentSelected = this.selectedFiles();
    this.selectedFiles.set(currentSelected.filter(f => f.path !== file.path));

    if (this.currentFile()?.path === file.path) {
      this.currentFile.set(null);
    }
  }

  toggleFileSelection(file: FileInfo): void {
    const currentSelected = this.selectedFiles();
    const isSelected = currentSelected.find(f => f.path === file.path);

    if (isSelected) {
      this.deselectFile(file);
    } else {
      this.selectFile(file);
    }
  }

  clearSelection(): void {
    this.selectedFiles.set([]);
    this.currentFile.set(null);
  }

  getFileByPath(path: string, files: FileInfo[]): FileInfo | null {
    return files.find(f => f.path === path) || null;
  }

  getFilesByExtension(extension: string, files: FileInfo[]): FileInfo[] {
    return files.filter(f => f.path.toLowerCase().endsWith(extension.toLowerCase()));
  }

  getFilesByType(type: 'markdown' | 'code' | 'config' | 'other', files: FileInfo[]): FileInfo[] {
    const extensions: Record<string, string[]> = {
      markdown: ['.md', '.markdown', '.mdown', '.mkd', '.mkdn'],
      code: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt'],
      config: ['.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf'],
      other: []
    };

    return files.filter(f => {
      const ext = this.getFileExtension(f.path);
      return extensions[type].includes(ext);
    });
  }

  private getFileExtension(path: string): string {
    const parts = path.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
  }

  exportSelectedFiles(): Observable<string> {
    return new Observable(observer => {
      const selected = this.selectedFiles();
      if (selected.length === 0) {
        observer.error('No files selected');
        return;
      }

      // For now, return JSON representation
      // TODO: Implement proper ZIP export with JSZip
      const exportData = {
        files: selected.map(f => ({
          path: f.path,
          size: f.size,
          content: f.content
        })),
        exportedAt: new Date().toISOString()
      };

      observer.next(JSON.stringify(exportData, null, 2));
      observer.complete();
    });
  }

  getFileStats(files: FileInfo[]): {
    totalFiles: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    largestFile: FileInfo | null;
  } {
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      fileTypes: {} as Record<string, number>,
      largestFile: null as FileInfo | null
    };

    for (const file of files) {
      const ext = this.getFileExtension(file.path);
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;

      if (!stats.largestFile || file.size > stats.largestFile.size) {
        stats.largestFile = file;
      }
    }

    return stats;
  }
}

// Note: JSZip would need to be installed for export functionality
// For now, this is a placeholder
