import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileTreeNode } from './services/file.service';

@Component({
  selector: 'app-file-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-node" [style.padding-left.px]="level * 20">
      <div
        class="node-content"
        [class.selected]="node.isSelected"
        (click)="onClick()"
        role="button"
        tabindex="0"
        (keydown.enter)="onClick()"
        [attr.aria-expanded]="node.type === 'directory' ? node.isExpanded : null"
        [attr.aria-label]="getAriaLabel()">

        <!-- Expand/collapse icon for directories -->
        <span
          *ngIf="node.type === 'directory'"
          class="toggle-icon"
          (click)="onToggle($event)"
          [class.expanded]="node.isExpanded">
          {{ node.isExpanded ? '▼' : '▶' }}
        </span>

        <!-- File/directory icon -->
        <span class="node-icon">{{ getNodeIcon() }}</span>

        <!-- Node name -->
        <span class="node-name">{{ node.name }}</span>

        <!-- File size (only for files) -->
        <span *ngIf="node.type === 'file' && node.size" class="node-size">
          ({{ formatSize(node.size) }})
        </span>
      </div>

      <!-- Children nodes -->
      <div *ngIf="node.type === 'directory' && node.isExpanded && node.children" class="node-children">
        <app-file-tree-node
          *ngFor="let child of node.children"
          [node]="child"
          [level]="level + 1"
          (nodeClick)="onChildClick($event)"
          (nodeToggle)="onChildToggle($event)">
        </app-file-tree-node>
      </div>
    </div>
  `,
  styleUrls: ['./file-tree-node.component.css']
})
export class FileTreeNodeComponent {
  @Input() node!: FileTreeNode;
  @Input() level = 0;

  @Output() nodeClick = new EventEmitter<FileTreeNode>();
  @Output() nodeToggle = new EventEmitter<FileTreeNode>();

  onClick(): void {
    this.nodeClick.emit(this.node);
  }

  onToggle(event: Event): void {
    event.stopPropagation();
    this.node.isExpanded = !this.node.isExpanded;
    this.nodeToggle.emit(this.node);
  }

  onChildClick(childNode: FileTreeNode): void {
    this.nodeClick.emit(childNode);
  }

  onChildToggle(childNode: FileTreeNode): void {
    this.nodeToggle.emit(childNode);
  }

  getNodeIcon(): string {
    if (this.node.type === 'directory') {
      return this.node.isExpanded ? '📂' : '📁';
    }

    // File icons based on extension
    const ext = this.getFileExtension(this.node.name);
    switch (ext) {
      case '.ts': return '🟦';
      case '.js': return '🟨';
      case '.html': return '🟠';
      case '.css': return '🟣';
      case '.json': return '📄';
      case '.md': return '📝';
      case '.py': return '🐍';
      case '.java': return '☕';
      case '.cpp': return '🔧';
      case '.c': return '🔧';
      case '.rs': return '🦀';
      case '.go': return '🐹';
      case '.php': return '🐘';
      case '.rb': return '💎';
      case '.swift': return '🦉';
      case '.kt': return '🎯';
      case '.vue': return '💚';
      case '.react': return '⚛️';
      case '.angular': return '🅰️';
      case '.dockerfile': return '🐳';
      case '.yml':
      case '.yaml': return '⚙️';
      case '.xml': return '📄';
      case '.sql': return '🗃️';
      case '.sh': return '📜';
      case '.bat': return '📜';
      case '.ps1': return '📜';
      case '.gitignore': return '🚫';
      case '.env': return '🔐';
      default: return '📄';
    }
  }

  getAriaLabel(): string {
    const type = this.node.type === 'directory' ? 'directorio' : 'archivo';
    const size = this.node.size ? `, tamaño ${this.formatSize(this.node.size)}` : '';
    return `${type} ${this.node.name}${size}`;
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
  }

  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return unitIndex === 0 ? `${size} ${units[unitIndex]}` : `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
