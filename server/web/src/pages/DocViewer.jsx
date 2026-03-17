import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MarkdownPreview from '../components/MarkdownPreview';

const styles = {
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  typeBadge: {
    fontSize: 12,
    padding: '2px 10px',
    borderRadius: 10,
    fontWeight: 500,
  },
  meta: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  controls: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  select: {
    padding: '6px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: 13,
    cursor: 'pointer',
  },
  fileList: {
    marginBottom: 20,
  },
  fileListTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
    color: 'var(--text-secondary)',
  },
  fileItem: {
    display: 'inline-block',
    padding: '4px 10px',
    margin: '0 6px 6px 0',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  contentBox: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px 32px',
    minHeight: 200,
    maxHeight: 'calc(100vh - 360px)',
    overflow: 'auto',
  },
  error: {
    color: 'var(--warning)',
    padding: 20,
  },
  loading: {
    color: 'var(--text-muted)',
    padding: 20,
  },
};

export default function DocViewer() {
  const { author, name } = useParams();
  const navigate = useNavigate();
  const id = `${author}/${name}`;

  const [entry, setEntry] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/v1/entries/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(`Entry not found: ${id}`);
        return r.json();
      })
      .then(data => {
        setEntry(data);
        if (data.languages?.length > 0) {
          const lang = data.languages[0].language;
          setSelectedLang(lang);
          const ver = data.languages[0].recommended || data.languages[0].versions?.[0];
          if (ver) setSelectedVersion(ver);
        }
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!entry) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedLang) params.set('lang', selectedLang);
    if (selectedVersion) params.set('version', selectedVersion);
    if (selectedFile) params.set('file', selectedFile);

    fetch(`/api/v1/entries/${id}/content?${params}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load content');
        return r.text();
      })
      .then(text => { setContent(text); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [entry, selectedLang, selectedVersion, selectedFile, id]);

  if (error && !entry) {
    return (
      <div>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  const type = entry?.type || 'doc';
  const languages = entry?.languages || [];
  const currentLangObj = languages.find(l => l.language === selectedLang);
  const versions = currentLangObj?.versions || [];

  return (
    <div>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{id}</h1>
          <span style={{
            ...styles.typeBadge,
            background: type === 'doc' ? 'rgba(108, 140, 255, 0.12)' : 'rgba(74, 222, 128, 0.12)',
            color: type === 'doc' ? 'var(--accent)' : 'var(--success)',
          }}>
            {type}
          </span>
        </div>
        {entry?.description && <div style={styles.meta}>{entry.description}</div>}
      </div>

      {languages.length > 0 && (
        <div style={styles.controls}>
          <select
            style={styles.select}
            value={selectedLang}
            onChange={e => {
              setSelectedLang(e.target.value);
              setSelectedFile(null);
              const langObj = languages.find(l => l.language === e.target.value);
              if (langObj) setSelectedVersion(langObj.recommended || langObj.versions?.[0] || '');
            }}
          >
            {languages.map(l => (
              <option key={l.language} value={l.language}>{l.language}</option>
            ))}
          </select>

          {versions.length > 1 && (
            <select
              style={styles.select}
              value={selectedVersion}
              onChange={e => { setSelectedVersion(e.target.value); setSelectedFile(null); }}
            >
              {versions.map(v => (
                <option key={v} value={v}>{v}{v === currentLangObj?.recommended ? ' (recommended)' : ''}</option>
              ))}
            </select>
          )}

          {selectedFile && (
            <button
              style={{ ...styles.select, borderColor: 'var(--accent)', color: 'var(--accent)' }}
              onClick={() => setSelectedFile(null)}
            >
              ← Back to main doc
            </button>
          )}
        </div>
      )}

      <div style={styles.contentBox}>
        {loading ? (
          <div style={styles.loading}>Loading content...</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <MarkdownPreview content={content} />
        )}
      </div>
    </div>
  );
}
