import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-separator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="separatorClasses" role="separator" [attr.aria-orientation]="orientation">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./separator.component.css']
})
export class SeparatorComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() decorative = true;

  get separatorClasses(): string {
    const classes = ['separator'];

    classes.push(`separator-${this.orientation}`);

    if (this.decorative) {
      classes.push('separator-decorative');
    }

    return classes.join(' ');
  }
}
