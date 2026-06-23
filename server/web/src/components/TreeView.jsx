import { useState } from 'react';

const styles = {
  item: {
    fontSize: 13,
    lineHeight: '28px',
  },
  dirRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    userSelect: 'none',
    color: 'var(--text-primary)',
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  fileRowSelected: {
    background: 'rgba(108, 140, 255, 0.12)',
    color: 'var(--accent)',
  },
  fileRowDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  children: {
    paddingLeft: 16,
    borderLeft: '1px solid var(--border)',
    marginLeft: 8,
  },
  arrow: {
    display: 'inline-block',
    width: 14,
    fontSize: 10,
    textAlign: 'center',
    transition: 'transform 0.15s',
  },
  size: {
    marginLeft: 'auto',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

function TreeNode({ node, onFileClick, selectedPath, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (node.type === 'file') {
    const isMd = node.name.endsWith('.md');
    const isSelected = selectedPath === node.path;

    return (
      <div
        style={{
          ...styles.fileRow,
          ...(isSelected ? styles.fileRowSelected : {}),
          ...(!isMd ? styles.fileRowDisabled : {}),
        }}
        onClick={() => isMd && onFileClick?.(node)}
        onMouseEnter={e => { if (isMd && !isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ''; }}
      >
        <span style={{ fontSize: 12 }}>{isMd ? '📄' : '📎'}</span>
        <span>{node.name}</span>
        <span style={styles.size}>{formatSize(node.size)}</span>
      </div>
    );
  }

  return (
    <div style={styles.item}>
      <div
        style={styles.dirRow}
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = '')}
      >
        <span style={{ ...styles.arrow, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        <span style={{ fontSize: 12 }}>{expanded ? '📂' : '📁'}</span>
        <span>{node.name}</span>
      </div>
      {expanded && node.children && (
        <div style={styles.children}>
          {node.children.map(child => (
            <TreeNode key={child.path} node={child} onFileClick={onFileClick} selectedPath={selectedPath} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ tree, onFileClick, selectedPath }) {
  if (!tree || tree.length === 0) {
    return <div style={{ color: 'var(--text-muted)', padding: 16 }}>No content found.</div>;
  }

  return (
    <div>
      {tree.map(node => (
        <TreeNode key={node.path} node={node} onFileClick={onFileClick} selectedPath={selectedPath} />
      ))}
    </div>
  );
}
