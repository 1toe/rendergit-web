import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class]="cardClasses">
      <div class="card-header" *ngIf="header">
        <ng-content select="[card-header]"></ng-content>
      </div>
      <div class="card-content">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="footer">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() variant: 'default' | 'elevated' | 'outlined' = 'default';
  @Input() padding: 'default' | 'sm' | 'lg' | 'none' = 'default';
  @Input() header = false;
  @Input() footer = false;

  get cardClasses(): string {
    const classes = ['card'];

    classes.push(`card-${this.variant}`);
    classes.push(`card-padding-${this.padding}`);

    return classes.join(' ');
  }
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `
    <div class="card-header-content">
      <ng-content></ng-content>
    </div>
  `
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `
    <div class="card-content-wrapper">
      <ng-content></ng-content>
    </div>
  `
})
export class CardContentComponent {}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  template: `
    <div class="card-footer-content">
      <ng-content></ng-content>
    </div>
  `
})
export class CardFooterComponent {}
