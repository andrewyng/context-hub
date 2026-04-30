import { useState, useEffect } from 'react';
import TreeView from '../components/TreeView';
import MarkdownPreview from '../components/MarkdownPreview';

const styles = {
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: 14,
  },
  sourceTab: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    padding: '6px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
  },
  tabActive: {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
    background: 'rgba(108, 140, 255, 0.08)',
  },
  splitPane: {
    display: 'flex',
    gap: 16,
    height: 'calc(100vh - 180px)',
  },
  leftPane: {
    width: 340,
    minWidth: 280,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 12,
    overflow: 'auto',
    flexShrink: 0,
  },
  rightPane: {
    flex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px 32px',
    overflow: 'auto',
    minWidth: 0,
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid var(--border)',
  },
  previewPath: {
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
    wordBreak: 'break-all',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: 14,
  },
  loading: {
    color: 'var(--text-muted)',
    fontSize: 13,
    padding: 20,
  },
  error: {
    color: 'var(--warning)',
    fontSize: 13,
    padding: 20,
  },
};

export default function ContentTree() {
  const [treeData, setTreeData] = useState(null);
  const [activeSource, setActiveSource] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/tree')
      .then(r => r.json())
      .then(data => {
        setTreeData(data);
        const keys = Object.keys(data);
        if (keys.length > 0) setActiveSource(keys[0]);
      })
      .catch(() => {});
  }, []);

  function handleFileClick(node) {
    if (!node.name.endsWith('.md')) return;

    setSelectedFile(node);
    setLoading(true);
    setError(null);
    setFileContent('');

    fetch(`/api/v1/file?path=${encodeURIComponent(node.path)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load: ${r.status}`);
        return r.text();
      })
      .then(text => {
        setFileContent(text);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  const sources = treeData ? Object.keys(treeData) : [];

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Content Tree</h1>
        <p style={styles.subtitle}>Browse directory structure, click any .md file to preview</p>
      </div>

      {sources.length > 1 && (
        <div style={styles.sourceTab}>
          {sources.map(src => (
            <button
              key={src}
              style={{ ...styles.tab, ...(activeSource === src ? styles.tabActive : {}) }}
              onClick={() => { setActiveSource(src); setSelectedFile(null); setFileContent(''); }}
            >
              {src}
            </button>
          ))}
        </div>
      )}

      <div style={styles.splitPane}>
        {/* Left: directory tree */}
        <div style={styles.leftPane}>
          {!treeData && <div style={styles.loading}>Loading...</div>}
          {treeData && activeSource && (
            <TreeView
              tree={treeData[activeSource]}
              onFileClick={handleFileClick}
              selectedPath={selectedFile?.path}
            />
          )}
        </div>

        {/* Right: markdown preview */}
        <div style={styles.rightPane}>
          {!selectedFile && (
            <div style={styles.placeholder}>
              Select a .md file from the tree to preview
            </div>
          )}
          {selectedFile && (
            <>
              <div style={styles.previewHeader}>
                <span style={styles.previewPath}>{selectedFile.path}</span>
              </div>
              {loading && <div style={styles.loading}>Loading content...</div>}
              {error && <div style={styles.error}>{error}</div>}
              {!loading && !error && fileContent && (
                <MarkdownPreview content={fileContent} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
