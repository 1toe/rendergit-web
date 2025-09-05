import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClasses"
      (click)="onClick.emit($event)"
      [attr.aria-label]="ariaLabel">
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'default';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() ariaLabel?: string;

  @Output() onClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const classes = ['btn'];

    // Variant classes
    classes.push(`btn-${this.variant}`);

    // Size classes
    classes.push(`btn-${this.size}`);

    // Disabled state
    if (this.disabled) {
      classes.push('btn-disabled');
    }

    return classes.join(' ');
  }
}
