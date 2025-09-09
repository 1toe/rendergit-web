import { useState, useCallback, useEffect } from 'react';

export interface NavigationState {
  currentPath: string;
  history: string[];
  currentIndex: number;
}

const NAV_KEY = 'repo-browser-nav-state';

const getStoredState = (): NavigationState => {
  const stored = localStorage.getItem(NAV_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse navigation state from localStorage', e);
    }
  }
  return {
    currentPath: '',
    history: [],
    currentIndex: -1
  };
};

const saveState = (state: NavigationState): void => {
  try {
    localStorage.setItem(NAV_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save navigation state to localStorage', e);
  }
};

export const useNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>(getStoredState);

  useEffect(() => {
    saveState(navigationState);
  }, [navigationState]);

  const navigateTo = useCallback((path: string) => {
    const current = navigationState;
    const newHistory = [...current.history.slice(0, current.currentIndex + 1), path];
    const newState: NavigationState = {
      currentPath: path,
      history: newHistory,
      currentIndex: newHistory.length - 1
    };
    setNavigationState(newState);
  }, [navigationState]);

  const goBack = useCallback((): boolean => {
    const current = navigationState;
    if (current.currentIndex > 0) {
      const newIndex = current.currentIndex - 1;
      const newState: NavigationState = {
        ...current,
        currentPath: current.history[newIndex],
        currentIndex: newIndex
      };
      setNavigationState(newState);
      return true;
    }
    return false;
  }, [navigationState]);

  const goForward = useCallback((): boolean => {
    const current = navigationState;
    if (current.currentIndex < current.history.length - 1) {
      const newIndex = current.currentIndex + 1;
      const newState: NavigationState = {
        ...current,
        currentPath: current.history[newIndex],
        currentIndex: newIndex
      };
      setNavigationState(newState);
      return true;
    }
    return false;
  }, [navigationState]);

  const canGoBack = useCallback((): boolean => {
    return navigationState.currentIndex > 0;
  }, [navigationState]);

  const canGoForward = useCallback((): boolean => {
    const current = navigationState;
    return current.currentIndex < current.history.length - 1;
  }, [navigationState]);

  return {
    navigationState,
    navigateTo,
    goBack,
    goForward,
    canGoBack,
    canGoForward
  };
};
