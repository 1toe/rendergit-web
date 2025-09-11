import { useState, useEffect } from 'react';
import { ThemeProvider } from './services/themeService';
import { AppProvider } from './services/appStateService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import AutoScrollToggle from './components/AutoScrollToggle';
import './App.css';

function App(): JSX.Element {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(() => {
    const saved = localStorage.getItem('autoScrollEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('autoScrollEnabled', JSON.stringify(autoScrollEnabled));
  }, [autoScrollEnabled]);

  useEffect(() => {
    if (!autoScrollEnabled) return;

    const handleScroll = () => {
      const sidebar = document.querySelector('.sidebar-content');
      const content = document.querySelector('.content');
      
      if (!sidebar || !content) return;

      // Obtener el archivo actualmente visible en el contenido
      const contentRect = content.getBoundingClientRect();
      const files = content.querySelectorAll('.file');
      
      let activeFile = null;
      for (const file of files) {
        const fileRect = file.getBoundingClientRect();
        if (fileRect.top <= contentRect.height / 2 && fileRect.bottom >= contentRect.height / 2) {
          activeFile = file;
          break;
        }
      }

      if (activeFile) {
        const filePath = activeFile.getAttribute('data-file-path');
        const tocElement = sidebar.querySelector(`[href="#file-${filePath}"]`);
        
        if (tocElement) {
          tocElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    let throttleTimeout: number;
    const throttledScroll = () => {
      if (throttleTimeout) return;
      throttleTimeout = window.setTimeout(() => {
        handleScroll();
        throttleTimeout = 0;
      }, 150);
    };

    window.addEventListener('scroll', throttledScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [autoScrollEnabled]);

  return (
    <ThemeProvider>
      <AppProvider>
        <div className="app">
          <Header />
          <div className="main-layout">
            <Sidebar />
            <Content />
          </div>
          <AutoScrollToggle 
            isEnabled={autoScrollEnabled}
            onToggle={setAutoScrollEnabled}
          />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
