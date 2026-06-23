import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  header: {
    marginBottom: 24,
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
  searchBox: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
  },
  searchBtn: {
    padding: '10px 24px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
  },
  summary: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 16,
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  resultItem: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  resultId: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
  },
  typeBadge: {
    fontSize: 11,
    padding: '1px 8px',
    borderRadius: 10,
    fontWeight: 500,
  },
  resultDesc: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 10,
    background: 'var(--tag-bg)',
    color: 'var(--tag-text)',
  },
  langBadge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 10,
    background: 'rgba(108, 140, 255, 0.12)',
    color: 'var(--accent)',
  },
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const doSearch = useCallback((q) => {
    setLoading(true);
    const url = q
      ? `/api/v1/search?q=${encodeURIComponent(q)}&limit=50`
      : `/api/v1/entries?limit=50`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setResults(data.results || data.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    doSearch('');
  }, [doSearch]);

  function handleSubmit(e) {
    e.preventDefault();
    doSearch(query);
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Search</h1>
        <p style={styles.subtitle}>Search for docs and skills by keyword, tag, or name</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.searchBox}>
        <input
          style={styles.input}
          placeholder="Search docs and skills..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" style={styles.searchBtn} disabled={loading}>
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {results && (
        <>
          <div style={styles.summary}>
            {results.length} result{results.length !== 1 ? 's' : ''}
            {query && ` for "${query}"`}
          </div>
          <div style={styles.results}>
            {results.map(item => (
              <div
                key={item.id}
                style={styles.resultItem}
                onClick={() => navigate(`/doc/${item.id}`)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={styles.resultHeader}>
                  <span style={styles.resultId}>{item.id}</span>
                  <span style={{
                    ...styles.typeBadge,
                    background: item.type === 'doc' ? 'rgba(108, 140, 255, 0.12)' : 'rgba(74, 222, 128, 0.12)',
                    color: item.type === 'doc' ? 'var(--accent)' : 'var(--success)',
                  }}>
                    {item.type}
                  </span>
                  {item.score !== undefined && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                      score: {item.score.toFixed(1)}
                    </span>
                  )}
                </div>
                <div style={styles.resultDesc}>
                  {item.description?.slice(0, 200)}{item.description?.length > 200 ? '...' : ''}
                </div>
                <div style={styles.tags}>
                  {item.languages?.map(l => (
                    <span key={typeof l === 'string' ? l : l.language} style={styles.langBadge}>
                      {typeof l === 'string' ? l : l.language}
                    </span>
                  ))}
                  {item.tags?.slice(0, 6).map(t => (
                    <span key={t} style={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
