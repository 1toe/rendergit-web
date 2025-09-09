import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Pin, PinOff } from 'lucide-react';
import { useApp } from '../services/appStateService';
import { useSearch } from '../services/searchService';
import { useSettings } from '../services/settingsService';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { state, setViewMode, setFilter, setSearchQuery } = useApp();
  // const { fileTree, buildFileTree } = useFileService();
  const { setSearchQuery: setSearch } = useSearch(state.result?.rendered || []);
  const { userPreferences, setSetting } = useSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(userPreferences.sidebarCollapsed);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    setSetting('sidebarCollapsed', newCollapsed);
  };

  const toggleSidebarPin = () => {
    const newPinned = !userPreferences.sidebarPinned;
    setSetting('sidebarPinned', newPinned);
  };

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
    setSearch(query);
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
    setSearch('');
  };

  const handleFilter = (filterValue: string) => {
    setFilter(filterValue);
  };

  if (!state.result) {
    return null;
  }

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <button
          type="button"
          className={`sidebar-pin ${userPreferences.sidebarPinned ? 'active' : ''}`}
          onClick={toggleSidebarPin}
          title="Fijar sidebar"
        >
          {userPreferences.sidebarPinned ? <Pin size={16} /> : <PinOff size={16} />}
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="sidebar-content">
          <div className="search-section">
            <h3>Búsqueda</h3>
            <div className="search-box">
              <input
                type="search"
                placeholder="Buscar archivos..."
                value={localSearchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {localSearchQuery && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={clearSearch}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="filter-section">
            <h3>Filtrar</h3>
            <input
              type="text"
              placeholder="Filtrar archivos"
              value={state.filter}
              onChange={(e) => handleFilter(e.target.value)}
            />
          </div>

          <div className="repo-info-section">
            <h3>Información del Repositorio</h3>
            <div className="repo-info">
              <div className="repo-link">
                <strong>Repo:</strong>
                <a
                  href={`https://github.com/${state.result.owner}/${state.result.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {state.result.owner}/{state.result.repo}
                </a>
              </div>
              <div className="repo-details">
                <span className="badge secondary">
                  Commit: {state.result.commitSha?.slice(0, 8)}
                </span>
                <span className="badge outline">
                  Total: {state.result.files?.length || 0}
                </span>
                <span className="badge success">
                  Renderizados: {state.result.rendered?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="toc-section">
            <h3>Contenido ({state.result.toc?.length || 0})</h3>
            <nav>
              <ul>
                {state.result.toc?.map((item: any, index: number) => (
                  <li key={index}>
                    <a href={`#file-${item.rel}`}>{item.rel}</a>
                    <span className="size">{item.size} bytes</span>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="view-options-section">
            <h3>Opciones de Vista</h3>
            <div className="view-options">
              <button
                type="button"
                className={`view-btn ${state.viewMode === 'human' ? 'active' : ''}`}
                onClick={() => setViewMode('human')}
              >
                👤 Humano
              </button>
              <button
                type="button"
                className={`view-btn ${state.viewMode === 'llm' ? 'active' : ''}`}
                onClick={() => setViewMode('llm')}
              >
                🤖 LLM
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
