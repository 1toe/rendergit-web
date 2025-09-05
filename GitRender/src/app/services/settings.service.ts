import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  viewMode: 'human' | 'llm';
  compactView: boolean;
  showLineNumbers: boolean;
  fontSize: number;
  codeTheme: string;
  autoSave: boolean;
  bookmarks: string[];
  lastUsedRepos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly SETTINGS_KEY = 'repo-browser-settings';

  private settingsSubject = new BehaviorSubject<UserPreferences>(this.getStoredSettings());
  public settings$ = this.settingsSubject.asObservable();

  public userPreferences = signal<UserPreferences>(this.getStoredSettings());

  constructor() {
    // Sincronizar signal con BehaviorSubject
    effect(() => {
      const settings = this.userPreferences();
      this.settingsSubject.next(settings);
      this.saveSettings(settings);
    });
  }

  updateSettings(updates: Partial<UserPreferences>): void {
    const current = this.userPreferences();
    const newSettings = { ...current, ...updates };
    this.userPreferences.set(newSettings);
  }

  getSetting<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.userPreferences()[key];
  }

  setSetting<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    this.updateSettings({ [key]: value });
  }

  addBookmark(path: string): void {
    const current = this.userPreferences();
    if (!current.bookmarks.includes(path)) {
      this.updateSettings({
        bookmarks: [...current.bookmarks, path]
      });
    }
  }

  removeBookmark(path: string): void {
    const current = this.userPreferences();
    this.updateSettings({
      bookmarks: current.bookmarks.filter(b => b !== path)
    });
  }

  addRecentRepo(url: string): void {
    const current = this.userPreferences();
    const recent = [url, ...current.lastUsedRepos.filter(r => r !== url)].slice(0, 10);
    this.updateSettings({ lastUsedRepos: recent });
  }

  resetToDefaults(): void {
    const defaults: UserPreferences = {
      theme: 'auto',
      sidebarCollapsed: false,
      sidebarPinned: false,
      viewMode: 'human',
      compactView: false,
      showLineNumbers: true,
      fontSize: 14,
      codeTheme: 'github',
      autoSave: true,
      bookmarks: [],
      lastUsedRepos: []
    };
    this.userPreferences.set(defaults);
  }

  private getStoredSettings(): UserPreferences {
    const stored = localStorage.getItem(this.SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultSettings(), ...parsed };
      } catch (e) {
        console.warn('Failed to parse settings from localStorage', e);
      }
    }
    return this.getDefaultSettings();
  }

  private getDefaultSettings(): UserPreferences {
    return {
      theme: 'auto',
      sidebarCollapsed: false,
      sidebarPinned: false,
      viewMode: 'human',
      compactView: false,
      showLineNumbers: true,
      fontSize: 14,
      codeTheme: 'github',
      autoSave: true,
      bookmarks: [],
      lastUsedRepos: []
    };
  }

  private saveSettings(settings: UserPreferences): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }
}
