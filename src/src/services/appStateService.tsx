import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProcessResult } from './repoFlattenerService';

interface AppState {
  repoUrl: string;
  loading: boolean;
  error: string | null;
  result: ProcessResult | null;
  viewMode: 'human' | 'llm';
  filter: string;
  searchQuery: string;
  selectedFiles: string[];
  currentFile: string;
}

type AppAction =
  | { type: 'SET_REPO_URL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULT'; payload: ProcessResult | null }
  | { type: 'SET_VIEW_MODE'; payload: 'human' | 'llm' }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_FILES'; payload: string[] }
  | { type: 'SET_CURRENT_FILE'; payload: string }
  | { type: 'CLEAR_STATE' };

const initialState: AppState = {
  repoUrl: '',
  loading: false,
  error: null,
  result: null,
  viewMode: 'human',
  filter: '',
  searchQuery: '',
  selectedFiles: [],
  currentFile: ''
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_REPO_URL':
      return { ...state, repoUrl: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_FILES':
      return { ...state, selectedFiles: action.payload };
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };
    case 'CLEAR_STATE':
      return {
        ...state,
        error: null,
        result: null,
        viewMode: 'human'
      };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Computed values
  filteredToc: { anchor: string; rel: string; size: number; }[];
  // Action creators
  setRepoUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: ProcessResult | null) => void;
  setViewMode: (mode: 'human' | 'llm') => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFiles: (files: string[]) => void;
  setCurrentFile: (file: string) => void;
  clearState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const filteredToc = React.useMemo(() => {
    const r = state.result;
    const f = state.filter.toLowerCase();
    if (!r) return [];
    if (!f) return r.toc;
    return r.toc.filter(i => i.rel.toLowerCase().includes(f));
  }, [state.result, state.filter]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    filteredToc,
    setRepoUrl: (url: string) => dispatch({ type: 'SET_REPO_URL', payload: url }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setResult: (result: ProcessResult | null) => dispatch({ type: 'SET_RESULT', payload: result }),
    setViewMode: (mode: 'human' | 'llm') => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    setFilter: (filter: string) => dispatch({ type: 'SET_FILTER', payload: filter }),
    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setSelectedFiles: (files: string[]) => dispatch({ type: 'SET_SELECTED_FILES', payload: files }),
    setCurrentFile: (file: string) => dispatch({ type: 'SET_CURRENT_FILE', payload: file }),
    clearState: () => dispatch({ type: 'CLEAR_STATE' })
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
