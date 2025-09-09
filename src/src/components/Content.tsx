import React from 'react';
import { useApp } from '../services/appStateService';
import { useIncrementalRendering } from '../services/incrementalRenderingService';
import CodeViewer from './CodeViewer';
import { motion, AnimatePresence } from 'framer-motion';
import './Content.css';

const Content: React.FC = () => {
  const { state } = useApp();
  const { visibleRendered, loadMore, getVisibleCount, getTotalCount } = useIncrementalRendering({ result: state.result });

  if (state.error) {
    return (
      <motion.main 
        className="content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="error"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <strong>Error:</strong> {state.error}
        </motion.div>
      </motion.main>
    );
  }

  if (state.loading) {
    return (
      <motion.main 
        className="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="loading-state"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Procesando repositorio…
          </motion.p>
        </motion.div>
      </motion.main>
    );
  }

  if (!state.result) {
    return (
      <main className="content">
        <section className="intro">
          <p>Ingresa una URL pública de GitHub para aplanar el repositorio en una sola página navegable y una vista CXML apta para LLMs.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="content">
      {state.viewMode === 'human' ? (
        <div className="human-view">
          <div className="content-header">
            <h2>Explorador de Archivos</h2>
            <div className="stats">
              <span>Mostrando {getVisibleCount()} de {getTotalCount()} archivos</span>
              {getVisibleCount() < getTotalCount() && (
                <button onClick={loadMore} className="load-more-btn">
                  Cargar más
                </button>
              )}
            </div>
          </div>

          <div className="files">
            {visibleRendered?.map((file: any, index: number) => (
              <article key={index} className="file" id={`file-${file.path}`}>
                <header className="file-header">
                  <h3>{file.path}</h3>
                  <span className="file-size">{file.size} bytes</span>
                </header>
                <div className="file-body">
                  {file.isMarkdown ? (
                    <div dangerouslySetInnerHTML={{ __html: file.content }} />
                  ) : (
                    <CodeViewer 
                      content={file.content} 
                      fileName={file.path}
                      language={file.path.split('.').pop()}
                    />
                  )}
                </div>
                <a className="back-top" href="#top" aria-label="Volver al inicio">
                  ↑
                </a>
              </article>
            ))}
          </div>

          {(state.result.skippedBinary?.length > 0 || state.result.skippedLarge?.length > 0) && (
            <section className="skips">
              <div className="skips-card">
                <h3>Archivos Omitidos</h3>

                {state.result.skippedBinary?.length > 0 && (
                  <div className="skip-section">
                    <h4>{state.result.skippedBinary.length} Binarios</h4>
                    <ul className="skipped-list">
                      {state.result.skippedBinary.map((file: any, index: number) => (
                        <li key={index} className="skipped-item">
                          <span className="file-path">{file.path}</span>
                          <span className="badge destructive">{file.size} bytes</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {state.result.skippedLarge?.length > 0 && (
                  <div className="skip-section">
                    <h4>{state.result.skippedLarge.length} Archivos Grandes</h4>
                    <ul className="skipped-list">
                      {state.result.skippedLarge.map((file: any, index: number) => (
                        <li key={index} className="skipped-item">
                          <span className="file-path">{file.path}</span>
                          <span className="badge warning">{file.size} bytes</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="llm-view">
          <h2>Vista LLM (CXML)</h2>
          <textarea
            readOnly
            className="cxml"
            defaultValue={state.result.cxmlText}
            onFocus={(e) => e.target.select()}
          />
          <p className="hint">Consejo: Ctrl + A luego Ctrl + C para copiar todo.</p>
        </div>
      )}
    </main>
  );
};

export default Content;
