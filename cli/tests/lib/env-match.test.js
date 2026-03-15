import { describe, it, expect } from 'vitest';
import { isValidEnvConfidence, matchEnvVersion } from '../../src/lib/env-match.js';

describe('matchEnvVersion', () => {
  it('returns undetermined when no hint is provided', () => {
    const result = matchEnvVersion({
      availableVersions: ['2.0.0', '1.0.0'],
      detectedVersion: null,
      policy: 'warn',
    });
    expect(result.status).toBe('undetermined');
    expect(result.selectedVersion).toBeNull();
  });

  it('returns exact for exact version match', () => {
    const result = matchEnvVersion({
      availableVersions: ['2.0.0', '1.0.0'],
      detectedVersion: '2.0.0',
      policy: 'strict',
    });
    expect(result.status).toBe('exact');
    expect(result.selectedVersion).toBe('2.0.0');
  });

  it('returns compatible when major version matches', () => {
    const result = matchEnvVersion({
      availableVersions: ['2.0.0', '1.0.0'],
      detectedVersion: '2.5.1',
      policy: 'warn',
    });
    expect(result.status).toBe('compatible');
    expect(result.selectedVersion).toBe('2.0.0');
  });

  it('returns mismatch with fallback in warn mode', () => {
    const result = matchEnvVersion({
      availableVersions: ['2.0.0', '1.0.0'],
      detectedVersion: '9.0.0',
      policy: 'warn',
    });
    expect(result.status).toBe('mismatch');
    expect(result.selectedVersion).toBe('2.0.0');
  });

  it('returns mismatch without fallback in strict mode', () => {
    const result = matchEnvVersion({
      availableVersions: ['2.0.0', '1.0.0'],
      detectedVersion: '9.0.0',
      policy: 'strict',
    });
    expect(result.status).toBe('mismatch');
    expect(result.selectedVersion).toBeNull();
  });
});

describe('isValidEnvConfidence', () => {
  it('accepts allowed values and rejects unknown values', () => {
    expect(isValidEnvConfidence('installed')).toBe(true);
    expect(isValidEnvConfidence('locked')).toBe(true);
    expect(isValidEnvConfidence('declared')).toBe(true);
    expect(isValidEnvConfidence('unknown')).toBe(true);
    expect(isValidEnvConfidence('maybe')).toBe(false);
  });
});
