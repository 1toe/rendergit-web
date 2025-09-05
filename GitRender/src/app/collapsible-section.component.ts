import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="collapsible-section" [class.collapsed]="collapsed()">
      <div class="section-header" (click)="toggle()" role="button" tabindex="0" (keydown.enter)="toggle()">
        <div class="section-title">
          <span class="toggle-icon" [class.rotated]="!collapsed()">{{ collapsed() ? '▶' : '▼' }}</span>
          <ng-content select="[title]"></ng-content>
        </div>
        <div class="section-actions">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
      <div class="section-content" [class.expanded]="!collapsed()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./collapsible-section.component.css']
})
export class CollapsibleSectionComponent {
  @Input() initialCollapsed = false;
  @Input() persistKey?: string;

  collapsed = signal(this.getInitialState());

  private getInitialState(): boolean {
    if (this.persistKey) {
      const stored = localStorage.getItem(`section-${this.persistKey}`);
      return stored ? JSON.parse(stored) : this.initialCollapsed;
    }
    return this.initialCollapsed;
  }

  toggle(): void {
    this.collapsed.set(!this.collapsed());
    if (this.persistKey) {
      localStorage.setItem(`section-${this.persistKey}`, JSON.stringify(this.collapsed()));
    }
  }

  expand(): void {
    this.collapsed.set(false);
    if (this.persistKey) {
      localStorage.setItem(`section-${this.persistKey}`, 'false');
    }
  }

  collapse(): void {
    this.collapsed.set(true);
    if (this.persistKey) {
      localStorage.setItem(`section-${this.persistKey}`, 'true');
    }
  }
}
