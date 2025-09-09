import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { useApp } from '../services/appStateService';
import { useNavigation } from '../services/navigationService';
import { useTheme } from '../services/themeService';
import { repoFlattenerService } from '../services/repoFlattenerService';
import './Header.css';

const Header: React.FC = () => {
  const { state, setRepoUrl, setLoading, setError, setResult, setViewMode, clearState } = useApp();
  const { canGoBack, canGoForward, goBack, goForward } = useNavigation();
  const { toggleTheme } = useTheme();
  const [repoUrlInput] = useState(state.repoUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrlInput.trim()) return;

    setRepoUrl(repoUrlInput);
    clearState();
    setLoading(true);

    try {
      const result = await repoFlattenerService.processRepo(repoUrlInput);
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
      <nav className="top-shortcuts">
        <a href="/" className="home-link">Inicio</a>
        <a href="/repository" className="repo-browser-link">Repository Browser</a>
      </nav>

      <header className="topbar">
        <div className="header-left">
          <h1 className="logo">RenderGit</h1>
          {state.result && (
            <div className="nav-controls">
              <button
                type="button"
                className="nav-btn"
                disabled={!canGoBack()}
                onClick={goBack}
                aria-label="Ir atrás"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                className="nav-btn"
                disabled={!canGoForward()}
                onClick={goForward}
                aria-label="Ir adelante"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="header-center">
          <form className="repo-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="https://github.com/usuario/repositorio"
              value={repoUrlInput}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              aria-label="URL del repositorio"
            />
            <button
              type="submit"
              disabled={state.loading || !repoUrlInput.trim()}
            >
              {state.loading ? 'Procesando…' : 'Procesar'}
            </button>
          </form>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            🌙
          </button>
          <button
            type="button"
            className="scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Ir al inicio"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
