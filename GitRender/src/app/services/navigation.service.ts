import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NavigationState {
  currentPath: string;
  history: string[];
  currentIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly NAV_KEY = 'repo-browser-nav-state';

  private stateSubject = new BehaviorSubject<NavigationState>(this.getStoredState());
  public state$ = this.stateSubject.asObservable();

  public navigationState = signal<NavigationState>(this.getStoredState());

  constructor() {
    // Sincronizar signal con BehaviorSubject
    effect(() => {
      const state = this.navigationState();
      this.stateSubject.next(state);
      this.saveState(state);
    });
  }

  navigateTo(path: string): void {
    const current = this.navigationState();
    const newHistory = [...current.history.slice(0, current.currentIndex + 1), path];
    const newState: NavigationState = {
      currentPath: path,
      history: newHistory,
      currentIndex: newHistory.length - 1
    };
    this.navigationState.set(newState);
  }

  goBack(): boolean {
    const current = this.navigationState();
    if (current.currentIndex > 0) {
      const newIndex = current.currentIndex - 1;
      const newState: NavigationState = {
        ...current,
        currentPath: current.history[newIndex],
        currentIndex: newIndex
      };
      this.navigationState.set(newState);
      return true;
    }
    return false;
  }

  goForward(): boolean {
    const current = this.navigationState();
    if (current.currentIndex < current.history.length - 1) {
      const newIndex = current.currentIndex + 1;
      const newState: NavigationState = {
        ...current,
        currentPath: current.history[newIndex],
        currentIndex: newIndex
      };
      this.navigationState.set(newState);
      return true;
    }
    return false;
  }

  canGoBack(): boolean {
    return this.navigationState().currentIndex > 0;
  }

  canGoForward(): boolean {
    const current = this.navigationState();
    return current.currentIndex < current.history.length - 1;
  }

  private getStoredState(): NavigationState {
    const stored = localStorage.getItem(this.NAV_KEY);
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
  }

  private saveState(state: NavigationState): void {
    try {
      localStorage.setItem(this.NAV_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save navigation state to localStorage', e);
    }
  }
}
