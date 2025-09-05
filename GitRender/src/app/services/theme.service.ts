import { Injectable, signal, computed, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'repo-browser-theme';
  private readonly PREFERS_DARK = '(prefers-color-scheme: dark)';

  private themeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());
  public theme$ = this.themeSubject.asObservable();

  public currentTheme = signal<Theme>(this.getStoredTheme());
  public isDark = computed(() => {
    const theme = this.currentTheme();
    if (theme === 'auto') {
      return window.matchMedia(this.PREFERS_DARK).matches;
    }
    return theme === 'dark';
  });

  constructor() {
    // Aplicar tema inicial
    this.applyTheme(this.currentTheme());

    // Escuchar cambios en preferencia del sistema cuando está en auto
    effect(() => {
      if (this.currentTheme() === 'auto') {
        const mediaQuery = window.matchMedia(this.PREFERS_DARK);
        const handleChange = () => this.updateBodyClass();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      return () => {}; // Cleanup function for non-auto themes
    });

    // Sincronizar signal con BehaviorSubject
    effect(() => {
      this.themeSubject.next(this.currentTheme());
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const current = this.currentTheme();
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
    this.setTheme(next);
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    return stored || 'auto';
  }

  private applyTheme(theme: Theme): void {
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia(this.PREFERS_DARK).matches);
    this.updateBodyClass(isDark);
  }

  private updateBodyClass(isDark?: boolean): void {
    const dark = isDark ?? this.isDark();
    document.body.classList.toggle('dark-theme', dark);
    document.body.classList.toggle('light-theme', !dark);
  }
}
