import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, GitCommit, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../services/appStateService';
import { useNavigation } from '../services/navigationService';
import { useTheme } from '../services/themeService';
import { repoFlattenerService } from '../services/repoFlattenerService';
import './Header.css';

const Header: React.FC = () => {
  const { 
    state, 
    setRepoUrl, 
    setLoading, 
    setError, 
    setResult, 
    setViewMode, 
    clearState,
    setSelectedCommit,
    setAvailableCommits
  } = useApp();
  const { canGoBack, canGoForward, goBack, goForward } = useNavigation();
  const { toggleTheme } = useTheme();
  const [repoUrlInput, setRepoUrlInput] = useState(state.repoUrl);
  const [showCommitSelector, setShowCommitSelector] = useState(false);

  // Cargar commits cuando cambia la URL del repo
  useEffect(() => {
    if (repoUrlInput && repoUrlInput !== state.repoUrl) {
      loadCommits();
    }
  }, [repoUrlInput]);

  const loadCommits = async () => {
    if (!repoUrlInput.trim()) return;
    
    try {
      const commits = await repoFlattenerService.getCommits(repoUrlInput);
      setAvailableCommits(commits);
    } catch (error) {
      console.error('Error loading commits:', error);
    }
  };

  const handleCommitSelect = (commitSha: string) => {
    setSelectedCommit(commitSha);
    setShowCommitSelector(false);
    handleSubmit();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repoUrlInput.trim()) return;

    setRepoUrl(repoUrlInput);
    clearState();
    setLoading(true);

    try {
      const result = await repoFlattenerService.processRepo(repoUrlInput, state.selectedCommit || undefined);
      setResult(result);
      setViewMode('human');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <motion.header 
        className="topbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div 
          className="header-left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h1 
            className="logo"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            RenderGit
          </motion.h1>
          {state.result && (
            <motion.div 
              className="nav-controls"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <motion.button
                type="button"
                className="nav-btn"
                disabled={!canGoBack()}
                onClick={goBack}
                aria-label="Ir atrás"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={16} />
              </motion.button>
              <motion.button
                type="button"
                className="nav-btn"
                disabled={!canGoForward()}
                onClick={goForward}
                aria-label="Ir adelante"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="header-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <form className="repo-form" onSubmit={handleSubmit}>
            <div className="repo-input-group">
              <input
                type="text"
                placeholder="https://github.com/usuario/repositorio"
                value={repoUrlInput}
                onChange={(e) => setRepoUrlInput(e.target.value)}
                required
                aria-label="URL del repositorio"
              />
              {state.availableCommits.length > 0 && (
                <div className="commit-selector">
                  <button
                    type="button"
                    className="commit-toggle-btn"
                    onClick={() => setShowCommitSelector(!showCommitSelector)}
                    aria-label="Seleccionar commit"
                  >
                    <GitCommit size={16} />
                    {state.selectedCommit ? 
                      state.availableCommits.find(c => c.sha === state.selectedCommit)?.sha.slice(0, 7) || 'Latest'
                      : 'Latest'
                    }
                  </button>
                  <AnimatePresence>
                    {showCommitSelector && (
                      <motion.div 
                        className="commit-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="commit-option" 
                          onClick={() => handleCommitSelect('')}
                          whileHover={{ x: 4, backgroundColor: "var(--color-bg-secondary)" }}
                        >
                          <div className="commit-info">
                            <strong>Latest (HEAD)</strong>
                            <span className="commit-date">Último commit</span>
                          </div>
                        </motion.div>
                        {state.availableCommits.slice(0, 10).map((commit, index) => (
                          <motion.div 
                            key={commit.sha} 
                            className="commit-option"
                            onClick={() => handleCommitSelect(commit.sha)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4, backgroundColor: "var(--color-bg-secondary)" }}
                          >
                          <div className="commit-info">
                            <strong>{commit.sha.slice(0, 7)}</strong>
                            <span className="commit-message">{commit.message.split('\n')[0]}</span>
                            <span className="commit-date">
                              {new Date(commit.author.date).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={state.loading || !repoUrlInput.trim()}
            >
              {state.loading ? 'Procesando…' : 'Procesar'}
            </button>
          </form>
        </motion.div>

        <motion.div 
          className="header-right"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <Moon size={16} />
          </motion.button>
          <motion.button
            type="button"
            className="scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Ir al inicio"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={16} />
          </motion.button>
        </motion.div>
      </motion.header>
    </>
  );
};

export default Header;
