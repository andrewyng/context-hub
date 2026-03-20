import React from 'react';
import Markdown from 'react-markdown';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { meta: null, body: raw };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) meta[key] = val;
  }

  return { meta: Object.keys(meta).length > 0 ? meta : null, body: raw.slice(match[0].length) };
}

const styles = {
  wrapper: {
    fontSize: 14,
    lineHeight: 1.7,
    color: 'var(--text-primary)',
    maxWidth: 800,
  },
  metaPanel: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 1.6,
  },
  metaTitle: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: 8,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gap: '4px 12px',
  },
  metaKey: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  metaVal: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    wordBreak: 'break-word',
  },
};

const customComponents = {
  h1: ({ children }) => <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 24, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 20, marginBottom: 10 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>{children}</h3>,
  p: ({ children }) => <p style={{ marginBottom: 12 }}>{children}</p>,
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <pre style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, overflow: 'auto', marginBottom: 12, fontSize: 13, fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
          <code>{children}</code>
        </pre>
      );
    }
    return <code style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{children}</code>;
  },
  pre: ({ children }) => <>{children}</>,
  ul: ({ children }) => <ul style={{ paddingLeft: 24, marginBottom: 12 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 24, marginBottom: 12 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 16, margin: '12px 0', color: 'var(--text-secondary)' }}>{children}</blockquote>,
  table: ({ children }) => <div style={{ overflow: 'auto', marginBottom: 12 }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>{children}</table></div>,
  th: ({ children }) => <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--border)', fontWeight: 600 }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{children}</td>,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{children}</a>,
};

function FrontmatterPanel({ meta }) {
  return (
    <div style={styles.metaPanel}>
      <div style={styles.metaTitle}>Frontmatter</div>
      <div style={styles.metaGrid}>
        {Object.entries(meta).map(([key, val]) => (
          <React.Fragment key={key}>
            <span style={styles.metaKey}>{key}</span>
            <span style={styles.metaVal}>{val}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function MarkdownPreview({ content }) {
  if (!content) {
    return <div style={{ color: 'var(--text-muted)' }}>No content to display.</div>;
  }

  const { meta, body } = parseFrontmatter(content);

  return (
    <div style={styles.wrapper}>
      {meta && <FrontmatterPanel meta={meta} />}
      <Markdown components={customComponents}>{body}</Markdown>
    </div>
  );
}
