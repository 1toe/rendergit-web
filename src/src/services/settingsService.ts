import { useState, useCallback, useEffect } from 'react';

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

const SETTINGS_KEY = 'repo-browser-settings';

const defaultSettings: UserPreferences = {
  theme: 'auto',
  sidebarCollapsed: false,
  sidebarPinned: false,
  viewMode: 'human',
  compactView: false,
  showLineNumbers: true,
  fontSize: 14,
  codeTheme: 'vs-dark',
  autoSave: true,
  bookmarks: [],
  lastUsedRepos: []
};

const getStoredSettings = (): UserPreferences => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Failed to parse settings from localStorage', e);
    }
  }
  return defaultSettings;
};

const saveSettings = (settings: UserPreferences): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
};

export const useSettings = () => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(getStoredSettings);

  useEffect(() => {
    saveSettings(userPreferences);
  }, [userPreferences]);

  const updateSettings = useCallback((updates: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const getSetting = useCallback(<K extends keyof UserPreferences>(key: K): UserPreferences[K] => {
    return userPreferences[key];
  }, [userPreferences]);

  const setSetting = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    updateSettings({ [key]: value });
  }, [updateSettings]);

  const resetSettings = useCallback(() => {
    setUserPreferences(defaultSettings);
  }, []);

  const addBookmark = useCallback((repoUrl: string) => {
    setUserPreferences(prev => ({
      ...prev,
      bookmarks: [...new Set([...prev.bookmarks, repoUrl])]
    }));
  }, []);

  const removeBookmark = useCallback((repoUrl: string) => {
    setUserPreferences(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(bookmark => bookmark !== repoUrl)
    }));
  }, []);

  const addLastUsedRepo = useCallback((repoUrl: string) => {
    setUserPreferences(prev => {
      const lastUsedRepos = [repoUrl, ...prev.lastUsedRepos.filter(repo => repo !== repoUrl)].slice(0, 10);
      return { ...prev, lastUsedRepos };
    });
  }, []);

  return {
    userPreferences,
    updateSettings,
    getSetting,
    setSetting,
    resetSettings,
    addBookmark,
    removeBookmark,
    addLastUsedRepo
  };
};
