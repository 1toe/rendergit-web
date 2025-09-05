import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="input-wrapper" [class]="wrapperClasses">
      <div class="input-prefix" *ngIf="prefix">
        <ng-content select="[input-prefix]"></ng-content>
      </div>

      <input
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        [value]="value"
        [class]="inputClasses"
        (input)="onInput($event)"
        (blur)="onBlur.emit($event)"
        (focus)="onFocus.emit($event)"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="ariaDescribedBy"
        #inputElement>

      <div class="input-suffix" *ngIf="suffix">
        <ng-content select="[input-suffix]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() variant: 'default' | 'error' | 'success' = 'default';
  @Input() size: 'sm' | 'default' | 'lg' = 'default';
  @Input() prefix = false;
  @Input() suffix = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;

  @Output() onBlur = new EventEmitter<FocusEvent>();
  @Output() onFocus = new EventEmitter<FocusEvent>();

  value = '';
  private onChange = (value: any) => {};
  private onTouched = () => {};

  get wrapperClasses(): string {
    const classes = ['input-wrapper'];

    classes.push(`input-wrapper-${this.variant}`);
    classes.push(`input-wrapper-${this.size}`);

    if (this.disabled) {
      classes.push('input-wrapper-disabled');
    }

    return classes.join(' ');
  }

  get inputClasses(): string {
    const classes = ['input'];

    classes.push(`input-${this.variant}`);
    classes.push(`input-${this.size}`);

    return classes.join(' ');
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
