import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Pin, PinOff, User, Bot, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../services/appStateService';
import { useSearch } from '../services/searchService';
import { useSettings } from '../services/settingsService';
import DirectoryTree from './DirectoryTree';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { state, setViewMode, setFilter, setSearchQuery } = useApp();
  const { 
    searchQuery: searchServiceQuery, 
    setSearchQuery: setSearchServiceQuery, 
    searchResults, 
    isSearching,
    clearSearch: clearSearchService 
  } = useSearch(state.result?.rendered || []);
  const { userPreferences, setSetting } = useSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(userPreferences.sidebarCollapsed);

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
    setSearchServiceQuery(query);
    setSearchQuery(query);
  };

  const clearSearch = () => {
    clearSearchService();
    setSearchQuery('');
  };

  const handleFilter = (filterValue: string) => {
    setFilter(filterValue);
  };

  if (!state.result) {
    return null;
  }

  return (
    <motion.aside 
      className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      layout
    >
      <motion.div 
        className="sidebar-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.button
          type="button"
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
        <motion.button
          type="button"
          className={`sidebar-pin ${userPreferences.sidebarPinned ? 'active' : ''}`}
          onClick={toggleSidebarPin}
          title="Fijar sidebar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {userPreferences.sidebarPinned ? <Pin size={16} /> : <PinOff size={16} />}
        </motion.button>
      </motion.div>

      {!sidebarCollapsed && (
        <motion.div 
          className="sidebar-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <motion.div 
            className="search-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h3>Búsqueda</h3>
            <div className="search-box">
              <input
                type="search"
                placeholder="Buscar archivos..."
                value={searchServiceQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchServiceQuery && (
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
          </motion.div>

          {/* Resultados de búsqueda */}
          <AnimatePresence>
            {searchServiceQuery && (
              <motion.div 
                className="search-results-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3>Resultados de búsqueda</h3>
                {isSearching ? (
                  <motion.div 
                    className="search-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Buscando...
                  </motion.div>
                ) : searchResults.length > 0 ? (
                  <ul className="search-results">
                    {searchResults.map((result, index) => (
                      <motion.li 
                        key={index} 
                        className="search-result-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="search-result-file">
                          <strong>{result.file.path}</strong>
                          <span className="match-count">({result.matches.length} coincidencias)</span>
                        </div>
                        <div className="search-matches">
                          {result.matches.slice(0, 3).map((match, matchIndex) => (
                            <div key={matchIndex} className="search-match">
                              <span className="line-number">Línea {match.line}:</span>
                              <span className="match-context">{match.context}</span>
                            </div>
                          ))}
                          {result.matches.length > 3 && (
                            <div className="more-matches">
                              +{result.matches.length - 3} más...
                            </div>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <motion.div 
                    className="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No se encontraron resultados
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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

          {/* Directory Tree */}
          <DirectoryTree 
            files={state.result.rendered?.map(file => ({ path: file.path, size: file.size })) || []}
            onFileSelect={(filePath) => {
              // Scroll to the file
              const element = document.getElementById(`file-${filePath}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

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
                <User size={16} />
                Humano
              </button>
              <button
                type="button"
                className={`view-btn ${state.viewMode === 'llm' ? 'active' : ''}`}
                onClick={() => setViewMode('llm')}
              >
                <Bot size={16} />
                LLM
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
