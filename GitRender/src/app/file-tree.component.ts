import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileTreeNode } from './services/file.service';
import { FileTreeNodeComponent } from './file-tree-node.component';

@Component({
  selector: 'app-file-tree',
  standalone: true,
  imports: [CommonModule, FileTreeNodeComponent],
  template: `
    <div class="file-tree">
      <div class="tree-controls">
        <button type="button" class="tree-control-btn" (click)="expandAll()" title="Expandir todo">
          📂
        </button>
        <button type="button" class="tree-control-btn" (click)="collapseAll()" title="Colapsar todo">
          📁
        </button>
      </div>
      <div class="tree-nodes">
        <app-file-tree-node
          *ngFor="let node of tree()"
          [node]="node"
          [level]="0"
          (nodeClick)="onNodeClick($event)"
          (nodeToggle)="onNodeToggle($event)">
        </app-file-tree-node>
      </div>
    </div>
  `,
  styleUrls: ['./file-tree.component.css']
})
export class FileTreeComponent {
  @Input() set treeData(value: FileTreeNode[]) {
    this.tree.set(value || []);
  }

  @Output() fileSelected = new EventEmitter<string>();
  @Output() directoryToggled = new EventEmitter<FileTreeNode>();

  tree = signal<FileTreeNode[]>([]);

  onNodeClick(node: FileTreeNode): void {
    if (node.type === 'file') {
      this.fileSelected.emit(node.path);
    }
  }

  onNodeToggle(node: FileTreeNode): void {
    this.directoryToggled.emit(node);
  }

  expandAll(): void {
    this.expandAllNodes(this.tree());
  }

  collapseAll(): void {
    this.collapseAllNodes(this.tree());
  }

  private expandAllNodes(nodes: FileTreeNode[]): void {
    nodes.forEach(node => {
      if (node.type === 'directory') {
        node.isExpanded = true;
        if (node.children) {
          this.expandAllNodes(node.children);
        }
      }
    });
  }

  private collapseAllNodes(nodes: FileTreeNode[]): void {
    nodes.forEach(node => {
      if (node.type === 'directory') {
        node.isExpanded = false;
        if (node.children) {
          this.collapseAllNodes(node.children);
        }
      }
    });
  }
}
