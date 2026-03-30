const ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  cs: 'csharp',
  pwsh: 'powershell',
};

const DISPLAY = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  ruby: 'rb',
  csharp: 'cs',
  powershell: 'pwsh',
};

export function normalizeLanguage(lang) {
  if (!lang) return null;
  const lower = lang.toLowerCase();
  return ALIASES[lower] || lower;
}

export function displayLanguage(lang) {
  return DISPLAY[lang] || lang;
}
