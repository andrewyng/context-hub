import { describe, it, expect } from 'vitest';
import { normalizeLanguage, displayLanguage } from '../../src/lib/normalize.js';

describe('normalizeLanguage', () => {
  it('maps js to javascript', () => {
    expect(normalizeLanguage('js')).toBe('javascript');
  });

  it('maps ts to typescript', () => {
    expect(normalizeLanguage('ts')).toBe('typescript');
  });

  it('maps py to python', () => {
    expect(normalizeLanguage('py')).toBe('python');
  });

  it('maps rb to ruby', () => {
    expect(normalizeLanguage('rb')).toBe('ruby');
  });

  it('maps cs to csharp', () => {
    expect(normalizeLanguage('cs')).toBe('csharp');
  });

  it('maps pwsh to powershell', () => {
    expect(normalizeLanguage('pwsh')).toBe('powershell');
  });

  it('is case-insensitive', () => {
    expect(normalizeLanguage('JS')).toBe('javascript');
    expect(normalizeLanguage('Py')).toBe('python');
    expect(normalizeLanguage('TS')).toBe('typescript');
    expect(normalizeLanguage('PWSH')).toBe('powershell');
  });

  it('passes through unknown languages unchanged (lowercased)', () => {
    expect(normalizeLanguage('rust')).toBe('rust');
    expect(normalizeLanguage('go')).toBe('go');
    expect(normalizeLanguage('java')).toBe('java');
  });

  it('returns null for falsy input', () => {
    expect(normalizeLanguage(null)).toBe(null);
    expect(normalizeLanguage(undefined)).toBe(null);
    expect(normalizeLanguage('')).toBe(null);
  });
});

describe('displayLanguage', () => {
  it('maps javascript to js', () => {
    expect(displayLanguage('javascript')).toBe('js');
  });

  it('maps typescript to ts', () => {
    expect(displayLanguage('typescript')).toBe('ts');
  });

  it('maps python to py', () => {
    expect(displayLanguage('python')).toBe('py');
  });

  it('maps ruby to rb', () => {
    expect(displayLanguage('ruby')).toBe('rb');
  });

  it('maps csharp to cs', () => {
    expect(displayLanguage('csharp')).toBe('cs');
  });

  it('maps powershell to pwsh', () => {
    expect(displayLanguage('powershell')).toBe('pwsh');
  });

  it('passes through unknown languages unchanged', () => {
    expect(displayLanguage('rust')).toBe('rust');
    expect(displayLanguage('go')).toBe('go');
    expect(displayLanguage('java')).toBe('java');
  });
});
