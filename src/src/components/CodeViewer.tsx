import React from 'react';
import './CodeViewer.css';

interface CodeViewerProps {
  content: string;
  language?: string;
  fileName?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ content, language, fileName }) => {
  const lines = content.split('\n');
  const lineNumberWidth = lines.length.toString().length;

  return (
    <div className="code-viewer">
      <div className="code-header">
        {fileName && <span className="file-name">{fileName}</span>}
        {language && <span className="language-badge">{language}</span>}
      </div>
      <div className="code-container">
        <div className="line-numbers">
          {lines.map((_, index) => (
            <div key={index + 1} className="line-number" style={{ minWidth: `${lineNumberWidth + 1}ch` }}>
              {index + 1}
            </div>
          ))}
        </div>
        <div className="code-content">
          <pre>
            <code>
              {lines.map((line, index) => (
                <div key={index} className="code-line">
                  {line || '\n'}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
