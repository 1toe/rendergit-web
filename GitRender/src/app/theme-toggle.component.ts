import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="theme-toggle-btn"
      (click)="toggleTheme()"
      [title]="getButtonTitle()"
      [attr.aria-label]="getButtonTitle()">
      <span class="theme-icon">{{ getThemeIcon() }}</span>
      <span class="theme-text">{{ getThemeText() }}</span>
    </button>
  `,
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeIcon(): string {
    const theme = this.themeService.currentTheme();
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🌓';
      default: return '🌓';
    }
  }

  getThemeText(): string {
    const theme = this.themeService.currentTheme();
    switch (theme) {
      case 'light': return 'Claro';
      case 'dark': return 'Oscuro';
      case 'auto': return 'Automático';
      default: return 'Automático';
    }
  }

  getButtonTitle(): string {
    const theme = this.themeService.currentTheme();
    switch (theme) {
      case 'light': return 'Cambiar a tema oscuro';
      case 'dark': return 'Cambiar a tema automático';
      case 'auto': return 'Cambiar a tema claro';
      default: return 'Cambiar tema';
    }
  }
}
