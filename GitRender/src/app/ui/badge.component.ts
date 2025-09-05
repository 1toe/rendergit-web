import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
  styleUrls: ['./badge.component.css']
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: 'sm' | 'default' | 'lg' = 'default';

  get badgeClasses(): string {
    const classes = ['badge'];

    classes.push(`badge-${this.variant}`);
    classes.push(`badge-${this.size}`);

    return classes.join(' ');
  }
}
